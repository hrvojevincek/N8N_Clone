import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "POLAR_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  const webhookHeaders: Record<string, string> = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };

  try {
    const event = validateEvent(body, webhookHeaders, webhookSecret);

    switch (event.type) {
      case "subscription.active":
        console.log("Subscription activated:", event.data.id);
        break;
      case "subscription.canceled":
        console.log("Subscription canceled:", event.data.id);
        break;
      case "subscription.revoked":
        console.log("Subscription revoked:", event.data.id);
        break;
      case "customer.created":
        console.log("Customer created:", event.data.id);
        break;
      case "customer.state_changed":
        console.log("Customer state changed:", event.data.id);
        break;
      default:
        console.log("Unhandled Polar webhook event:", event.type);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json(
        { error: "Webhook verification failed" },
        { status: 403 }
      );
    }

    console.error("Error processing Polar webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
