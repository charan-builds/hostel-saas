import { AppError, toErrorResponse } from "@/lib/http/errors";
import { validateInput } from "@/lib/validation/zod";
import {
  createRentPlan,
  getBillingFormOptions,
} from "@/modules/billing/billing.service";
import { createRentPlanSchema } from "@/modules/billing/schemas";

export async function GET() {
  try {
    const data = await getBillingFormOptions();

    return Response.json({ data: data.rentPlans });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const input = validateInput(createRentPlanSchema, await request.json());
    const data = await createRentPlan(input);

    return Response.json({ data }, { status: 201 });
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
