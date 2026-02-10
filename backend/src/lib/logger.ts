import pino from "pino";
import { NextFunction, Request, Response } from "express";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug"
});

export function httpLogger(request: Request, response: Response, next: NextFunction) {
  const start = Date.now();
  response.on("finish", () => {
    logger.info(
      {
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Date.now() - start
      },
      "HTTP request"
    );
  });
  next();
}
