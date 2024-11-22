"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Toolbar from "@/components/Toolbar";
import WebhookData from "@/components/WebhookData";
import io from "socket.io-client";
import { toast } from "sonner";

const getWebhookId = () => {
  if (typeof window !== "undefined") {
    const storedId = localStorage.getItem("webhookId");
    if (storedId) return storedId;

    const newId = uuidv4();
    localStorage.setItem("webhookId", newId);
    return newId;
  }

  return uuidv4();
};

const TEST_SAMPLES = [
  {
    method: "POST",
    payload: {
      id: "evt_3QK8xL2eZvKYlo2C19a",
      event: "payment_intent.succeeded",
      api_version: "2024-09-30",
      data: {
        amount: 4900,
        currency: "usd",
        customer: "cus_R4m9xKp2",
        status: "succeeded",
        metadata: { order_id: "ORD-8841", plan: "pro_monthly" },
      },
    },
  },
  {
    method: "PUT",
    payload: {
      event: "customer.subscription.updated",
      subscription_id: "sub_1P9xLm",
      previous_tier: "starter",
      new_tier: "team",
      seats: 5,
      active: true,
    },
  },
  {
    method: "PATCH",
    payload: {
      event: "deployment.ready",
      project: "webhook-server",
      branch: "main",
      region: "iad1",
      duration_ms: 1840,
    },
  },
];

export default function Home() {
  const [webhook, setWebhook] = useState({ id: getWebhookId() });
  const [webhookDataList, setWebhookDataList] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate request history from the server (survives page refresh)
  useEffect(() => {
    let active = true;
    fetch(`/api/webhook/${webhook.id}`)
      .then((r) => (r.ok ? r.json() : { requests: [] }))
      .then((d) => {
        if (!active || !Array.isArray(d.requests)) return;
        setWebhookDataList((prev) => {
          const seen = new Set(prev.map((e) => e.id));
          const merged = [
            ...prev,
            ...d.requests.filter((e) => !seen.has(e.id)),
          ];
          merged.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          return merged;
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [webhook.id]);

  const clearWebhookData = () => {
    setWebhookDataList([]);
    toast.success("Webhook Data Cleared", {
      description: "All webhook messages have been cleared",
    });
  };

  const refreshWebhook = () => {
    const newId = uuidv4();
    localStorage.setItem("webhookId", newId);
    setWebhook({ id: newId });
    setWebhookDataList([]);
    toast.success("Webhook Refreshed", {
      description: "A new webhook URL has been generated",
    });
  };

  const sendTestWebhook = async () => {
    setSendingTest(true);
    const sample =
      TEST_SAMPLES[Math.floor(Math.random() * TEST_SAMPLES.length)];
    try {
      const res = await fetch(`/api/webhook/${webhook.id}`, {
        method: sample.method,
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Source": "HookPulse-Tester",
        },
        body: JSON.stringify(sample.payload),
      });
      if (!res.ok) {
        toast.error("Failed to send test webhook");
      }
    } catch {
      toast.error("Network error sending test webhook");
    } finally {
      setSendingTest(false);
    }
  };

  useEffect(() => {
    const socket = io({
      path: "/api/socketio",
    });

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", webhook.id);
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("webhookData", (data) => {
      if (data.webhookId !== webhook.id) return;

      const entry = {
        id: data.id || uuidv4(),
        webhookId: data.webhookId,
        method: data.method || "POST",
        payload: data.payload,
        headers: data.headers,
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setWebhookDataList((prev) => [
        entry,
        ...prev.filter((p) => p.id !== entry.id),
      ]);

      toast(`${entry.method} request received`, {
        description: `Webhook ID: ${entry.webhookId}`,
      });
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webhook.id]);

  // Don't render content until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50 dark:bg-[#0b0d14]">
      <Toolbar
        webhook={webhook}
        onRefresh={refreshWebhook}
        onClear={clearWebhookData}
        onSendTest={sendTestWebhook}
        sendingTest={sendingTest}
        count={webhookDataList.length}
        connected={connected}
      />

      <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <WebhookData webhookDataList={webhookDataList} webhook={webhook} />
      </main>
    </div>
  );
}
