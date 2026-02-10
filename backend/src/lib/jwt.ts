import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type AccessPayload = {
  sub: string;
  email: string;
  type: "access";
};

type RefreshPayload = {
  sub: string;
  sid: string;
  type: "refresh";
};

export function signAccessToken(payload: Omit<AccessPayload, "type">) {
  return jwt.sign(
    {
      ...payload,
      type: "access"
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    }
  );
}

export function signRefreshToken(payload: Omit<RefreshPayload, "type">) {
  return jwt.sign(
    {
      ...payload,
      type: "refresh"
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]
    }
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
}
