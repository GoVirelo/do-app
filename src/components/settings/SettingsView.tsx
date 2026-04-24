"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/ui/TopBar";
import { Sidebar } from "@/components/ui/Sidebar";
import { tokens } from "@/lib/tokens";

type Props = { onViewChange?: (v: string) => void };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div
        className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-3"
        style={{ color: tokens.fg3 }}
      >
        {title}
      </div>
      <div
        className="rounded-r3 overflow-hidden"
        style={{ border: `1px solid ${tokens.line2}`, background: tokens.bg1 }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  action,
  actionLabel,
  actionVariant = "default",
  hint,
}: {
  label: string;
  value?: string;
  action?: () => void;
  actionLabel?: string;
  actionVariant?: "default" | "danger" | "connected";
  hint?: string;
}) {
  const actionColor =
    actionVariant === "danger"
      ? tokens.oxblood
      : actionVariant === "connected"
      ? tokens.forest
      : tokens.bronze;

  return (
    <div
      className="flex items-center justify-between px-4 py-3.5"
      style={{ borderBottom: `1px solid ${tokens.line}` }}
    >
      <div>
        <div className="text-[13px]" style={{ color: tokens.fg1 }}>{label}</div>
        {value && <div className="text-[12px] mt-0.5" style={{ color: tokens.fg3 }}>{value}</div>}
        {hint && <div className="text-[11px] mt-0.5" style={{ color: tokens.fg3 }}>{hint}</div>}
      </div>
      {action && actionLabel && (
        <button
          onClick={action}
          className="text-[12px] font-medium px-3 h-7 rounded-r2 transition-colors hover:opacity-80"
          style={{ color: actionColor, border: `1px solid ${actionColor}22`, background: `${actionColor}11` }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function LastRow({ label, value, action, actionLabel, actionVariant = "default", hint }: Parameters<typeof Row>[0]) {
  const actionColor =
    actionVariant === "danger"
      ? tokens.oxblood
      : actionVariant === "connected"
      ? tokens.forest
      : tokens.bronze;

  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div>
        <div className="text-[13px]" style={{ color: tokens.fg1 }}>{label}</div>
        {value && <div className="text-[12px] mt-0.5" style={{ color: tokens.fg3 }}>{value}</div>}
        {hint && <div className="text-[11px] mt-0.5" style={{ color: tokens.fg3 }}>{hint}</div>}
      </div>
      {action && actionLabel && (
        <button
          onClick={action}
          className="text-[12px] font-medium px-3 h-7 rounded-r2 transition-colors hover:opacity-80"
          style={{ color: actionColor, border: `1px solid ${actionColor}22`, background: `${actionColor}11` }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function SettingsView({ onViewChange }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords don't match."); return; }
    if (pwForm.next.length < 8) { setPwError("Password must be at least 8 characters."); return; }

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current: pwForm.current, next: pwForm.next }),
    });
    if (res.ok) {
      setPwSuccess(true);
      setChangingPassword(false);
      setPwForm({ current: "", next: "", confirm: "" });
    } else {
      const d = await res.json();
      setPwError(d.error ?? "Failed to change password.");
    }
  }

  return (
    <div className="w-full h-full flex flex-col" style={{ background: tokens.bg0, color: tokens.fg0 }}>
      <TopBar
        view="Stream"
        onView={(v) => { onViewChange?.(v); router.push("/"); }}
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar activeItem="Settings" />

        <div className="flex-1 overflow-auto px-8 py-6 max-w-2xl">
          <h1 className="mb-6">Settings</h1>

          {/* Profile */}
          <Section title="Profile">
            <Row label="Name" value={session?.user?.name ?? "—"} />
            <LastRow label="Email" value={session?.user?.email ?? "—"} />
          </Section>

          {/* Security */}
          <Section title="Security">
            <Row
              label="Password"
              hint="Change your login password"
              action={() => setChangingPassword(!changingPassword)}
              actionLabel={changingPassword ? "Cancel" : "Change"}
            />
            {changingPassword && (
              <form onSubmit={handlePasswordChange} className="px-4 pb-4 flex flex-col gap-2.5">
                {["current", "next", "confirm"].map((field) => (
                  <input
                    key={field}
                    type="password"
                    placeholder={field === "current" ? "Current password" : field === "next" ? "New password" : "Confirm new password"}
                    value={pwForm[field as keyof typeof pwForm]}
                    onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                    className="h-9 px-3 rounded-r2 text-[13px] outline-none"
                    style={{ background: tokens.bg3, border: `1px solid ${tokens.line2}`, color: tokens.fg0 }}
                  />
                ))}
                {pwError && <p className="text-[12px]" style={{ color: tokens.oxblood }}>{pwError}</p>}
                {pwSuccess && <p className="text-[12px]" style={{ color: tokens.forest }}>Password updated.</p>}
                <button
                  type="submit"
                  className="h-9 rounded-r2 text-[13px] font-semibold text-[#1a1108]"
                  style={{ background: "linear-gradient(180deg, #d4964a, #b87a30)" }}
                >
                  Update password
                </button>
              </form>
            )}
            <LastRow
              label="Two-factor authentication"
              hint="Add an extra layer of security"
              action={() => router.push("/settings/2fa")}
              actionLabel="Set up"
            />
          </Section>

          {/* Integrations */}
          <Section title="Integrations">
            <Row
              label="Microsoft Outlook"
              hint="Sync emails and calendar events as tasks"
              action={() => signIn("microsoft-entra-id")}
              actionLabel="Connect"
            />
            <Row
              label="Slack"
              hint="Sync mentions and DMs as tasks"
              action={() => signIn("slack")}
              actionLabel="Connect"
            />
            <LastRow
              label="Granola"
              hint="Extract action items from meeting notes (Business plan required)"
              actionLabel="Via webhook"
              action={() => window.open("https://docs.granola.ai", "_blank")}
            />
          </Section>

          {/* Danger zone */}
          <Section title="Account">
            <LastRow
              label="Sign out"
              hint="Sign out of this device"
              action={() => signOut({ callbackUrl: "/login" })}
              actionLabel="Sign out"
              actionVariant="danger"
            />
          </Section>
        </div>
      </div>
    </div>
  );
}
