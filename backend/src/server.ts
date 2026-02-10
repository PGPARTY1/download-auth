import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { httpLogger, logger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { paymentsRouter } from "./routes/payments.js";
import { productsRouter } from "./routes/products.js";
import { webhooksRouter } from "./routes/webhooks.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(helmet());
app.use(httpLogger);

// Stripe signature verification requires raw body.
app.use("/webhooks", express.raw({ type: "application/json" }), webhooksRouter);
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhooksRouter);
app.use(express.json({ limit: "1mb" }));

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/products", productsRouter);
app.use("/payments", paymentsRouter);
app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/payments", paymentsRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  logger.info(`PookieStudios API running on http://localhost:${env.PORT}`);
});

async function shutdown() {
  logger.info("Shutting down API");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
