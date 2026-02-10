import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe Checkout Session (one-time payment).
 * Expects POST body: { priceId: string }.
 * priceId must be one of the env STRIPE_PRICE_* IDs (BASE/FULL, INR/USD).
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    console.error("STRIPE_SECRET_KEY is not set");
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secret);
  const allowedPriceIds = new Set([
    process.env.STRIPE_PRICE_BASE_INR,
    process.env.STRIPE_PRICE_BASE_USD,
    process.env.STRIPE_PRICE_FULL_INR,
    process.env.STRIPE_PRICE_FULL_USD,
  ].filter(Boolean));

  let body: { priceId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { priceId } = body;
  if (!priceId || typeof priceId !== "string" || !allowedPriceIds.has(priceId)) {
    return NextResponse.json({ error: "Invalid or disallowed price" }, { status: 400 });
  }

  const { userId } = await auth();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/download?success=1`,
      cancel_url: `${baseUrl}/download`,
      client_reference_id: userId ?? undefined,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
