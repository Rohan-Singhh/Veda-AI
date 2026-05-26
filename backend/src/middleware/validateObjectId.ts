import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError";

export function validateObjectIdParam(paramName = "id") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const value = req.params[paramName];

    if (typeof value !== "string" || !mongoose.Types.ObjectId.isValid(value)) {
      next(new ApiError(400, "INVALID_OBJECT_ID", `Invalid ${paramName} parameter`));
      return;
    }

    next();
  };
}
