import { FormActions, FormSection } from "@/components/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const fieldClassName = "erp-control w-full";
const textAreaClassName = "erp-control min-h-36 w-full";

export function NoticeForm({ branches, organizationId }: NoticeFormProps) {
  return (
    <form action={createNoticeAction} className="space-y-5">
      <input name="organizationId" type="hidden" value={organizationId} />

      <FormSection
        description="Keep the title action-oriented and the message easy to scan on mobile."
        title="Notice content"
      >
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Title</span>
          <Input name="title" placeholder="Example: Water supply maintenance tonight" required />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Message</span>
          <textarea
            className={textAreaClassName}
            name="body"
            placeholder="Write the operational update students or admins need to read."
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Type</span>
          <select className={fieldClassName} name="noticeType">
            <option value="general">General</option>
            <option value="billing">Billing</option>
            <option value="maintenance">Maintenance</option>
            <option value="event">Event</option>
            <option value="policy">Policy</option>
            <option value="emergency">Emergency</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Priority</span>
          <select className={fieldClassName} name="priority">
            <option value="normal">Normal</option>
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
      </FormSection>

      <FormSection
        description="Target only the people who need the update. Branch notices require a branch."
        title="Audience and schedule"
      >
        <label className="space-y-2">
          <span className="text-sm font-medium">Audience</span>
          <select className={fieldClassName} name="audienceType">
            <option value="tenant">Tenant</option>
            <option value="branch">Branch</option>
            <option value="admins">Admins</option>
            <option value="students">Students</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Branch</span>
          <select className={fieldClassName} name="hostelBranchId">
            <option value="">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Status</span>
          <select className={fieldClassName} name="status">
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Scheduled for</span>
          <Input name="scheduledFor" type="datetime-local" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Expires at</span>
          <Input name="expiresAt" type="datetime-local" />
        </label>
        <label className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-3">
          <input className="size-4 rounded border-input" name="pinned" type="checkbox" />
          <span className="text-sm font-medium">Pin notice on the board</span>
        </label>
      </FormSection>

      <FormActions>
        <Button type="submit">Save notice</Button>
      </FormActions>
    </form>
  );
}
