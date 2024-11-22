"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import {
  buildCurl,
  formatTime,
  highlightJson,
  jsonToPlain,
  methodBadge,
  summarize,
} from "@/lib/format";

export default function RequestDetail({ item, webhookUrl }) {
  const [activeTab, setActiveTab] = useState("payload");
  const [copiedType, setCopiedType] = useState(null);

  if (!item) return null;

  const headers = item.headers || {};
  const headerEntries = Object.entries(headers);
  const headerCount = headerEntries.length;
  const summary = summarize(item.payload) || "Incoming Request";

  const copyText = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 1800);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-[#0b0d14]">
      {/* Detail Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={methodBadge(item.method)}>{item.method}</span>
          <h2 className="truncate font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            {summary}
          </h2>
          <span className="hidden font-mono text-xs tabular-nums text-slate-400 dark:text-[#8892b0] sm:inline">
            {formatTime(item.timestamp)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyText(jsonToPlain(item.payload), "json")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-500/50 hover:text-indigo-600 dark:border-[#23283d] dark:bg-[#131726] dark:text-slate-200 dark:hover:border-indigo-400/50 dark:hover:text-indigo-300"
          >
            {copiedType === "json" ? (
              <Check className="h-3.5 w-3.5 text-indigo-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copiedType === "json" ? "Copied" : "Copy JSON"}</span>
          </button>
          <button
            onClick={() => copyText(buildCurl(webhookUrl, item), "curl")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-500/50 hover:text-indigo-600 dark:border-[#23283d] dark:bg-[#131726] dark:text-slate-200 dark:hover:border-indigo-400/50 dark:hover:text-indigo-300"
          >
            {copiedType === "curl" ? (
              <Check className="h-3.5 w-3.5 text-indigo-500" />
            ) : (
              <Terminal className="h-3.5 w-3.5" />
            )}
            <span>{copiedType === "curl" ? "Copied" : "Copy cURL"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 px-6 dark:border-[#23283d]">
        <button
          onClick={() => setActiveTab("payload")}
          className={`border-b-2 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "payload"
              ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-[#8892b0] dark:hover:text-slate-200"
          }`}
        >
          Payload
        </button>
        <button
          onClick={() => setActiveTab("headers")}
          className={`flex items-center gap-2 border-b-2 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "headers"
              ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-[#8892b0] dark:hover:text-slate-200"
          }`}
        >
          <span>Headers</span>
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 font-mono text-xs tabular-nums text-indigo-700 dark:text-indigo-300">
            {headerCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("raw")}
          className={`border-b-2 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "raw"
              ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:text-[#8892b0] dark:hover:text-slate-200"
          }`}
        >
          Raw
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        {activeTab === "payload" && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-[#23283d] dark:bg-[#131726]">
            <pre className="font-mono text-sm leading-relaxed">
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightJson(item.payload),
                }}
              />
            </pre>
          </div>
        )}

        {activeTab === "headers" && (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#23283d] dark:bg-[#131726]">
            {headerCount === 0 ? (
              <p className="p-5 text-sm text-slate-500">No headers captured.</p>
            ) : (
              <table className="w-full border-collapse text-left">
                <tbody className="divide-y divide-slate-200/80 font-mono text-sm dark:divide-[#23283d]">
                  {headerEntries.map(([key, val]) => (
                    <tr
                      key={key}
                      className="hover:bg-slate-50 dark:hover:bg-[#181d30]"
                    >
                      <td className="w-56 px-4 py-2.5 align-top text-slate-500 dark:text-[#8892b0]">
                        {key}
                      </td>
                      <td className="break-all px-4 py-2.5 text-sky-600 dark:text-sky-300">
                        {String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "raw" && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-[#23283d] dark:bg-[#131726]">
            <pre className="whitespace-pre-wrap break-all font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {item.payload == null
                ? "(empty body)"
                : typeof item.payload === "string"
                  ? item.payload
                  : JSON.stringify(item.payload)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
