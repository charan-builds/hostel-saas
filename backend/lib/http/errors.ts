export type AppErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

type AppErrorOptions = {
  code: AppErrorCode;
  message: string;
  statusCode: number;
  details?: unknown;
  expose?: boolean;
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly details?: unknown;
  readonly expose: boolean;
  readonly statusCode: number;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.details = options.details;
    this.expose = options.expose ?? options.statusCode < 500;
    this.statusCode = options.statusCode;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toErrorResponse(error: unknown, requestId?: string) {
  const appError = isAppError(error)
    ? error
    : new AppError({
        code: "INTERNAL_ERROR",
        message: "Unexpected server error.",
        statusCode: 500,
        expose: false,
      });

  return Response.json(
    {
      error: {
        code: appError.code,
        details: appError.expose ? appError.details : undefined,
        message: appError.expose ? appError.message : "Unexpected server error.",
        requestId,
      },
    },
    { status: appError.statusCode },
  );
}
