"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import WebhookList from "@/components/WebhookList";
import WebhookData from "@/components/WebhookData";
import io from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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

export default function Home() {
  const [webhook, setWebhook] = useState({ id: getWebhookId() });
  const [webhookDataList, setWebhookDataList] = useState([]);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const clearWebhookData = () => {
    setWebhookDataList([]);
    toast({
      title: "Webhook Data Cleared",
      description: "All webhook messages have been cleared",
    });
  };

  const refreshWebhook = () => {
    const newId = uuidv4();
    localStorage.setItem("webhookId", newId);
    setWebhook({ id: newId });
    setWebhookDataList([]); // Clear existing webhook data
    toast({
      title: "Webhook Refreshed",
      description: "A new webhook URL has been generated",
    });
  };

  useEffect(() => {
    const socket = io({
      path: "/api/socketio",
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      socket.emit("join", webhook.id);
    });

    socket.on("webhookData", (data) => {
      if (data.webhookId === webhook.id) {
        setWebhookDataList((prevList) => [
          {
            id: uuidv4(),
            webhookId: data.webhookId,
            payload: data.payload,
            headers: data.headers,
            timestamp: new Date().toLocaleString(),
          },
          ...prevList,
        ]);

        toast({
          title: "New Webhook Data Received",
          description: `Webhook ID: ${data.webhookId}`,
        });
      }
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
    <div className="container mx-auto p-4">
      <WebhookList webhook={webhook} onRefresh={refreshWebhook} />
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <span className="px-2 py-1 text-md bg-green-700 text-white dark:bg-green-800 rounded-lg">
              {webhookDataList.length} messages
            </span>
          </div>
          <Button
            onClick={clearWebhookData}
            variant="destructive"
            size="icon"
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <WebhookData webhookDataList={webhookDataList} />
      </div>
      <Toaster />
    </div>
  );
}
