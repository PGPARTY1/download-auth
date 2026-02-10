import { NextFunction, Response, Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { stripe } from "../lib/stripe.js";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth.js";

export const paymentsRouter = Router();

const createIntentSchema = z.object({
  productId: z.string().uuid(),
  platform: z.enum(["ios", "android", "windows", "web"]),
  currency: z.string().length(3).optional()
});

const checkoutSchema = z.object({
  productId: z.string().uuid(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

paymentsRouter.get("/config", (_request, response) => {
  response.json({
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    merchantCountryCode: env.STRIPE_MERCHANT_COUNTRY
  });
});

async function createPaymentIntentResponse(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) {
  try {
    const payload = createIntentSchema.parse(request.body);
    const product = await prisma.product.findUnique({
      where: { id: payload.productId }
    });

    if (!product || !product.isActive) {
      response.status(404).json({ error: "Product not found." });
      return;
    }

    const currency = (payload.currency ?? product.currency).toLowerCase();
    if (currency !== product.currency.toLowerCase()) {
      response.status(400).json({ error: "Selected currency is not available for this product." });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: product.amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: request.auth!.userId,
        productId: product.id,
        platform: payload.platform
      }
    });

    await prisma.purchase.upsert({
      where: { stripePaymentIntentId: paymentIntent.id },
      create: {
        userId: request.auth!.userId,
        productId: product.id,
        status: "pending",
        amountCents: product.amountCents,
        currency,
        stripePaymentIntentId: paymentIntent.id,
        platform: payload.platform
      },
      update: {
        status: "pending"
      }
    });

    response.status(201).json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
      merchantCountry: env.STRIPE_MERCHANT_COUNTRY,
      merchantCountryCode: env.STRIPE_MERCHANT_COUNTRY
    });
  } catch (error) {
    next(error);
  }
}

paymentsRouter.post("/payment-intents", requireAuth, createPaymentIntentResponse);
paymentsRouter.post("/payment-intent", requireAuth, createPaymentIntentResponse);

paymentsRouter.post("/checkout-session", requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const payload = checkoutSchema.parse(request.body);
    const product = await prisma.product.findUnique({
      where: { id: payload.productId }
    });

    if (!product || !product.isActive) {
      response.status(404).json({ error: "Product not found." });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: payload.successUrl,
      cancel_url: payload.cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            unit_amount: product.amountCents,
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.name,
              description: product.description
            }
          }
        }
      ],
      metadata: {
        userId: request.auth!.userId,
        productId: product.id,
        platform: "windows"
      }
    });

    await prisma.purchase.upsert({
      where: { stripeCheckoutId: session.id },
      create: {
        userId: request.auth!.userId,
        productId: product.id,
        status: "pending",
        amountCents: product.amountCents,
        currency: product.currency,
        stripeCheckoutId: session.id,
        platform: "windows"
      },
      update: {
        status: "pending"
      }
    });

    response.status(201).json({
      checkoutSessionId: session.id,
      checkoutUrl: session.url
    });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.get("/history", requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId: request.auth!.userId },
      orderBy: { createdAt: "desc" },
      include: { product: true }
    });

    response.json({ purchases });
  } catch (error) {
    next(error);
  }
});

paymentsRouter.post("/restore", requireAuth, async (request: AuthenticatedRequest, response, next) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: request.auth!.userId,
        status: {
          in: ["succeeded", "completed"]
        }
      },
      include: { product: true },
      orderBy: { createdAt: "desc" }
    });

    const premiumUnlocked = purchases.length > 0;
    await prisma.user.update({
      where: { id: request.auth!.userId },
      data: { premiumUnlocked }
    });

    response.json({
      premiumUnlocked,
      purchases
    });
  } catch (error) {
    next(error);
  }
});
