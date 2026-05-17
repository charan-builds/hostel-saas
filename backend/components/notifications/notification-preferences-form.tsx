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
    <form
      action={updateNotificationPreferencesAction}
      className="space-y-4 rounded border border-slate-200 bg-white p-5"
    >
      <input name="organizationId" type="hidden" value={organizationId} />
      <div>
        <p className="font-medium">Notification preferences</p>
        <p className="mt-1 text-sm text-slate-600">
          Channel switches are stored now so workers can honor them later.
        </p>
      </div>
      <div className="grid gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            className="size-4"
            defaultChecked={preference?.in_app_enabled ?? true}
            name="inAppEnabled"
            type="checkbox"
          />
          <span>In-app</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            className="size-4"
            defaultChecked={preference?.email_enabled ?? true}
            name="emailEnabled"
            type="checkbox"
          />
          <span>Email</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            className="size-4"
            defaultChecked={preference?.sms_enabled ?? false}
            name="smsEnabled"
            type="checkbox"
          />
          <span>SMS</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            className="size-4"
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
          className="min-h-20 w-full rounded border border-slate-300 px-3 py-2"
          defaultValue={(preference?.muted_notification_types ?? []).join("\n")}
          name="mutedNotificationTypes"
          placeholder="billing_reminder"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium">Locale</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={preference?.locale ?? "en-IN"}
            name="locale"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-medium">Timezone</span>
          <input
            className="w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={preference?.timezone ?? "UTC"}
            name="timezone"
          />
        </label>
      </div>
      <button
        className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
        type="submit"
      >
        Save preferences
      </button>
    </form>
  );
}
