import { toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { dismissNotification } from "@/modules/notifications/notifications.service";
import { dismissNotificationSchema } from "@/modules/notifications/schemas";

type NotificationDismissRouteContext = {
  params: Promise<{
    recipientId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: NotificationDismissRouteContext,
) {
  try {
    const { recipientId } = await context.params;
    const input = validateInput(dismissNotificationSchema, { recipientId });
    const data = await dismissNotification(input);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}
