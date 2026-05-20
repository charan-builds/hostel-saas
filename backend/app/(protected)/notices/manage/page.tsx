import Link from "next/link";
import { BellRing, Clock, Megaphone, Send } from "lucide-react";

import { ErpPage, ErpPageGrid } from "@/components/layout/erp-page";
import { NoticeForm } from "@/components/notifications/notice-form";
import { NoticeList } from "@/components/notifications/notice-list";
import { ReminderAutomationForm } from "@/components/notifications/reminder-automation-form";
import { ActionToolbar } from "@/components/ui/action-toolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
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
  const urgentCount = notices.data.filter((notice) => notice.priority === "urgent").length;
  const pinnedCount = notices.data.filter((notice) => notice.pinned).length;
  const branchTargetedCount = notices.data.filter(
    (notice) => notice.audience_type === "branch",
  ).length;

  return (
    <ErpPage>
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

      <ErpPageGrid>
        <StatCard
          description="Recent published sample"
          icon={Megaphone}
          label="Published notices"
          tone="info"
          value={String(notices.count)}
        />
        <StatCard
          description="Needs stronger reader attention"
          icon={BellRing}
          label="Urgent"
          tone={urgentCount > 0 ? "danger" : "default"}
          value={String(urgentCount)}
        />
        <StatCard
          description="Pinned in the notice board"
          icon={Send}
          label="Pinned"
          tone={pinnedCount > 0 ? "warning" : "default"}
          value={String(pinnedCount)}
        />
        <StatCard
          description="Scoped to specific branches"
          icon={Clock}
          label="Branch targeted"
          value={String(branchTargetedCount)}
        />
      </ErpPageGrid>

      <ActionToolbar
        description="Publish operational updates, then verify delivery from the notification center."
        title="Communication workflow"
        actions={
          <Button asChild variant="outline">
            <Link href="/notifications">Open notifications</Link>
          </Button>
        }
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
      <SectionCard
        contentClassName="space-y-4"
        description="Latest published notices for a quick communication sanity check."
        title="Recent published notices"
      >
        <NoticeList
          branchNames={Object.fromEntries(
            options.branches.map((branch) => [branch.id, branch.name]),
          )}
          notices={notices.data}
        />
      </SectionCard>
    </ErpPage>
  );
}
