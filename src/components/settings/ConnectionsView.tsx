"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Sidebar } from "@/components/ui/Sidebar";
import { tokens } from "@/lib/tokens";

type ConnectionStatus = "connected" | "disconnected" | "loading";

interface Connection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: ConnectionStatus;
  connectedAs?: string;
  lastSync?: string;
  capabilities: string[];
  provider?: string;
  connectAction?: () => void;
  setupNote?: string;
}

const MicrosoftLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32">
    <rect x="1" y="1" width="14" height="14" fill="#f25022"/>
    <rect x="17" y="1" width="14" height="14" fill="#7fba00"/>
    <rect x="1" y="17" width="14" height="14" fill="#00a4ef"/>
    <rect x="17" y="17" width="14" height="14" fill="#ffb900"/>
  </svg>
);

const SlackLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M7.2 20.8a3.2 3.2 0 1 1-3.2-3.2H7.2v3.2z" fill="#e01e5a"/>
    <path d="M8.8 20.8a3.2 3.2 0 0 1 6.4 0v8a3.2 3.2 0 0 1-6.4 0v-8z" fill="#e01e5a"/>
    <path d="M11.2 7.2a3.2 3.2 0 1 1 3.2-3.2V7.2h-3.2z" fill="#36c5f0"/>
    <path d="M11.2 8.8a3.2 3.2 0 0 1 0 6.4H3.2A3.2 3.2 0 0 1 3.2 8.8h8z" fill="#36c5f0"/>
    <path d="M24.8 11.2a3.2 3.2 0 1 1 3.2 3.2H24.8v-3.2z" fill="#2eb67d"/>
    <path d="M23.2 11.2a3.2 3.2 0 0 1-6.4 0v-8a3.2 3.2 0 0 1 6.4 0v8z" fill="#2eb67d"/>
    <path d="M20.8 24.8a3.2 3.2 0 1 1-3.2 3.2V24.8h3.2z" fill="#ecb22e"/>
    <path d="M20.8 23.2a3.2 3.2 0 0 1 0-6.4H28.8a3.2 3.2 0 0 1 0 6.4h-8z" fill="#ecb22e"/>
  </svg>
);

const GranolaLogo = () => (
  <div
    className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] font-bold"
    style={{ background: "linear-gradient(135deg, #d4a55a, #8a5a1e)", color: "#1a1108" }}
  >
    g
  </div>
);

const AnthropicLogo = () => (
  <div
    className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold"
    style={{ background: "linear-gradient(135deg, #c8893f, #6b3a1e)", color: "#fff8f0" }}
  >
    A
  </div>
);

function StatusPill({ status }: { status: ConnectionStatus }) {
  if (status === "loading") return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: tokens.fg3 }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: tokens.fg3 }} />
      Checking…
    </span>
  );
  if (status === "connected") return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: tokens.forest }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tokens.forest }} />
      Connected
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-[11px]" style={{ color: tokens.fg3 }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: tokens.fg3 }} />
      Not connected
    </span>
  );
}

function ConnectionCard({ conn, onDisconnect }: { conn: Connection; onDisconnect: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-r3 overflow-hidden transition-all"
      style={{ background: tokens.bg1, border: `1px solid ${conn.status === "connected" ? tokens.forestSoft : tokens.line2}` }}
    >
      <div className="p-5 flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-r2 flex items-center justify-center flex-shrink-0"
          style={{ background: tokens.bg3, border: `1px solid ${tokens.line2}` }}
        >
          {conn.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-0.5">
            <span className="text-[14px] font-semibold" style={{ color: tokens.fg0 }}>{conn.name}</span>
            <StatusPill status={conn.status} />
          </div>
          <p className="text-[12.5px] leading-relaxed mb-2" style={{ color: tokens.fg2 }}>
            {conn.description}
          </p>
          {conn.connectedAs && (
            <p className="text-[11.5px] font-mono-do" style={{ color: tokens.fg3 }}>
              {conn.connectedAs}
              {conn.lastSync && ` · Synced ${conn.lastSync}`}
            </p>
          )}

          {/* Capabilities */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {conn.capabilities.map(cap => (
              <span
                key={cap}
                className="text-[10.5px] px-2 py-0.5 rounded-full"
                style={{ background: tokens.bg3, color: tokens.fg3, border: `1px solid ${tokens.line}` }}
              >
                {cap}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {conn.status === "connected" ? (
            <>
              <button
                onClick={() => onDisconnect(conn.id)}
                className="text-[12px] font-medium px-3.5 h-8 rounded-r2 transition-colors hover:opacity-80"
                style={{ color: tokens.oxblood, border: `1px solid ${tokens.oxblood}33`, background: tokens.oxbloodSoft }}
              >
                Disconnect
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[11px] transition-colors"
                style={{ color: tokens.fg3 }}
              >
                {expanded ? "Hide details ↑" : "Details ↓"}
              </button>
            </>
          ) : conn.setupNote ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[12px] font-medium px-3.5 h-8 rounded-r2 transition-colors"
              style={{
                background: "linear-gradient(180deg, #d4964a, #b87a30)",
                color: "#1a1108",
                border: "1px solid #8a5a1e",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Set up
            </button>
          ) : (
            <button
              onClick={conn.connectAction}
              className="text-[12px] font-medium px-3.5 h-8 rounded-r2 transition-colors"
              style={{
                background: "linear-gradient(180deg, #d4964a, #b87a30)",
                color: "#1a1108",
                border: "1px solid #8a5a1e",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && conn.setupNote && (
        <div
          className="px-5 pb-5 pt-0"
          style={{ borderTop: `1px solid ${tokens.line}` }}
        >
          <p className="text-[12px] leading-relaxed pt-4" style={{ color: tokens.fg2 }}>
            {conn.setupNote}
          </p>
        </div>
      )}
    </div>
  );
}

export function ConnectionsView() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Record<string, ConnectionStatus>>({
    outlook: "loading",
    slack: "loading",
    granola: "disconnected",
    anthropic: "loading",
  });
  const [connectedAs, setConnectedAs] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/integrations").then(r => r.json()),
      fetch("/api/integrations/status").then(r => r.json()),
    ])
      .then(([data, status]) => {
        const statuses: Record<string, ConnectionStatus> = {
          outlook: "disconnected",
          slack: "disconnected",
          granola: "disconnected",
          anthropic: "disconnected",
        };
        const as: Record<string, string> = {};
        for (const item of data) {
          statuses[item.provider] = "connected";
          if (item.metadata?.email) as[item.provider] = item.metadata.email;
        }
        if (status.granola) statuses.granola = "connected";
        if (status.anthropic) statuses.anthropic = "connected";
        setIntegrations(statuses);
        setConnectedAs(as);
      })
      .catch(() => {
        setIntegrations({ outlook: "disconnected", slack: "disconnected", granola: "disconnected", anthropic: "disconnected" });
      });
  }, []);

  async function handleDisconnect(id: string) {
    await fetch(`/api/integrations/${id}`, { method: "DELETE" });
    setIntegrations(s => ({ ...s, [id]: "disconnected" }));
  }

  const connections: Connection[] = [
    {
      id: "outlook",
      name: "Microsoft Outlook",
      description: "Sync emails that need a reply and calendar events into your stream. do. reads your unread inbox and creates actionable tasks with AI-drafted replies.",
      icon: <MicrosoftLogo />,
      status: integrations.outlook,
      connectedAs: connectedAs.outlook,
      lastSync: "2 min ago",
      capabilities: ["Unread emails → tasks", "AI draft replies", "Calendar events", "Auto-sync every 15 min"],
      provider: "microsoft-entra-id",
      connectAction: () => signIn("microsoft-entra-id", { callbackUrl: "/connections" }),
    },
    {
      id: "slack",
      name: "Slack",
      description: "Capture mentions, DMs, and threads that need your attention. do. surfaces only what requires action and drafts replies in your voice.",
      icon: <SlackLogo />,
      status: integrations.slack,
      connectedAs: connectedAs.slack,
      lastSync: "5 min ago",
      capabilities: ["@mentions → tasks", "DMs → tasks", "AI draft replies", "Thread context"],
      provider: "slack",
      connectAction: () => { window.location.href = "/api/slack/connect"; },
    },
    {
      id: "granola",
      name: "Granola",
      description: "Extract action items from your meeting notes automatically. Every time a meeting completes in Granola, do. pulls the action items into your stream.",
      icon: <GranolaLogo />,
      status: integrations.granola,
      capabilities: ["Meeting notes → tasks", "Action item extraction", "Attendee context", "Auto-extract on meeting end"],
      setupNote: `Requires Granola Business plan. In your Granola dashboard, go to Settings → Integrations → Webhooks and add:\n\nURL: https://your-domain.vercel.app/api/webhooks/granola\n\nSet GRANOLA_WEBHOOK_SECRET in your Vercel environment variables to match the secret you configure in Granola.`,
    },
    {
      id: "anthropic",
      name: "Claude AI",
      description: "Powers the AI features in do. — draft replies, action item extraction from meeting notes, and smart task prioritisation.",
      icon: <AnthropicLogo />,
      status: integrations.anthropic,
      capabilities: ["Draft replies", "Extract actions", "Prioritise tasks", "Context-aware"],
      setupNote: `Add your Anthropic API key to Vercel:\n\nName: ANTHROPIC_API_KEY\nValue: your key from console.anthropic.com\n\nThe key is already set if AI drafts are working.`,
    },
  ];

  const connectedCount = Object.values(integrations).filter(s => s === "connected").length;

  return (
    <div className="w-full h-full flex flex-col" style={{ background: tokens.bg0, color: tokens.fg0 }}>
      <TopBar view="Stream" onView={() => router.push("/")} />

      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Connections" />

        <div className="flex-1 overflow-auto px-8 py-6 max-w-2xl">
          {/* Header */}
          <div className="mb-7">
            <h1 className="mb-1">Connections</h1>
            <p className="text-[13px]" style={{ color: tokens.fg2 }}>
              Connect your tools to pull tasks automatically into do.
              {connectedCount > 0 && (
                <span style={{ color: tokens.forest }}> · {connectedCount} active</span>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {connections.map(conn => (
              <ConnectionCard key={conn.id} conn={conn} onDisconnect={handleDisconnect} />
            ))}
          </div>

          {/* Footer note */}
          <p className="text-[11.5px] mt-6 text-center" style={{ color: tokens.fg3 }}>
            do. only requests read access. Your data is never shared or used for training.
          </p>
        </div>
      </div>
    </div>
  );
}
