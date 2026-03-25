import type { SuccessResponse } from "@lms-platform/api/types";

export function ok<T>(data: T, message = "OK"): SuccessResponse<T> {
  return { success: true, data, message };
}
