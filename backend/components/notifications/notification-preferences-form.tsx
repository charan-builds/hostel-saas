import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    <Card>
      <CardHeader>
        <CardTitle>Notification preferences</CardTitle>
        <CardDescription>
          Channel switches are stored now so workers can honor them later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateNotificationPreferencesAction} className="space-y-4">
          <input name="organizationId" type="hidden" value={organizationId} />
          <div className="grid gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                className="size-4 rounded border-input"
                defaultChecked={preference?.in_app_enabled ?? true}
                name="inAppEnabled"
                type="checkbox"
              />
              <span>In-app</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                className="size-4 rounded border-input"
                defaultChecked={preference?.email_enabled ?? true}
                name="emailEnabled"
                type="checkbox"
              />
              <span>Email</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                className="size-4 rounded border-input"
                defaultChecked={preference?.sms_enabled ?? false}
                name="smsEnabled"
                type="checkbox"
              />
              <span>SMS</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                className="size-4 rounded border-input"
                defaultChecked={preference?.whatsapp_enabled ?? false}
                name="whatsappEnabled"
                type="checkbox"
              />
              <span>WhatsApp</span>
            </label>
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Muted notification types</span>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              defaultValue={(preference?.muted_notification_types ?? []).join("\n")}
              name="mutedNotificationTypes"
              placeholder="billing_reminder"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium">Locale</span>
              <Input
                defaultValue={preference?.locale ?? "en-IN"}
                name="locale"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Timezone</span>
              <Input
                defaultValue={preference?.timezone ?? "UTC"}
                name="timezone"
              />
            </label>
          </div>
          <Button type="submit" variant="outline">
            Save preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
