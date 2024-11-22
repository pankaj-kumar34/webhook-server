import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function WebhookList({ webhook, onRefresh }) {
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
        <div className="flex items-center gap-2">
          <div
            className="flex-1 bg-secondary p-4 rounded-md text-center break-all cursor-pointer"
            onClick={copyToClipboard}
          >
            <span className="text-sm font-mono">
              {copied ? "Copied!" : webhookUrl}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="h-12 w-12 shrink-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
