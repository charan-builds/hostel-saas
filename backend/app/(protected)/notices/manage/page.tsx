import Link from "next/link";

import { NoticeForm } from "@/components/notifications/notice-form";
import { NoticeList } from "@/components/notifications/notice-list";
import { ReminderAutomationForm } from "@/components/notifications/reminder-automation-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireTenantPageAccess } from "@/lib/auth/page-guards";
import {
  getNoticeManagementOptions,
  listNotices,
} from "@/modules/notifications/notifications.service";

export default async function ManageNoticesPage() {
  await requireTenantPageAccess({
    permission: "notice:manage",
    product: "hostel_erp",
  });
  const [options, notices] = await Promise.all([
    getNoticeManagementOptions(),
    listNotices({
      limit: 10,
      page: 1,
      status: "published",
    }),
  ]);

  return (
    <section className="space-y-6">
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href="/notices">View board</Link>
          </Button>
        }
        description="Publish operational notices and prepare reminder automations for background workers."
        eyebrow="Admin"
        title="Notice management"
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <NoticeForm
          branches={options.branches}
          organizationId={options.organizationId}
        />
        <ReminderAutomationForm
          branches={options.branches}
          organizationId={options.organizationId}
        />
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Recent published notices</h3>
        <NoticeList notices={notices.data} />
      </div>
    </section>
  );
}
