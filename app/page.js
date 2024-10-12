"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import WebhookList from "@/components/WebhookList";
import WebhookData from "@/components/WebhookData";
import io from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [webhook, setWebhook] = useState(null);
  const [webhookDataList, setWebhookDataList] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const newWebhookId = uuidv4();
    setWebhook({ id: newWebhookId });

    const socket = io({
      path: "/api/socketio",
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      socket.emit("join", newWebhookId);
    });

    socket.on("webhookData", (data) => {
      if (data.webhookId === newWebhookId) {
        setWebhookDataList((prevList) => [
          {
            id: data.webhookId,
            payload: data.payload,
            headers: data.headers,
            timestamp: new Date(),
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
  }, [toast]);

  return (
    <div className="container mx-auto p-4">
      {webhook && <WebhookList webhook={webhook} />}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Webhook Data</h2>
        <WebhookData webhookDataList={webhookDataList} />
      </div>
      <Toaster />
    </div>
  );
}
