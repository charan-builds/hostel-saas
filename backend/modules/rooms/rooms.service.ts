import "server-only";

import { recordAuditEvent } from "@/lib/audit/log";
import { requirePermission } from "@/lib/auth/guards";
import { AppError } from "@/lib/http/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getRoomById,
  listActiveAssignmentsForRoomIds,
  listAvailableBedsForBranch,
  listBedsForRoomIds,
  listHostelFloors,
  listHostelBranches,
  listRoomCategories,
  listRoomRows,
  listRoomTemplates,
  listRoomsForBranch,
  listStudentsByIds,
} from "@/modules/rooms/rooms.repository";
import type {
  CreateRoomBedInput,
  CreateHostelBranchInput,
  CreateHostelFloorInput,
  CreateRoomInput,
  CreateRoomTemplateInput,
  ListRoomsQuery,
  SoftDeleteRoomInput,
  TransferStudentBedInput,
  UnassignStudentBedInput,
  UpdateRoomBedStatusInput,
  UpdateRoomInput,
} from "@/modules/rooms/schemas";
import type { Database } from "@/types/database.types";
import { z } from "zod";

type RoomRow = Database["public"]["Tables"]["rooms"]["Row"];
type BedRow = Database["public"]["Tables"]["room_beds"]["Row"];
type AssignmentRow =
  Database["public"]["Tables"]["student_room_assignments"]["Row"];
type StudentRow = Pick<
  Database["public"]["Tables"]["students"]["Row"],
  | "first_name"
  | "hostel_branch_id"
  | "id"
  | "last_name"
  | "organization_id"
  | "status"
  | "student_code"
>;

export type BedWithOccupant = BedRow & {
  activeAssignment?: AssignmentRow | undefined;
  occupant?: StudentRow | undefined;
};

export type RoomOccupancy = {
  availableBeds: number;
  bedCount: number;
  capacity: number;
  occupancyRate: number;
  occupiedBeds: number;
  unavailableBeds: number;
};

export type RoomListItem = RoomRow & {
  occupancy: RoomOccupancy;
};

const roomCreateResultSchema = z.object({
  bedIds: z.array(z.string().uuid()),
  roomId: z.string().uuid(),
});

const roomUpdateResultSchema = z.object({
  generatedBedIds: z.array(z.string().uuid()),
  roomId: z.string().uuid(),
});

const bedCreateResultSchema = z.object({
  bedId: z.string().uuid(),
});

const assignmentResultSchema = z.object({
  assignmentId: z.string().uuid(),
});

function requireOrganizationId(organizationId: string | undefined) {
  if (!organizationId) {
    throw new AppError({
      code: "BAD_REQUEST",
      message: "An active organization is required.",
      statusCode: 400,
    });
  }

  return organizationId;
}

function mapDatabaseError(error: { code?: string; message?: string }) {
  if (error.code === "02000" || error.code === "PGRST116") {
    return new AppError({
      code: "NOT_FOUND",
      details: error.code,
      message: "The requested room, bed, or assignment was not found.",
      statusCode: 404,
    });
  }

  if (error.code === "23505") {
    return new AppError({
      code: "CONFLICT",
      details: error.code,
      message: "A room, bed, or active assignment already exists with those details.",
      statusCode: 409,
    });
  }

  if (error.code === "23503" || error.code === "23514") {
    return new AppError({
      code: "BAD_REQUEST",
      details: error.code,
      message: "The room, bed, branch, or assignment selection is invalid.",
      statusCode: 400,
    });
  }

  if (error.code === "42501") {
    return new AppError({
      code: "FORBIDDEN",
      message: "You are not allowed to manage rooms in this tenant.",
      statusCode: 403,
    });
  }

  return new AppError({
    code: "INTERNAL_ERROR",
    details: error.code,
    message: "Room operation failed.",
    statusCode: 500,
    expose: false,
  });
}

function computeOccupancy(
  room: RoomRow,
  beds: BedRow[],
  assignments: AssignmentRow[],
): RoomOccupancy {
  const occupiedBedIds = new Set(assignments.map((assignment) => assignment.bed_id));
  const unavailableBeds = beds.filter((bed) =>
    ["inactive", "maintenance", "unavailable"].includes(bed.status),
  ).length;
  const availableBeds = beds.filter(
    (bed) => bed.status === "available" && !occupiedBedIds.has(bed.id),
  ).length;
  const occupiedBeds = occupiedBedIds.size;
  const denominator = Math.max(room.capacity, beds.length, 1);

  return {
    availableBeds,
    bedCount: beds.length,
    capacity: room.capacity,
    occupancyRate: Math.round((occupiedBeds / denominator) * 100),
    occupiedBeds,
    unavailableBeds,
  };
}

function attachBeds(
  beds: BedRow[],
  assignments: AssignmentRow[],
  students: StudentRow[],
): BedWithOccupant[] {
  const assignmentByBed = new Map(
    assignments.map((assignment) => [assignment.bed_id, assignment]),
  );
  const studentById = new Map(students.map((student) => [student.id, student]));

  return beds.map((bed) => {
    const activeAssignment = assignmentByBed.get(bed.id);

    return {
      ...bed,
      activeAssignment,
      occupant: activeAssignment
        ? studentById.get(activeAssignment.student_id)
        : undefined,
    };
  });
}

async function loadRoomCollections(roomIds: string[]) {
  const supabase = await createSupabaseServerClient();
  const [bedsResult, assignmentsResult] = await Promise.all([
    listBedsForRoomIds(supabase, roomIds),
    listActiveAssignmentsForRoomIds(supabase, roomIds),
  ]);

  if (bedsResult.error) {
    throw mapDatabaseError(bedsResult.error);
  }

  if (assignmentsResult.error) {
    throw mapDatabaseError(assignmentsResult.error);
  }

  const studentIds = [
    ...new Set(assignmentsResult.data.map((assignment) => assignment.student_id)),
  ];
  const studentsResult = await listStudentsByIds(supabase, studentIds);

  if (studentsResult.error) {
    throw mapDatabaseError(studentsResult.error);
  }

  return {
    assignments: assignmentsResult.data,
    beds: bedsResult.data,
    students: studentsResult.data,
  };
}

export async function listRooms(input: ListRoomsQuery) {
  const context = await requirePermission("room:read", {
    hostelBranchId: input.hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const { count, data, error } = await listRoomRows({
    input,
    organizationId,
    supabase,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const roomIds = data.map((room) => room.id);
  const { assignments, beds } = await loadRoomCollections(roomIds);
  const rooms: RoomListItem[] = data.map((room) => {
    const roomBeds = beds.filter((bed) => bed.room_id === room.id);
    const roomAssignments = assignments.filter(
      (assignment) => assignment.room_id === room.id,
    );

    return {
      ...room,
      occupancy: computeOccupancy(room, roomBeds, roomAssignments),
    };
  });
  const totals = rooms.reduce(
    (summary, room) => ({
      availableBeds: summary.availableBeds + room.occupancy.availableBeds,
      capacity: summary.capacity + room.occupancy.capacity,
      occupiedBeds: summary.occupiedBeds + room.occupancy.occupiedBeds,
      rooms: summary.rooms + 1,
      unavailableBeds: summary.unavailableBeds + room.occupancy.unavailableBeds,
    }),
    {
      availableBeds: 0,
      capacity: 0,
      occupiedBeds: 0,
      rooms: 0,
      unavailableBeds: 0,
    },
  );

  return {
    count: count ?? 0,
    data: rooms,
    page: input.page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / input.limit)),
    totals: {
      ...totals,
      occupancyRate:
        totals.capacity > 0
          ? Math.round((totals.occupiedBeds / totals.capacity) * 100)
          : 0,
    },
  };
}

export async function getRoom(roomId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: room, error } = await getRoomById(supabase, roomId);

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!room) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Room was not found.",
      statusCode: 404,
    });
  }

  await requirePermission("room:read", {
    hostelBranchId: room.hostel_branch_id,
    organizationId: room.organization_id,
    product: "hostel_erp",
  });

  const { assignments, beds, students } = await loadRoomCollections([room.id]);
  const [availableBedsResult, branchRoomsResult] = await Promise.all([
    listAvailableBedsForBranch(
      supabase,
      room.organization_id,
      room.hostel_branch_id,
    ),
    listRoomsForBranch(supabase, room.organization_id, room.hostel_branch_id),
  ]);

  if (availableBedsResult.error) {
    throw mapDatabaseError(availableBedsResult.error);
  }

  if (branchRoomsResult.error) {
    throw mapDatabaseError(branchRoomsResult.error);
  }

  return {
    availableBeds: availableBedsResult.data,
    beds: attachBeds(beds, assignments, students),
    branchRooms: branchRoomsResult.data,
    occupancy: computeOccupancy(room, beds, assignments),
    room,
  };
}

export async function getRoomFormOptions(hostelBranchId?: string) {
  const context = await requirePermission("room:manage", {
    hostelBranchId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(context.organizationId);
  const supabase = await createSupabaseServerClient();
  const [branchesResult, categoriesResult, floorsResult, templatesResult] =
    await Promise.all([
      listHostelBranches(supabase, organizationId),
      listRoomCategories(supabase, organizationId, hostelBranchId),
      listHostelFloors(supabase, organizationId, hostelBranchId),
      listRoomTemplates(supabase, organizationId, hostelBranchId),
    ]);

  if (branchesResult.error) {
    throw mapDatabaseError(branchesResult.error);
  }

  if (categoriesResult.error) {
    throw mapDatabaseError(categoriesResult.error);
  }

  if (floorsResult.error) {
    throw mapDatabaseError(floorsResult.error);
  }

  if (templatesResult.error) {
    throw mapDatabaseError(templatesResult.error);
  }

  return {
    branches: branchesResult.data,
    categories: categoriesResult.data,
    floors: floorsResult.data,
    organizationId,
    templates: templatesResult.data,
  };
}

export async function createHostelBranch(input: CreateHostelBranchInput) {
  const context = await requirePermission("branch:manage", {
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("hostel_branches")
    .insert({
      address: {},
      created_by: context.identity.userId,
      name: input.name,
      organization_id: input.organizationId,
      slug: input.slug,
      status: input.status,
      timezone: input.timezone,
      updated_by: context.identity.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  await recordAuditEvent({
    action: "hostel_branch.create",
    actorUserId: context.identity.userId,
    durable: true,
    entityId: data.id,
    entityTable: "hostel_branches",
    hostelBranchId: data.id,
    organizationId: input.organizationId,
  });

  return data;
}

export async function createHostelFloor(input: CreateHostelFloorInput) {
  const context = await requirePermission("room:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("hostel_floors")
    .insert({
      created_by: context.identity.userId,
      floor_code: input.floorCode,
      hostel_branch_id: input.hostelBranchId,
      name: input.name,
      organization_id: input.organizationId,
      sort_order: input.sortOrder,
      status: input.status,
      updated_by: context.identity.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  await recordAuditEvent({
    action: "hostel_floor.create",
    actorUserId: context.identity.userId,
    durable: true,
    entityId: data.id,
    entityTable: "hostel_floors",
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
  });

  return data;
}

export async function createRoomTemplate(input: CreateRoomTemplateInput) {
  const context = await requirePermission("room:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("room_templates")
    .insert({
      bed_label_pattern: input.bedLabelPattern,
      created_by: context.identity.userId,
      currency_code: input.currencyCode,
      default_capacity: input.defaultCapacity,
      description: input.description ?? null,
      hostel_branch_id: input.hostelBranchId,
      monthly_rate_cents: input.monthlyRateCents,
      name: input.name,
      organization_id: input.organizationId,
      room_type_key: input.roomTypeKey,
      security_deposit_cents: input.securityDepositCents,
      slug: input.slug,
      updated_by: context.identity.userId,
    })
    .select("*")
    .single();

  if (error) {
    throw mapDatabaseError(error);
  }

  await recordAuditEvent({
    action: "room_template.create",
    actorUserId: context.identity.userId,
    durable: true,
    entityId: data.id,
    entityTable: "room_templates",
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
  });

  return data;
}

export async function createRoom(input: CreateRoomInput) {
  const context = await requirePermission("room:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const organizationId = requireOrganizationId(
    input.organizationId ?? context.organizationId,
  );
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_room_with_beds", {
    p_actor_user_id: context.identity.userId,
    p_bed_labels: input.bedLabels,
    p_capacity: input.capacity,
    p_currency_code: input.currencyCode,
    p_hostel_branch_id: input.hostelBranchId,
    p_metadata: {},
    p_monthly_rate_cents: input.monthlyRateCents,
    p_name: input.name,
    p_organization_id: organizationId,
    p_room_code: input.roomCode,
    p_room_type: input.roomType,
    p_security_deposit_cents: input.securityDepositCents,
    p_status: input.status,
    ...(input.categoryId === undefined ? {} : { p_category_id: input.categoryId }),
    ...(input.floor === undefined ? {} : { p_floor: input.floor }),
    ...(input.floorId === undefined ? {} : { p_floor_id: input.floorId }),
    ...(input.templateId === undefined ? {} : { p_template_id: input.templateId }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = roomCreateResultSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Room creation returned an invalid response.",
      statusCode: 500,
      expose: false,
    });
  }

  return parsed.data;
}

export async function updateRoom(input: UpdateRoomInput) {
  const supabase = await createSupabaseServerClient();
  const { data: existing, error: existingError } = await getRoomById(
    supabase,
    input.roomId,
  );

  if (existingError) {
    throw mapDatabaseError(existingError);
  }

  if (!existing) {
    throw new AppError({
      code: "NOT_FOUND",
      message: "Room was not found.",
      statusCode: 404,
    });
  }

  const organizationId = input.organizationId ?? existing.organization_id;
  const context = await requirePermission("room:manage", {
    hostelBranchId: existing.hostel_branch_id,
    organizationId,
    product: "hostel_erp",
  });
  const { data, error } = await supabase.rpc("update_room_configuration", {
    p_actor_user_id: context.identity.userId,
    p_bed_labels: input.bedLabels,
    p_capacity: input.capacity,
    p_currency_code: input.currencyCode,
    p_hostel_branch_id: existing.hostel_branch_id,
    p_metadata: {},
    p_monthly_rate_cents: input.monthlyRateCents,
    p_name: input.name,
    p_organization_id: organizationId,
    p_room_code: input.roomCode,
    p_room_id: input.roomId,
    p_room_type: input.roomType,
    p_security_deposit_cents: input.securityDepositCents,
    p_status: input.status,
    ...(input.categoryId === undefined ? {} : { p_category_id: input.categoryId }),
    ...(input.floor === undefined ? {} : { p_floor: input.floor }),
    ...(input.floorId === undefined ? {} : { p_floor_id: input.floorId }),
    ...(input.templateId === undefined ? {} : { p_template_id: input.templateId }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = roomUpdateResultSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Room update returned an invalid response.",
      statusCode: 500,
      expose: false,
    });
  }

  return parsed.data;
}

export async function softDeleteRoom(input: SoftDeleteRoomInput) {
  const context = await requirePermission("room:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("soft_delete_room", {
    p_actor_user_id: context.identity.userId,
    p_hostel_branch_id: input.hostelBranchId,
    p_organization_id: input.organizationId,
    p_room_id: input.roomId,
  });

  if (error) {
    throw mapDatabaseError(error);
  }
}

export async function createRoomBed(input: CreateRoomBedInput) {
  const context = await requirePermission("room:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_room_bed", {
    p_actor_user_id: context.identity.userId,
    p_bed_code: input.bedCode,
    p_hostel_branch_id: input.hostelBranchId,
    p_organization_id: input.organizationId,
    p_room_id: input.roomId,
    p_sort_order: input.sortOrder,
    p_status: input.status,
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = bedCreateResultSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Bed creation returned an invalid response.",
      statusCode: 500,
      expose: false,
    });
  }

  return parsed.data;
}

export async function updateRoomBedStatus(input: UpdateRoomBedStatusInput) {
  const context = await requirePermission("room:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("update_room_bed_status", {
    p_actor_user_id: context.identity.userId,
    p_bed_id: input.bedId,
    p_hostel_branch_id: input.hostelBranchId,
    p_organization_id: input.organizationId,
    p_status: input.status,
    ...(input.statusReason === undefined
      ? {}
      : { p_status_reason: input.statusReason }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }
}

export async function transferStudentBed(input: TransferStudentBedInput) {
  const context = await requirePermission("room:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  let targetRoomId = input.targetRoomId;

  if (!targetRoomId) {
    const { data: bed, error: bedError } = await supabase
      .from("room_beds")
      .select("room_id")
      .eq("id", input.targetBedId)
      .eq("organization_id", input.organizationId)
      .eq("hostel_branch_id", input.hostelBranchId)
      .eq("status", "available")
      .is("deleted_at", null)
      .single();

    if (bedError) {
      throw mapDatabaseError(bedError);
    }

    targetRoomId = bed.room_id;
  }

  const { data, error } = await supabase.rpc("transfer_student_bed", {
    p_actor_user_id: context.identity.userId,
    p_hostel_branch_id: input.hostelBranchId,
    p_organization_id: input.organizationId,
    p_student_id: input.studentId,
    p_target_bed_id: input.targetBedId,
    p_target_room_id: targetRoomId,
    ...(input.transferReason === undefined
      ? {}
      : { p_reason: input.transferReason }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = assignmentResultSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Student transfer returned an invalid response.",
      statusCode: 500,
      expose: false,
    });
  }

  return parsed.data;
}

export async function unassignStudentBed(input: UnassignStudentBedInput) {
  const context = await requirePermission("room:manage", {
    hostelBranchId: input.hostelBranchId,
    organizationId: input.organizationId,
    product: "hostel_erp",
  });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("unassign_student_bed", {
    p_actor_user_id: context.identity.userId,
    p_assignment_id: input.assignmentId,
    p_hostel_branch_id: input.hostelBranchId,
    p_organization_id: input.organizationId,
    ...(input.reason === undefined ? {} : { p_reason: input.reason }),
  });

  if (error) {
    throw mapDatabaseError(error);
  }

  const parsed = assignmentResultSchema.safeParse(data);

  if (!parsed.success) {
    throw new AppError({
      code: "INTERNAL_ERROR",
      message: "Student unassignment returned an invalid response.",
      statusCode: 500,
      expose: false,
    });
  }

  return parsed.data;
}
