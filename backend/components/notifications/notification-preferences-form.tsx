import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import { updateNotificationPreferencesAction } from "@/modules/notifications/actions";
import type { NotificationPreferenceRow } from "@/modules/notifications/notifications.service";

type NotificationPreferencesFormProps = {
  organizationId: string;
  preference?: NotificationPreferenceRow | null | undefined;
};

export function NotificationPreferencesForm({
  organizationId,
  preference,
}: NotificationPreferencesFormProps) {
  return (
    <SectionCard
      contentClassName="space-y-4"
      description="Channel switches are stored now so workers can honor them later."
      title="Notification preferences"
    >
      <form action={updateNotificationPreferencesAction} className="space-y-4">
        <input name="organizationId" type="hidden" value={organizationId} />
        <div className="grid gap-2 text-sm">
          {[
            {
              checked: preference?.in_app_enabled ?? true,
              label: "In-app",
              name: "inAppEnabled",
            },
            {
              checked: preference?.email_enabled ?? true,
              label: "Email",
              name: "emailEnabled",
            },
            {
              checked: preference?.sms_enabled ?? false,
              label: "SMS",
              name: "smsEnabled",
            },
            {
              checked: preference?.whatsapp_enabled ?? false,
              label: "WhatsApp",
              name: "whatsappEnabled",
            },
          ].map((channel) => (
            <label
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2"
              key={channel.name}
            >
              <span className="font-medium">{channel.label}</span>
              <input
                className="size-4 rounded border-input"
                defaultChecked={channel.checked}
                name={channel.name}
                type="checkbox"
              />
            </label>
          ))}
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Muted notification types</span>
          <textarea
            className="erp-control min-h-20 w-full"
            defaultValue={(preference?.muted_notification_types ?? []).join("\n")}
            name="mutedNotificationTypes"
            placeholder="billing_reminder"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Locale</span>
            <Input defaultValue={preference?.locale ?? "en-IN"} name="locale" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Timezone</span>
            <Input defaultValue={preference?.timezone ?? "UTC"} name="timezone" />
          </label>
        </div>
        <Button type="submit" variant="outline">
          Save preferences
        </Button>
      </form>
    </SectionCard>
  );
}
