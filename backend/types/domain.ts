export const USER_ROLES = ["superadmin", "admin", "student"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const SAAS_PRODUCTS = [
  "hostel_erp",
  "clothing_shop_erp",
  "gym_erp",
  "inventory_erp",
] as const;

export type SaasProduct = (typeof SAAS_PRODUCTS)[number];

export const MEMBERSHIP_STATUSES = [
  "active",
  "invited",
  "suspended",
  "revoked",
] as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const ROOM_STATUSES = [
  "active",
  "maintenance",
  "unavailable",
  "inactive",
] as const;

export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const BED_STATUSES = [
  "available",
  "occupied",
  "reserved",
  "maintenance",
  "unavailable",
  "inactive",
] as const;

export type BedStatus = (typeof BED_STATUSES)[number];

export const BILLING_INVOICE_STATUSES = [
  "draft",
  "pending",
  "partially_paid",
  "paid",
  "overdue",
  "void",
] as const;

export type BillingInvoiceStatus = (typeof BILLING_INVOICE_STATUSES)[number];

export const BILLING_PAYMENT_METHODS = [
  "cash",
  "upi",
  "bank_transfer",
  "card",
  "cashfree",
  "other",
] as const;

export type BillingPaymentMethod = (typeof BILLING_PAYMENT_METHODS)[number];

export const RENT_PLAN_SCOPE_TYPES = [
  "branch",
  "room",
  "bed",
  "student",
] as const;

export type RentPlanScopeType = (typeof RENT_PLAN_SCOPE_TYPES)[number];

export const BOOKING_REQUEST_STATUSES = [
  "pending",
  "contacted",
  "approved",
  "rejected",
  "expired",
  "converted",
  "cancelled",
] as const;

export type BookingRequestStatus = (typeof BOOKING_REQUEST_STATUSES)[number];

export const NOTIFICATION_CHANNELS = [
  "in_app",
  "email",
  "sms",
  "whatsapp",
  "push",
] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_SEVERITIES = [
  "info",
  "success",
  "warning",
  "critical",
] as const;

export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

export const NOTICE_AUDIENCE_TYPES = [
  "tenant",
  "branch",
  "admins",
  "students",
] as const;

export type NoticeAudienceType = (typeof NOTICE_AUDIENCE_TYPES)[number];

export const PERMISSIONS = [
  "tenant:create",
  "tenant:read",
  "tenant:update",
  "membership:read",
  "membership:manage",
  "branch:read",
  "branch:manage",
  "room:read",
  "room:manage",
  "student:read",
  "student:manage",
  "student:document:upload",
  "booking:read",
  "booking:manage",
  "billing:read",
  "billing:manage",
  "payment:record",
  "notification:read",
  "notification:manage",
  "notice:read",
  "notice:manage",
  "leave:read",
  "leave:request",
  "leave:manage",
  "attendance:read",
  "attendance:manage",
  "gatepass:read",
  "gatepass:request",
  "gatepass:manage",
  "analytics:read",
  "report:export",
  "audit:read",
  "student:self:read",
  "student:self:update",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type TenantScope = {
  organizationId: string;
  hostelBranchId?: string;
  product: SaasProduct;
};

export type TenantMembership = TenantScope & {
  id: string;
  role: Exclude<UserRole, "superadmin">;
  status: MembershipStatus;
  userId: string;
};
