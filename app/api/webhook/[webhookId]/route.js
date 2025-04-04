import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  return handleRequest(request, params);
}

export async function PUT(request, { params }) {
  return handleRequest(request, params);
}

export async function PATCH(request, { params }) {
  return handleRequest(request, params);
}

async function handleRequest(request, { params }) {
  let payload;

  const webhookId = params.webhookId;
  const headers = Object.fromEntries(request.headers);

  if (headers["content-type"]) {
    if (headers["content-type"].includes("application/json")) {
      payload = await request.json();
    } else if (headers["content-type"].includes("text/plain")) {
      payload = await request.text();
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported content type" },
        { status: 400 }
      );
    }
  }

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
