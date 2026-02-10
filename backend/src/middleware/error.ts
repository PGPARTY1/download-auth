import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";

export function notFound(_request: Request, response: Response) {
  response.status(404).json({ error: "Route not found." });
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "Validation failed.",
      issues: error.issues
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    logger.error({ error }, "Database initialization error");
    response.status(503).json({ error: "Database is unavailable. Check PostgreSQL and DATABASE_URL." });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error({ code: error.code, error }, "Database request error");
    if (error.code === "P2002") {
      response.status(409).json({ error: "A record with this value already exists." });
      return;
    }
    response.status(400).json({ error: "Database request failed." });
    return;
  }

  logger.error({ error }, "Unhandled API error");
  response.status(500).json({ error: "Internal server error." });
}
