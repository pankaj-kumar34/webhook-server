"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Check,
  Copy,
  Moon,
  Plus,
  RefreshCw,
  Sun,
  Trash2,
  Zap,
} from "lucide-react";

export default function Toolbar({
  webhook,
  onRefresh,
  onClear,
  onSendTest,
  sendingTest = false,
  count = 0,
  connected = false,
}) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const webhookUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/api/webhook/${webhook.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-[#23283d] dark:bg-[#10131e]/95">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Brand + Endpoint Pill */}
        <div className="flex min-w-0 flex-1 items-center gap-3.5">
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              HookPulse
            </span>
          </div>

          <button
            onClick={copyToClipboard}
            title={webhookUrl}
            className="group hidden min-w-0 max-w-xl items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-left transition-all hover:border-indigo-500/50 hover:bg-indigo-500/4 dark:border-[#23283d] dark:bg-[#0b0d14] dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/8 sm:flex"
          >
            <span
              className="relative flex h-2 w-2 shrink-0"
              title={connected ? "Live" : "Reconnecting"}
            >
              {connected && (
                <span className="live-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  connected
                    ? "bg-emerald-500"
                    : "bg-slate-400 dark:bg-slate-600"
                }`}
              />
            </span>
            <span className="truncate font-mono text-sm text-slate-600 transition-colors group-hover:text-slate-950 dark:text-[#8892b0] dark:group-hover:text-slate-100">
              {copied ? (
                <span className="text-indigo-600 dark:text-indigo-400">
                  Copied to clipboard
                </span>
              ) : (
                webhookUrl
              )}
            </span>
            {copied ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-400" />
            )}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          {onSendTest && (
            <button
              onClick={onSendTest}
              disabled={sendingTest}
              className="mr-1.5 inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-linear-to-r from-indigo-500 to-violet-600 px-3.5 text-sm font-medium text-white shadow-md shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-500 active:scale-[0.98] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">
                {sendingTest ? "Sending…" : "Send Test"}
              </span>
            </button>
          )}

          <button
            onClick={onRefresh}
            title="New endpoint"
            aria-label="New endpoint"
            className="group flex h-8.5 w-8.5 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-[#8892b0] dark:hover:bg-[#131726] dark:hover:text-indigo-400"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
          </button>

          {count > 0 && (
            <button
              onClick={onClear}
              title="Clear requests"
              aria-label="Clear requests"
              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:text-[#8892b0] dark:hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-[#8892b0] dark:hover:bg-[#131726] dark:hover:text-slate-100"
          >
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="block h-4 w-4 dark:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
