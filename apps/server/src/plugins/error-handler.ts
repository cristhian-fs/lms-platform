import { AppError } from "@lms-platform/api/errors";
import type { ApiResponse } from "@lms-platform/api/types";
import { env } from "@lms-platform/env/server";
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
    const err = error as Error;
    return status(500, {
      success: false,
      data: null,
      message:
        env.NODE_ENV === "development"
          ? `${err.name}: ${err.message}`
          : "Internal server error",
    });
  },
);
