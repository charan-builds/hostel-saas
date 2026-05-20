"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Bed, ClipboardCheck, UserRound } from "lucide-react";

import { DataTable } from "@/components/data/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AttendanceListItem } from "@/modules/presence/presence.service";

type AttendanceTableProps = {
  attendanceRecords: AttendanceListItem[];
  branchNames?: Record<string, string>;
};

function studentRoute(studentId: string) {
  return `/students/${studentId}` as Route;
}

function studentLabel(record: AttendanceListItem) {
  if (!record.student) {
    return record.student_id.slice(0, 8);
  }

  return `${record.student.student_code} - ${record.student.first_name} ${record.student.last_name}`;
}

function branchLabel(
  record: AttendanceListItem,
  branchNames: Record<string, string>,
) {
  return branchNames[record.hostel_branch_id] ?? "Assigned branch";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function roomBedLabel(record: AttendanceListItem) {
  if (!record.room_id && !record.bed_id) {
    return "Unassigned";
  }

  const room = record.room_id ? `Room ${record.room_id.slice(0, 8)}` : "Room";
  const bed = record.bed_id ? `Bed ${record.bed_id.slice(0, 8)}` : "No bed";

  return `${room} / ${bed}`;
}

function AttendanceMobileCard({
  branchNames,
  record,
}: {
  branchNames: Record<string, string>;
  record: AttendanceListItem;
}) {
  return (
    <article className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
            href={studentRoute(record.student_id)}
          >
            <UserRound className="size-4" aria-hidden="true" />
            {studentLabel(record)}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {branchLabel(record, branchNames)} · {formatDate(record.attendance_date)}
          </p>
        </div>
        <StatusBadge status={record.status} />
      </div>
      <dl className="grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Source</dt>
          <dd className="text-right font-medium capitalize">
            {record.source.replaceAll("_", " ")}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Room/bed</dt>
          <dd className="text-right font-medium">{roomBedLabel(record)}</dd>
        </div>
      </dl>
      <p className="rounded-md border border-border bg-muted/60 p-3 text-sm text-muted-foreground">
        {record.notes ?? "No notes recorded"}
      </p>
      <Button asChild size="sm" variant="outline">
        <Link href={studentRoute(record.student_id)}>
          <ClipboardCheck aria-hidden="true" />
          Student profile
        </Link>
      </Button>
    </article>
  );
}

export function AttendanceTable({
  attendanceRecords,
  branchNames = {},
}: AttendanceTableProps) {
  if (attendanceRecords.length === 0) {
    return (
      <EmptyState
        description="Try changing the date, branch, or status filters."
        title="No attendance records found"
      />
    );
  }

  const columns: ColumnDef<AttendanceListItem>[] = [
    {
      accessorKey: "attendance_date",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{formatDate(row.original.attendance_date)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {branchLabel(row.original, branchNames)}
          </p>
        </div>
      ),
      header: "Date / branch",
    },
    {
      cell: ({ row }) => (
        <Link
          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
          href={studentRoute(row.original.student_id)}
        >
          <UserRound className="size-4" aria-hidden="true" />
          {studentLabel(row.original)}
        </Link>
      ),
      header: "Student",
      id: "student",
    },
    {
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      header: "Status",
    },
    {
      accessorKey: "source",
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">
          {row.original.source.replaceAll("_", " ")}
        </span>
      ),
      header: "Source",
    },
    {
      cell: ({ row }) => (
        <div className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Bed className="size-4" aria-hidden="true" />
          {roomBedLabel(row.original)}
        </div>
      ),
      header: "Room/bed",
      id: "room_bed",
    },
    {
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-xs text-muted-foreground">
          {row.original.notes ?? "None"}
        </span>
      ),
      header: "Notes",
      id: "notes",
    },
    {
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline">
            <Link href={studentRoute(row.original.student_id)}>
              <UserRound aria-hidden="true" />
              Profile
            </Link>
          </Button>
        </div>
      ),
      enableSorting: false,
      header: "Actions",
      id: "actions",
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={attendanceRecords}
      enablePagination={false}
      mobileCard={(record) => (
        <AttendanceMobileCard branchNames={branchNames} record={record} />
      )}
      rowSelection={false}
      showToolbar={false}
      tableMinWidth="1080px"
    />
  );
}
