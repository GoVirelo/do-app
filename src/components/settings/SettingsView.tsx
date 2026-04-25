"use client";

import { useState, useEffect } from "react";
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

  // Shortcuts token state
  const [shortcutToken, setShortcutToken] = useState<string | null>(null);
  const [shortcutTokenLoaded, setShortcutTokenLoaded] = useState(false);
  const [copiedKind, setCopiedKind] = useState<"work" | "personal" | null>(null);

  useEffect(() => {
    fetch("/api/shortcuts/token")
      .then(r => r.json())
      .then(d => { setShortcutToken(d.token); setShortcutTokenLoaded(true); })
      .catch(() => setShortcutTokenLoaded(true));
  }, []);

  async function generateShortcutToken() {
    const res = await fetch("/api/shortcuts/token", { method: "POST" });
    const d = await res.json();
    setShortcutToken(d.token);
    setCopiedKind(null);
  }

  function copyShortcutUrl(kind: "work" | "personal") {
    const source = kind === "personal" ? "&source=personal" : "";
    const url = `${window.location.origin}/api/shortcuts/task?token=${shortcutToken}${source}`;
    navigator.clipboard.writeText(url);
    setCopiedKind(kind);
    setTimeout(() => setCopiedKind(null), 2000);
  }

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [setting2FA, setSetting2FA] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpSuccess, setTotpSuccess] = useState(false);
  const [totpLoading, setTotpLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/2fa/status")
      .then(r => r.json())
      .then(d => { if (d.enabled) setTwoFactorEnabled(true); })
      .catch(() => {});
  }, []);

  async function handleSetup2FA() {
    setSetting2FA(true);
    setTotpError("");
    setTotpSuccess(false);
    setTotpCode("");
    const res = await fetch("/api/auth/2fa/setup");
    const d = await res.json();
    setQrDataUrl(d.qrDataUrl);
    setTotpSecret(d.secret);
  }

  async function handleVerify2FA() {
    setTotpLoading(true);
    setTotpError("");
    const res = await fetch("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: totpCode }),
    });
    setTotpLoading(false);
    if (res.ok) {
      setTwoFactorEnabled(true);
      setSetting2FA(false);
      setTotpSuccess(true);
      setQrDataUrl("");
      setTotpSecret("");
      setTotpCode("");
    } else {
      const d = await res.json();
      setTotpError(d.error ?? "Invalid code. Try again.");
    }
  }

  async function handleDisable2FA() {
    await fetch("/api/auth/2fa/verify", { method: "DELETE" });
    setTwoFactorEnabled(false);
    setTotpSuccess(false);
  }

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
            <div style={{ borderBottom: "none" }}>
              <div className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <div className="text-[13px]" style={{ color: tokens.fg1 }}>Two-factor authentication</div>
                  <div className="text-[11px] mt-0.5" style={{ color: tokens.fg3 }}>
                    {twoFactorEnabled ? "Enabled — your account is protected" : "Add an extra layer of security"}
                  </div>
                </div>
                {twoFactorEnabled ? (
                  <button
                    onClick={handleDisable2FA}
                    className="text-[12px] font-medium px-3 h-7 rounded-r2 transition-colors hover:opacity-80"
                    style={{ color: tokens.oxblood, border: `1px solid ${tokens.oxblood}22`, background: `${tokens.oxblood}11` }}
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    onClick={setting2FA ? () => setSetting2FA(false) : handleSetup2FA}
                    className="text-[12px] font-medium px-3 h-7 rounded-r2 transition-colors hover:opacity-80"
                    style={{ color: tokens.bronze, border: `1px solid ${tokens.bronze}22`, background: `${tokens.bronze}11` }}
                  >
                    {setting2FA ? "Cancel" : "Set up"}
                  </button>
                )}
              </div>

              {totpSuccess && !setting2FA && (
                <p className="px-4 pb-3 text-[12px]" style={{ color: tokens.forest }}>Two-factor authentication enabled.</p>
              )}

              {setting2FA && (
                <div className="px-4 pb-5 flex flex-col gap-4">
                  <p className="text-[12px]" style={{ color: tokens.fg2 }}>
                    Scan this QR code with Microsoft Authenticator, Google Authenticator, or any TOTP app, then enter the 6-digit code to confirm.
                  </p>
                  {qrDataUrl && (
                    <div className="flex flex-col items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrDataUrl} alt="TOTP QR code" width={160} height={160} className="rounded-r2" style={{ imageRendering: "pixelated" }} />
                      <div className="font-mono text-[11px] px-2 py-1.5 rounded-r2 select-all" style={{ background: tokens.bg3, color: tokens.fg2, letterSpacing: "0.1em" }}>
                        {totpSecret}
                      </div>
                      <p className="text-[11px]" style={{ color: tokens.fg3 }}>Can't scan? Enter the key above manually in your app.</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={totpCode}
                      onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onKeyDown={e => e.key === "Enter" && totpCode.length === 6 && handleVerify2FA()}
                      className="w-32 h-9 px-3 rounded-r2 text-[14px] font-mono outline-none text-center tracking-widest"
                      style={{ background: tokens.bg3, border: `1px solid ${tokens.line2}`, color: tokens.fg0 }}
                    />
                    <button
                      onClick={handleVerify2FA}
                      disabled={totpCode.length !== 6 || totpLoading}
                      className="h-9 px-4 rounded-r2 text-[13px] font-semibold disabled:opacity-40"
                      style={{ background: "linear-gradient(180deg, #d4964a, #b87a30)", color: "#1a1108" }}
                    >
                      {totpLoading ? "Verifying…" : "Verify & enable"}
                    </button>
                  </div>
                  {totpError && <p className="text-[12px]" style={{ color: tokens.oxblood }}>{totpError}</p>}
                </div>
              )}
            </div>
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

          {/* iOS Shortcuts */}
          <Section title="iOS Shortcuts">
            {!shortcutTokenLoaded ? null : !shortcutToken ? (
              <div className="px-4 py-3.5">
                <div className="text-[13px] mb-1" style={{ color: tokens.fg1 }}>Add tasks via Siri or Shortcuts</div>
                <div className="text-[11px] mb-3" style={{ color: tokens.fg3 }}>Generate a token to create two shortcuts — one for work tasks, one for personal.</div>
                <button
                  onClick={generateShortcutToken}
                  className="text-[12px] font-medium px-3 h-7 rounded-r2 transition-colors hover:opacity-80"
                  style={{ color: tokens.bronze, border: `1px solid ${tokens.bronze}22`, background: `${tokens.bronze}11` }}
                >
                  Generate token
                </button>
              </div>
            ) : (
              <>
                {[
                  { kind: "work" as const,     label: "Work task",     siri: "Hey Siri, Add work task to Do",     color: tokens.steel },
                  { kind: "personal" as const, label: "Personal task", siri: "Hey Siri, Add personal task to Do", color: tokens.plum },
                ].map(({ kind, label, siri, color }) => (
                  <div key={kind} className="px-4 py-3.5" style={{ borderBottom: `1px solid ${tokens.line}` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-[13px]" style={{ color: tokens.fg1 }}>{label}</span>
                        <div className="font-mono-do text-[10px] mt-0.5" style={{ color: tokens.fg3 }}>"{siri}"</div>
                      </div>
                      <button
                        onClick={() => copyShortcutUrl(kind)}
                        className="text-[12px] font-medium px-3 h-7 rounded-r2 transition-colors hover:opacity-80 flex-shrink-0"
                        style={{
                          color: copiedKind === kind ? tokens.forest : color,
                          border: `1px solid ${(copiedKind === kind ? tokens.forest : color)}33`,
                          background: `${copiedKind === kind ? tokens.forest : color}11`,
                        }}
                      >
                        {copiedKind === kind ? "Copied!" : "Copy URL"}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${tokens.line}` }}>
                  <div className="text-[11.5px] font-medium mb-2" style={{ color: tokens.fg2 }}>Set up each shortcut</div>
                  <ol className="text-[11.5px] leading-loose list-decimal list-inside" style={{ color: tokens.fg3 }}>
                    <li>Copy a URL above</li>
                    <li>Shortcuts app → <strong style={{ color: tokens.fg2 }}>New Shortcut</strong></li>
                    <li>Add <strong style={{ color: tokens.fg2 }}>Ask for Input</strong> — prompt "Task name"</li>
                    <li>Add <strong style={{ color: tokens.fg2 }}>Get Contents of URL</strong> — paste URL, Method: POST</li>
                    <li>Request body JSON: <span className="font-mono" style={{ color: tokens.fg2 }}>{`{"title": [Provided Input]}`}</span></li>
                    <li>Name it e.g. <em>"Add work task to Do"</em> — Siri picks it up automatically</li>
                  </ol>
                </div>
                <div className="px-4 py-3 flex justify-end">
                  <button
                    onClick={generateShortcutToken}
                    className="text-[11.5px] transition-colors hover:opacity-80"
                    style={{ color: tokens.fg3 }}
                  >
                    Regenerate token (invalidates existing shortcuts)
                  </button>
                </div>
              </>
            )}
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
