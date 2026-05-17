import { toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { acknowledgeNotice } from "@/modules/notifications/notifications.service";
import { acknowledgeNoticeSchema } from "@/modules/notifications/schemas";

type NoticeAcknowledgeRouteContext = {
  params: Promise<{
    noticeId: string;
  }>;
};

export async function POST(
  _request: Request,
  context: NoticeAcknowledgeRouteContext,
) {
  try {
    const { noticeId } = await context.params;
    const input = validateInput(acknowledgeNoticeSchema, { noticeId });
    const data = await acknowledgeNotice(input);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}
