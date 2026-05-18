import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const fieldClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2";

const textAreaClassName =
  "min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2";

export function NoticeForm({ branches, organizationId }: NoticeFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create notice</CardTitle>
        <CardDescription>
          Published notices create in-app notifications for the selected audience.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createNoticeAction} className="space-y-5">
          <input name="organizationId" type="hidden" value={organizationId} />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Title</span>
              <Input name="title" required />
            </label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium">Message</span>
              <textarea className={textAreaClassName} name="body" required />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Audience</span>
              <select className={fieldClassName} name="audienceType">
                <option value="tenant">Tenant</option>
                <option value="branch">Branch</option>
                <option value="admins">Admins</option>
                <option value="students">Students</option>
              </select>
            </label>
            <label className="space-y-1">
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
            <label className="space-y-1">
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
            <label className="space-y-1">
              <span className="text-sm font-medium">Priority</span>
              <select className={fieldClassName} name="priority">
                <option value="normal">Normal</option>
                <option value="low">Low</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Status</span>
              <select className={fieldClassName} name="status">
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Scheduled for</span>
              <Input name="scheduledFor" type="datetime-local" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Expires at</span>
              <Input name="expiresAt" type="datetime-local" />
            </label>
            <label className="flex items-center gap-2 pt-7">
              <input className="size-4 rounded border-input" name="pinned" type="checkbox" />
              <span className="text-sm font-medium">Pin notice</span>
            </label>
          </div>
          <Button type="submit">Save notice</Button>
        </form>
      </CardContent>
    </Card>
  );
}
