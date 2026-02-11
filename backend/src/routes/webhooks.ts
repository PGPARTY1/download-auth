import { Router } from "express";
import Stripe from "stripe";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { prisma } from "../lib/prisma.js";
import { stripe } from "../lib/stripe.js";

export const webhooksRouter = Router();

webhooksRouter.post("/stripe", async (request, response) => {
  const signature = request.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    response.status(400).send("Missing stripe-signature header");
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(request.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    logger.error({ error }, "Invalid Stripe webhook signature");
    response.status(400).send("Invalid signature");
    return;
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata.userId;
        const productId = paymentIntent.metadata.productId;
        const platform = paymentIntent.metadata.platform ?? "mobile";

        if (userId && productId) {
          await prisma.purchase.upsert({
            where: { stripePaymentIntentId: paymentIntent.id },
            update: {
              status: "completed",
              amountCents: paymentIntent.amount,
              currency: paymentIntent.currency,
              platform
            },
            create: {
              userId,
              productId,
              status: "completed",
              amountCents: paymentIntent.amount,
              currency: paymentIntent.currency,
              platform,
              stripePaymentIntentId: paymentIntent.id
            }
          });
          await prisma.user.update({
            where: { id: userId },
            data: { premiumUnlocked: true }
          });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata.userId;
        const productId = paymentIntent.metadata.productId;
        const platform = paymentIntent.metadata.platform ?? "mobile";

        if (userId && productId) {
          await prisma.purchase.upsert({
            where: { stripePaymentIntentId: paymentIntent.id },
            update: {
              status: "failed",
              amountCents: paymentIntent.amount,
              currency: paymentIntent.currency,
              platform
            },
            create: {
              userId,
              productId,
              status: "failed",
              amountCents: paymentIntent.amount,
              currency: paymentIntent.currency,
              platform,
              stripePaymentIntentId: paymentIntent.id
            }
          });
        }
        break;
      }
      case "checkout.session.completed": {
        const checkout = event.data.object as Stripe.Checkout.Session;
        const userId = checkout.metadata?.userId;
        const productId = checkout.metadata?.productId;
        const paymentIntentId = typeof checkout.payment_intent === "string" ? checkout.payment_intent : null;
        const totalAmount = checkout.amount_total ?? 0;
        const currency = checkout.currency ?? "usd";
        const platform = checkout.metadata?.platform ?? "windows";

        if (userId && productId) {
          await prisma.purchase.upsert({
            where: { stripeCheckoutId: checkout.id },
            update: {
              status: "completed",
              amountCents: totalAmount,
              currency,
              platform,
              stripePaymentIntentId: paymentIntentId
            },
            create: {
              userId,
              productId,
              status: "completed",
              amountCents: totalAmount,
              currency,
              platform,
              stripeCheckoutId: checkout.id,
              stripePaymentIntentId: paymentIntentId
            }
          });
          await prisma.user.update({
            where: { id: userId },
            data: { premiumUnlocked: true }
          });
        }
        break;
      }
      default:
        logger.debug({ eventType: event.type }, "Unhandled Stripe webhook event");
        break;
    }

    response.json({ received: true });
  } catch (error) {
    logger.error({ error, eventType: event.type }, "Stripe webhook handler failed");
    response.status(500).send("Webhook handler failed");
  }
});
