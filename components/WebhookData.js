"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Search, X } from "lucide-react";
import RequestDetail from "@/components/RequestDetail";
import { formatTime, methodBadge, summarize } from "@/lib/format";

function QuickStart({ webhookUrl }) {
  const [copied, setCopied] = useState(false);

  const curl = `curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"event": "payment_intent.succeeded", "amount": 4900}'`;

  const copyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-[#23283d] dark:bg-[#131726]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-2.5 dark:border-[#23283d] dark:bg-[#10131e]">
            <span className="font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">
              cURL
            </span>
            <button
              onClick={copyCurl}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-[#8892b0] dark:hover:text-indigo-400"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-indigo-600 dark:text-indigo-400">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            <code>{curl}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

const METHODS = ["ALL", "POST", "PUT", "PATCH"];

export default function WebhookData({ webhookDataList, webhook }) {
  const [selectedId, setSelectedId] = useState(null);
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const webhookUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/api/webhook/${webhook.id}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return webhookDataList.filter((item) => {
      if (methodFilter !== "ALL" && item.method !== methodFilter) return false;
      if (!q) return true;
      const summary = (summarize(item.payload) || "").toLowerCase();
      const raw = JSON.stringify(item.payload ?? "").toLowerCase();
      return (
        summary.includes(q) ||
        item.method.toLowerCase().includes(q) ||
        raw.includes(q)
      );
    });
  }, [webhookDataList, methodFilter, query]);

  const activeItem =
    filtered.find((item) => item.id === selectedId) || filtered[0] || null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      {/* Left Sidebar: Request Stream */}
      <aside className="flex max-h-[40dvh] w-full shrink-0 flex-col overflow-hidden border-b border-slate-200 bg-slate-100/70 dark:border-[#23283d] dark:bg-[#10131e] lg:max-h-none lg:w-85 lg:border-b-0 lg:border-r xl:w-90">
        {/* Search & Filter */}
        <div className="flex flex-col gap-2.5 border-b border-slate-200 px-3.5 py-3 dark:border-[#23283d]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-[#8892b0]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter requests..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 dark:border-[#23283d] dark:bg-[#0b0d14] dark:text-slate-100 dark:placeholder:text-[#8892b0]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {METHODS.map((m) => {
              const active = methodFilter === m;
              return (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-[#8892b0] dark:hover:bg-[#181d30] dark:hover:text-slate-200"
                  }`}
                >
                  {m === "ALL" ? `All (${webhookDataList.length})` : m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stream List */}
        <div className="flex-1 divide-y divide-slate-200/70 overflow-y-auto dark:divide-[#23283d]/70">
          {webhookDataList.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
              <span className="relative mb-2.5 flex h-2.5 w-2.5">
                <span className="live-ring absolute inline-flex h-full w-full rounded-full bg-indigo-400" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
              </span>
              <p className="text-xs font-medium text-slate-500 dark:text-[#8892b0]">
                Listening…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-xs text-slate-400 dark:text-[#8892b0]">
              No matching requests
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = activeItem?.id === item.id;
              const summary = summarize(item.payload) || "Incoming Request";
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`webhook-entry flex w-full flex-col gap-1 border-l-2 px-3.5 py-3 text-left transition-colors focus-visible:outline-none ${
                    isSelected
                      ? "border-l-indigo-500 bg-indigo-500/9 dark:bg-indigo-500/15"
                      : "border-l-transparent hover:bg-slate-200/50 dark:hover:bg-[#161a2b]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={methodBadge(item.method)}>
                      {item.method}
                    </span>
                    <span
                      className={`min-w-0 flex-1 truncate text-sm font-medium ${
                        isSelected
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {summary}
                    </span>
                  </div>
                  <div className="pl-16.6 font-mono text-xs tabular-nums text-slate-400 dark:text-[#8892b0]">
                    {formatTime(item.timestamp)}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Main Pane: Request Detail or Quick Start */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#0b0d14]">
        {webhookDataList.length === 0 ? (
          <QuickStart webhookUrl={webhookUrl} />
        ) : activeItem ? (
          <RequestDetail item={activeItem} webhookUrl={webhookUrl} />
        ) : (
          <div className="flex flex-1 items-center justify-center p-10 text-sm text-slate-400">
            Select a request
          </div>
        )}
      </section>
    </div>
  );
}
