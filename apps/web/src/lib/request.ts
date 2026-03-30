import { env } from "@lms-platform/env/web";

export type SuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
};

export type ErrorResponse = {
  success: false;
  data: null;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

const BASE = env.VITE_SERVER_URL;

export async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<SuccessResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) throw new Error(json.message);
  return json;
}

// For multipart/form-data — browser sets Content-Type with boundary automatically
export async function requestForm<T>(
  path: string,
  body: FormData,
): Promise<SuccessResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    credentials: "include",
    body,
  });

  const text = await res.text();

  if (!text) throw new Error(`Server error (${res.status})`);

  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Server error (${res.status})`);
  }

  if (!json.success) throw new Error(json.message);
  return json;
}
