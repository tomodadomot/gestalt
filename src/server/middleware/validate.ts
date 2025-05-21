import { MiddlewareHandler } from "hono";
import { ZodSchema, ZodError } from "zod";
import { err, Result } from "../../shared/result";
import { ValidationError } from "../../shared/errors";

// Zodスキーマでbodyをバリデーションし、失敗時はResultで返す
export function validateBody<T>(
  schema: ZodSchema<T>
): MiddlewareHandler {
  return async (c, next) => {
    const body = await c.req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const zerr = parsed.error as ZodError;
      const error: ValidationError = {
        type: "ValidationError",
        field: zerr.errors[0]?.path?.[0]?.toString() ?? "",
        message: zerr.errors[0]?.message ?? "Invalid request",
      };
      c.set("validationResult", err(error) as Result<T, ValidationError>);
      return;
    }
    c.set("validationResult", { ok: true, value: parsed.data } as Result<T, ValidationError>);
    await next();
  };
}
