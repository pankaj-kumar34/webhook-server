import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  const webhookId = params.webhookId;
  const payload = await request.json();
  const headers = Object.fromEntries(request.headers);

  if (global.io) {
    global.io
      .to(webhookId)
      .emit("webhookData", { webhookId, payload, headers });
  } else {
    console.error("Socket.IO instance not available");
  }

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
