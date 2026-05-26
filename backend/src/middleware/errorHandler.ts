import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { isApiError } from "../utils/apiError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isApiError(err)) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_FAILED",
      details: err.issues,
    });
    return;
  }

  console.error("Unhandled API error:", err);
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
};
