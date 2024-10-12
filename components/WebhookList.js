import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function WebhookList({ webhook }) {
  const [copied, setCopied] = useState(false);

  const webhookUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/api/webhook/${webhook.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 500); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div
          className="bg-secondary p-4 rounded-md text-center break-all cursor-pointer"
          onClick={copyToClipboard}
        >
          <span className="text-sm font-mono">
            {copied ? "Copied!" : webhookUrl}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
