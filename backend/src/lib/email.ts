import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

const hasSmtpConfig = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  : null;

export async function sendMail(params: { to: string; subject: string; html: string }) {
  if (!transporter) {
    logger.info({ to: params.to, subject: params.subject, html: params.html }, "SMTP not configured. Mail logged.");
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html
  });
}
