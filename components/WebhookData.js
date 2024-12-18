import { Card, CardContent } from "@/components/ui/card";

export default function WebhookData({ webhookDataList }) {
  const formatJSON = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return data;
    }
  };

  return (
    <div className="space-y-4">
      {webhookDataList.map((item) => (
        <Card key={item.id + item.timestamp}>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">
              Webhook ID: {item.webhookId}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Received at: {item.timestamp}
            </p>
            <div className="mb-4">
              <h4 className="text-md font-semibold mb-2">Headers:</h4>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                <code className="text-sm font-mono">
                  {formatJSON(item.headers)}
                </code>
              </pre>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-2">Payload:</h4>
              <pre className="bg-secondary p-4 rounded-md overflow-x-auto">
                <code className="text-sm font-mono">
                  {formatJSON(item.payload)}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
