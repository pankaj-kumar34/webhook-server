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

export default function Home() {
  const [webhook, setWebhook] = useState(null);
  const [webhookDataList, setWebhookDataList] = useState([]);
  const { toast } = useToast();

  const clearWebhookData = () => {
    setWebhookDataList([]);
    toast({
      title: "Webhook Data Cleared",
      description: "All webhook messages have been cleared",
    });
  };

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Webhook Data</h2>
          <Button onClick={clearWebhookData} variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Messages
          </Button>
        </div>
        <WebhookData webhookDataList={webhookDataList} />
      </div>
      <Toaster />
    </div>
  );
}
