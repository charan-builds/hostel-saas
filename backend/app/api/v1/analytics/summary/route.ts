import { type NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import { getAnalyticsDashboard } from "@/modules/analytics/analytics.service";
import { dashboardQuerySchema } from "@/modules/analytics/schemas";

export async function GET(request: NextRequest) {
  try {
    const query = validateInput(
      dashboardQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const data = await getAnalyticsDashboard(query);

    return Response.json({ data });
  } catch (error) {
    return toErrorResponse(error);
  }
}
