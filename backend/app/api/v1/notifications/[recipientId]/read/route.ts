import { toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { markNotificationRead } from "@/modules/notifications/notifications.service";
import { markNotificationReadSchema } from "@/modules/notifications/schemas";

type NotificationReadRouteContext = {
  params: Promise<{
    recipientId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: NotificationReadRouteContext,
) {
  try {
    const { recipientId } = await context.params;
    const input = validateInput(markNotificationReadSchema, { recipientId });
    const data = await markNotificationRead(input);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}
