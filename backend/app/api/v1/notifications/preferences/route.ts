import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/modules/notifications/notifications.service";
import { updateNotificationPreferencesSchema } from "@/modules/notifications/schemas";

export async function GET() {
  try {
    const data = await getNotificationPreferences();

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const input = validateInput(
      updateNotificationPreferencesSchema,
      await request.json(),
    );
    const data = await updateNotificationPreferences(input);

    return Response.json({ data });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new AppError({
          code: "BAD_REQUEST",
          message: "Request body must be valid JSON.",
          statusCode: 400,
        }),
      );
    }

    return toErrorResponse(error);
  }
}
