import { type NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { listNotifications } from "@/modules/notifications/notifications.service";
import { listNotificationsQuerySchema } from "@/modules/notifications/schemas";

export async function GET(request: NextRequest) {
  try {
    const query = validateInput(
      listNotificationsQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await listNotifications(query);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}
