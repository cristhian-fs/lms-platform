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
