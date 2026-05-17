import { createNoticeAction } from "@/modules/notifications/actions";

type BranchOption = {
  id: string;
  name: string;
  slug: string;
};

type NoticeFormProps = {
  branches: BranchOption[];
  organizationId: string;
};

export function NoticeForm({ branches, organizationId }: NoticeFormProps) {
  return (
    <form
      action={createNoticeAction}
      className="space-y-5 rounded border border-slate-200 bg-white p-5"
    >
      <input name="organizationId" type="hidden" value={organizationId} />
      <div>
        <p className="font-medium">Create notice</p>
        <p className="mt-1 text-sm text-slate-600">
          Published notices create in-app notifications for the selected audience.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Title</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="title"
            required
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className="text-sm font-medium">Message</span>
          <textarea
            className="min-h-32 w-full rounded border border-slate-300 px-3 py-2"
            name="body"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Audience</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="audienceType"
          >
            <option value="tenant">tenant</option>
            <option value="branch">branch</option>
            <option value="admins">admins</option>
            <option value="students">students</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Branch</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="hostelBranchId"
          >
            <option value="">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Type</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="noticeType"
          >
            <option value="general">general</option>
            <option value="billing">billing</option>
            <option value="maintenance">maintenance</option>
            <option value="event">event</option>
            <option value="policy">policy</option>
            <option value="emergency">emergency</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Priority</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="priority"
          >
            <option value="normal">normal</option>
            <option value="low">low</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Status</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="status"
          >
            <option value="published">published</option>
            <option value="scheduled">scheduled</option>
            <option value="draft">draft</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Scheduled for</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="scheduledFor"
            type="datetime-local"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Expires at</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            name="expiresAt"
            type="datetime-local"
          />
        </label>
        <label className="flex items-center gap-2 pt-7">
          <input className="size-4" name="pinned" type="checkbox" />
          <span className="text-sm font-medium">Pin notice</span>
        </label>
      </div>
      <button
        className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        type="submit"
      >
        Save notice
      </button>
    </form>
  );
}
