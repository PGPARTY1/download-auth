import { Router } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from "jose";
import { z } from "zod";
import { env } from "../config/env.js";
import { createOpaqueToken, hashToken } from "../lib/crypto.js";
import { sendMail } from "../lib/email.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { logger } from "../lib/logger.js";
import { prisma } from "../lib/prisma.js";
import { durationToMs } from "../lib/time.js";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const googleClient = new OAuth2Client();
const appleIssuer = "https://appleid.apple.com";
const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(80).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

const verifyEmailSchema = z.object({
  token: z.string().min(20)
});

const resendVerificationSchema = z.object({
  email: z.string().email()
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(8)
});

const oauthSchema = z.object({
  idToken: z.string().min(20).optional(),
  identityToken: z.string().min(20).optional()
});

async function buildSession(user: { id: string; email: string }, request: AuthenticatedRequest) {
  const sessionId = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, sid: sessionId });
  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  const refreshTokenHash = hashToken(refreshToken);
  const refreshLifetimeMs = durationToMs(env.JWT_REFRESH_EXPIRES_IN);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + refreshLifetimeMs),
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"]
    }
  });

  return { accessToken, refreshToken };
}

async function issueVerificationEmail(email: string, userId: string) {
  const token = createOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt
    }
  });

  const verificationUrl = new URL("/verify-email", env.APP_PUBLIC_URL);
  verificationUrl.searchParams.set("token", token);

  await sendMail({
    to: email,
    subject: "Verify your PookieStudios account",
    html: `<p>Welcome to PookieStudios.</p><p>Please verify your email by opening this link:</p><p><a href="${verificationUrl.toString()}">${verificationUrl.toString()}</a></p>`
  });
}

function userResponse(user: {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  premiumUnlocked: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    premiumUnlocked: user.premiumUnlocked
  };
}

authRouter.post("/signup", async (request, response, next) => {
  try {
    const payload = signupSchema.parse(request.body);
    const existing = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
    if (existing) {
      response.status(409).json({ error: "Email is already registered." });
      return;
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);
    const created = await prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        name: payload.name,
        passwordHash
      }
    });

    await issueVerificationEmail(created.email, created.id);

    response.status(201).json({
      message: "Account created. Please verify your email.",
      user: userResponse(created)
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  try {
    const payload = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() }
    });

    if (!user?.passwordHash) {
      response.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isValidPassword) {
      response.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (!user.emailVerified) {
      response.status(403).json({ error: "Please verify your email before logging in." });
      return;
    }

    const tokens = await buildSession(user, request);
    response.json({
      user: userResponse(user),
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (request, response, next) => {
  try {
    const payload = refreshSchema.parse(request.body);
    const tokenPayload = verifyRefreshToken(payload.refreshToken);

    if (tokenPayload.type !== "refresh") {
      response.status(401).json({ error: "Invalid refresh token." });
      return;
    }

    const session = await prisma.session.findUnique({
      where: { id: tokenPayload.sid },
      include: { user: true }
    });

    if (!session || session.userId !== tokenPayload.sub || session.revokedAt || session.expiresAt < new Date()) {
      response.status(401).json({ error: "Refresh session is invalid." });
      return;
    }

    const incomingHash = hashToken(payload.refreshToken);
    if (incomingHash !== session.refreshTokenHash) {
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      });
      response.status(401).json({ error: "Refresh token mismatch. Session revoked." });
      return;
    }

    const nextRefreshToken = signRefreshToken({ sub: session.user.id, sid: session.id });
    const nextAccessToken = signAccessToken({ sub: session.user.id, email: session.user.email });
    const refreshLifetimeMs = durationToMs(env.JWT_REFRESH_EXPIRES_IN);

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashToken(nextRefreshToken),
        expiresAt: new Date(Date.now() + refreshLifetimeMs),
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"]
      }
    });

    response.json({
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (request, response, next) => {
  try {
    const payload = refreshSchema.parse(request.body);
    const tokenPayload = verifyRefreshToken(payload.refreshToken);

    await prisma.session.updateMany({
      where: {
        id: tokenPayload.sid,
        userId: tokenPayload.sub,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

authRouter.post("/verify-email", async (request, response, next) => {
  try {
    const payload = verifyEmailSchema.parse(request.body);
    const tokenHash = hashToken(payload.token);

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      response.status(400).json({ error: "Verification token is invalid or expired." });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null
      }
    });

    const tokens = await buildSession(updated, request);
    response.json({
      message: "Email verification complete.",
      user: userResponse(updated),
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/resend-verification", async (request, response, next) => {
  try {
    const payload = resendVerificationSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() }
    });

    if (!user) {
      response.status(200).json({ message: "If the email exists, a verification message was sent." });
      return;
    }

    if (user.emailVerified) {
      response.status(200).json({ message: "Email is already verified." });
      return;
    }

    await issueVerificationEmail(user.email, user.id);
    response.json({ message: "Verification email sent." });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/forgot-password", async (request, response, next) => {
  try {
    const payload = forgotPasswordSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() }
    });

    if (!user) {
      response.status(200).json({ message: "If the email exists, a reset message was sent." });
      return;
    }

    const token = createOpaqueToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt
      }
    });

    const resetUrl = new URL("/reset-password", env.APP_PUBLIC_URL);
    resetUrl.searchParams.set("token", token);
    await sendMail({
      to: user.email,
      subject: "Reset your PookieStudios password",
      html: `<p>You requested a password reset.</p><p>Open this link to set a new password:</p><p><a href="${resetUrl.toString()}">${resetUrl.toString()}</a></p>`
    });

    response.status(200).json({ message: "If the email exists, a reset message was sent." });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/reset-password", async (request, response, next) => {
  try {
    const payload = resetPasswordSchema.parse(request.body);
    const tokenHash = hashToken(payload.token);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      response.status(400).json({ error: "Password reset token is invalid or expired." });
      return;
    }

    const passwordHash = await bcrypt.hash(payload.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null
      }
    });

    await prisma.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    response.json({ message: "Password updated. Please log in again." });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/oauth/google", async (request, response, next) => {
  try {
    if (!env.GOOGLE_OAUTH_CLIENT_ID) {
      response.status(400).json({ error: "Google OAuth is not configured." });
      return;
    }

    const payload = oauthSchema.parse(request.body);
    const idToken = payload.idToken ?? payload.identityToken;
    if (!idToken) {
      response.status(400).json({ error: "Google ID token is required." });
      return;
    }
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_OAUTH_CLIENT_ID
    });

    const info = ticket.getPayload();
    if (!info?.sub || !info.email) {
      response.status(401).json({ error: "Google token missing identity fields." });
      return;
    }

    const email = info.email.toLowerCase();
    const user =
      (await prisma.user.findFirst({
        where: {
          OR: [{ googleSub: info.sub }, { email }]
        }
      })) ??
      (await prisma.user.create({
        data: {
          email,
          name: info.name ?? null,
          googleSub: info.sub,
          emailVerified: true
        }
      }));

    if (!user.googleSub) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleSub: info.sub,
          emailVerified: true
        }
      });
    }

    const finalUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    const tokens = await buildSession(finalUser, request);

    response.json({
      user: userResponse(finalUser),
      ...tokens
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/oauth/apple", async (request, response, next) => {
  try {
    if (!env.APPLE_SERVICE_ID) {
      response.status(400).json({ error: "Apple OAuth is not configured." });
      return;
    }

    const payload = oauthSchema.parse(request.body);
    const idToken = payload.idToken ?? payload.identityToken;
    if (!idToken) {
      response.status(400).json({ error: "Apple identity token is required." });
      return;
    }
    const header = decodeProtectedHeader(idToken);
    if (!header.kid) {
      response.status(401).json({ error: "Invalid Apple token header." });
      return;
    }

    const verified = await jwtVerify(idToken, appleJwks, {
      issuer: appleIssuer,
      audience: env.APPLE_SERVICE_ID
    });

    const sub = verified.payload.sub;
    const email = verified.payload.email?.toString().toLowerCase();

    if (!sub) {
      response.status(401).json({ error: "Apple token missing subject." });
      return;
    }

    const user =
      (await prisma.user.findFirst({
        where: {
          OR: [{ appleSub: sub }, ...(email ? [{ email }] : [])]
        }
      })) ??
      (await prisma.user.create({
        data: {
          email: email ?? `${sub}@apple.private`,
          appleSub: sub,
          emailVerified: Boolean(email)
        }
      }));

    if (!user.appleSub) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          appleSub: sub
        }
      });
    }

    const finalUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    const tokens = await buildSession(finalUser, request);

    response.json({
      user: userResponse(finalUser),
      ...tokens
    });
  } catch (error) {
    logger.error({ error }, "Apple OAuth failed");
    next(error);
  }
});

authRouter.get("/session", requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.auth!.userId }
    });

    if (!user) {
      response.status(404).json({ error: "User not found." });
      return;
    }

    response.json({ user: userResponse(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.auth!.userId }
    });

    if (!user) {
      response.status(404).json({ error: "User not found." });
      return;
    }

    response.json({ user: userResponse(user) });
  } catch (error) {
    next(error);
  }
});
