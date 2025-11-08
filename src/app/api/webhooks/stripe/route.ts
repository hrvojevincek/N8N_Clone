import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json(
        { error: "Workflow ID is required", success: false },
        { status: 400 }
      );
    }

    const body = await request.json();

    const stripeData = {
      //Event metadata
      eventId: body.id,
      eventType: body.type,
      eventData: body.data,
      timestamp: body.created,
      livemode: body.livemode,
      raw: body.data?.object,
    };

    await sendWorkflowExecution({
      workflowId,
      initialData: {
        stripe: stripeData,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing Stripe webhook", error);
    return NextResponse.json(
      {
        error: "Failed to process Stripe event",
        success: false,
      },
      { status: 500 }
    );
  }
}
