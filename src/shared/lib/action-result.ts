import { z } from "zod";

/**
 * Kết quả chuẩn của mọi Server Action – client chỉ cần xử lý một kiểu dữ liệu.
 * Không ném lỗi nghiệp vụ ra client; lỗi hệ thống vẫn để error boundary xử lý.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** Chuyển lỗi zod thành map { field: message } (lấy lỗi đầu tiên mỗi field). */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    out[key] ??= issue.message;
  }
  return out;
}

/** Lỗi nghiệp vụ có chủ đích – service ném ra, action bắt và trả về fail(). */
export class DomainError extends Error {
  constructor(
    message: string,
    /** Lỗi gắn với ô nhập cụ thể (hiện ngay dưới ô đó) */
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

/**
 * Bọc thân server action: lỗi nghiệp vụ và input sai thành ActionResult thất bại;
 * lỗi hệ thống (và redirect/notFound của Next) vẫn được ném tiếp.
 */
export async function handleAction<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof DomainError) return fail(error.message, error.fieldErrors);
    if (error instanceof z.ZodError) return fail("Dữ liệu gửi lên không hợp lệ", zodFieldErrors(error));
    throw error;
  }
}
