import { AppError } from "@lms-platform/api/errors";
import type { ApiResponse } from "@lms-platform/api/types";
import Elysia from "elysia";

export type { ApiResponse };

export const errorHandler = new Elysia({ name: "error-handler" }).onError(
  ({ code, error, status }) => {
    if (code === "VALIDATION") {
      let details: unknown;
      try {
        details = JSON.parse(error.message);
      } catch {
        details = error.message;
      }
      return status(422, {
        success: false,
        data: null,
        message: "Validation error",
        details,
      });
    }

    if (error instanceof AppError) {
      return status(error.statusCode as Parameters<typeof status>[0], {
        success: false,
        data: null,
        message: error.message,
      });
    }

    console.error("[unhandled]", error);
    return status(500, {
      success: false,
      data: null,
      message: "Internal server error",
    });
  },
);
