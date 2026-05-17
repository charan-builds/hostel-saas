import { z } from "zod";

import { AppError } from "@/lib/http/errors";

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export function validateInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
): z.output<TSchema> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
      message: "Invalid request payload.",
      statusCode: 422,
    });
  }

  return parsed.data;
}
