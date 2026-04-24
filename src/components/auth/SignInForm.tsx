"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { tokens } from "@/lib/tokens";

type Props = { onSuccess: (email: string, requiresTOTP: boolean) => void };

function OAuthButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 h-10 px-4 rounded-r2 border text-[13px] font-medium text-fg-1 transition-colors hover:bg-bg-3 hover:text-fg-0"
      style={{ background: tokens.bg2, borderColor: tokens.line2 }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

const MicrosoftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <rect x="0" y="0" width="7.5" height="7.5" fill="#f25022"/>
    <rect x="8.5" y="0" width="7.5" height="7.5" fill="#7fba00"/>
    <rect x="0" y="8.5" width="7.5" height="7.5" fill="#00a4ef"/>
    <rect x="8.5" y="8.5" width="7.5" height="7.5" fill="#ffb900"/>
  </svg>
);

const SlackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3.6 10.4a1.6 1.6 0 1 1-1.6-1.6H3.6v1.6z" fill="#e01e5a"/>
    <path d="M4.4 10.4a1.6 1.6 0 0 1 3.2 0v4a1.6 1.6 0 0 1-3.2 0v-4z" fill="#e01e5a"/>
    <path d="M5.6 3.6a1.6 1.6 0 1 1 1.6-1.6V3.6H5.6z" fill="#36c5f0"/>
    <path d="M5.6 4.4a1.6 1.6 0 0 1 0 3.2H1.6A1.6 1.6 0 0 1 1.6 4.4h4z" fill="#36c5f0"/>
    <path d="M12.4 5.6a1.6 1.6 0 1 1 1.6 1.6H12.4V5.6z" fill="#2eb67d"/>
    <path d="M11.6 5.6a1.6 1.6 0 0 1-3.2 0v-4a1.6 1.6 0 0 1 3.2 0v4z" fill="#2eb67d"/>
    <path d="M10.4 12.4a1.6 1.6 0 1 1-1.6 1.6V12.4h1.6z" fill="#ecb22e"/>
    <path d="M10.4 11.6a1.6 1.6 0 0 1 0-3.2H14.4a1.6 1.6 0 0 1 0 3.2h-4z" fill="#ecb22e"/>
  </svg>
);

const GranolaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="#d4a55a">
    <path d="M8 0 L9.4 6.6 L16 8 L9.4 9.4 L8 16 L6.6 9.4 L0 8 L6.6 6.6 Z"/>
  </svg>
);

export function SignInForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);

    try {
      // Check if TOTP is required first
      const check = await fetch("/api/auth/check-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await check.json();

      if (!check.ok) {
        setError(data.error ?? "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.requiresTOTP) {
        // Has 2FA — hand off to 2FA screen, sign in will complete there
        onSuccess(email, true);
        return;
      }

      // No 2FA — sign in via NextAuth client-side to set session cookie
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        onSuccess(email, false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-fg-2">Email</label>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="h-10 px-3 rounded-r2 text-[13px] text-fg-0 outline-none transition-colors"
          style={{ background: tokens.bg4, border: `1px solid ${tokens.line2}` }}
          onFocus={e => (e.target.style.borderColor = tokens.bronze)}
          onBlur={e => (e.target.style.borderColor = tokens.line2)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-medium text-fg-2">Password</label>
          <button type="button" className="text-[12px] text-fg-3 hover:text-bronze transition-colors">
            Forgot password?
          </button>
        </div>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="h-10 px-3 rounded-r2 text-[13px] text-fg-0 outline-none transition-colors"
          style={{ background: tokens.bg4, border: `1px solid ${tokens.line2}` }}
          onFocus={e => (e.target.style.borderColor = tokens.bronze)}
          onBlur={e => (e.target.style.borderColor = tokens.line2)}
        />
      </div>

      {error && <p className="text-[12px]" style={{ color: tokens.oxblood }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-10 w-full rounded-r2 text-[13px] font-semibold text-[#1a1108] transition-all disabled:opacity-60"
        style={{
          background: loading ? tokens.bronze : "linear-gradient(180deg, #d4964a, #b87a30)",
          border: `1px solid #8a5a1e`,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.4)",
        }}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: tokens.line }} />
        <span className="text-[11px] text-fg-3">or continue with</span>
        <div className="flex-1 h-px" style={{ background: tokens.line }} />
      </div>

      <div className="flex flex-col gap-2">
        <OAuthButton icon={<MicrosoftIcon />} label="Continue with Microsoft" onClick={() => signIn("microsoft-entra-id")} />
        <OAuthButton icon={<SlackIcon />} label="Continue with Slack" onClick={() => signIn("slack")} />
        <OAuthButton icon={<GranolaIcon />} label="Continue with Granola" />
      </div>
    </form>
  );
}
