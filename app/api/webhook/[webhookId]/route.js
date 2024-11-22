import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const MAX_BODY_BYTES = 1_000_000; // 1 MB

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(request, { params }) {
  return handleRequest(request, params);
}

export async function PUT(request, { params }) {
  return handleRequest(request, params);
}

export async function PATCH(request, { params }) {
  return handleRequest(request, params);
}

async function handleRequest(request, params) {
  const { webhookId } = await params;

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { success: false, error: "Payload too large (1 MB limit)" },
      { status: 413, headers: corsHeaders }
    );
  }

  const headers = Object.fromEntries(request.headers);
  const contentType = headers["content-type"] || "";
  let payload = null;

  try {
    if (contentType.includes("application/json")) {
      const text = await request.text();
      if (text.length > 0) payload = JSON.parse(text);
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      payload = Object.fromEntries(new URLSearchParams(await request.text()));
    } else if (contentType) {
      // text/plain, XML, CSV, anything — keep raw
      payload = await request.text();
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400, headers: corsHeaders }
    );
  }

  const entry = {
    id: randomUUID(),
    webhookId,
    method: request.method,
    payload,
    headers,
    timestamp: new Date().toISOString(),
  };

  let listeners = 0;
  if (global.io) {
    global.io.to(webhookId).emit("webhookData", entry);
    listeners = global.io.sockets.adapter.rooms.get(webhookId)?.size ?? 0;
  } else {
    console.error("Socket.IO instance not available");
  }

  return NextResponse.json(
    { success: true, id: entry.id, listeners },
    { headers: corsHeaders }
  );
}

export const dynamic = "force-dynamic";
