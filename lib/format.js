const METHOD_STYLES = {
  POST: "bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  PUT: "bg-amber-500/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300",
  PATCH: "bg-sky-500/15 text-sky-700 dark:bg-sky-400/20 dark:text-sky-300",
  DELETE: "bg-rose-500/15 text-rose-700 dark:bg-rose-400/20 dark:text-rose-300",
};

export const methodBadge = (method) =>
  `inline-flex w-14 shrink-0 items-center justify-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold tracking-wide ${
    METHOD_STYLES[method] || "bg-zinc-500/20 text-zinc-600 dark:text-zinc-300"
  }`;

const METHOD_ACCENT = {
  POST: "border-l-teal-500",
  PUT: "border-l-amber-500",
  PATCH: "border-l-sky-500",
  DELETE: "border-l-red-500",
};

export const methodAccent = (method) =>
  METHOD_ACCENT[method] || "border-l-muted-foreground/30";

export const byteSize = (payload) => {
  let s;
  try {
    s =
      typeof payload === "string"
        ? payload.length
        : JSON.stringify(payload)?.length ?? 0;
  } catch {
    s = 0;
  }
  return s < 1024 ? `${s} B` : `${(s / 1024).toFixed(1)} kB`;
};

export const contentTypeShort = (headers = {}) => {
  const ct = headers["content-type"] || "";
  if (!ct) return "—";
  return ct.split(";")[0].split("/").pop();
};

export const formatTime = (ts) => {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  const time = d.toLocaleTimeString([], { hour12: false });
  return `${time}.${String(d.getMilliseconds()).padStart(3, "0")}`;
};

export const formatDate = (ts) => {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// One-line summary for list rows: prefers semantic keys, falls back to raw JSON.
export const summarize = (payload) => {
  if (payload == null) return "";
  if (typeof payload === "string") return payload.slice(0, 80);
  try {
    for (const key of ["event", "type", "action", "op", "status"]) {
      if (typeof payload[key] === "string") return payload[key];
    }
    const first = Object.values(payload)[0];
    if (typeof first === "string") return first;
    return JSON.stringify(payload).slice(0, 80);
  } catch {
    return "";
  }
};

export const jsonToPlain = (data) => {
  try {
    if (data == null) return "";
    return typeof data === "string" ? data : JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

export const buildCurl = (url, item) => {
  const method = item?.method || "POST";
  const ct = item?.headers?.["content-type"] || "application/json";
  const body =
    item?.payload == null
      ? ""
      : typeof item.payload === "string"
        ? item.payload
        : JSON.stringify(item.payload);
  const escaped = body.replace(/'/g, "'\\''");
  const lines = [`curl -X ${method} ${url}`, `  -H "Content-Type: ${ct}"`];
  if (body) {
    lines.push(`  -d '${escaped}'`);
  }
  return lines.join(" \\\n");
};

// Dependency-free JSON highlighter: escape first, then wrap tokens in spans.
export const highlightJson = (data) => {
  if (data == null) return "(empty body)";
  if (typeof data === "string") {
    return data
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  let json;
  try {
    json = JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }

  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "json-number";
        if (match.startsWith('"')) {
          cls = /"\s*:\s*$/.test(match) ? "json-key" : "json-string";
        } else if (/^(?:true|false|null)$/.test(match)) {
          cls = "json-bool";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
};
