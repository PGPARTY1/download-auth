import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt.js";

export type AuthenticatedRequest = Request & {
  auth?: {
    userId: string;
    email: string;
  };
};

export function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    response.status(401).json({ error: "Missing Bearer token." });
    return;
  }

  try {
    const token = authHeader.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      response.status(401).json({ error: "Invalid access token." });
      return;
    }

    request.auth = {
      userId: payload.sub,
      email: payload.email
    };

    next();
  } catch {
    response.status(401).json({ error: "Access token expired or invalid." });
  }
}
