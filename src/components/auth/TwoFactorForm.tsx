"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { tokens } from "@/lib/tokens";
import { Sparkle } from "@/components/ui/Sparkle";

type Props = {
  email: string;
  password: string;
  onSuccess: () => void;
  onBack: () => void;
};

const PERIOD = 30;

export function TwoFactorForm({ email, password, onSuccess, onBack }: Props) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(PERIOD);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer synced to real TOTP 30s window
  useEffect(() => {
    const tick = () => {
      const s = PERIOD - (Math.floor(Date.now() / 1000) % PERIOD);
      setSecondsLeft(s);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const submit = useCallback(async (code: string) => {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      totpCode: code,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid code. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } else {
      onSuccess();
    }
  }, [email, password, onSuccess]);

  const handleChange = (i: number, val: string) => {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = ch;
    setDigits(next);
    setError("");

    if (ch && i < 5) {
      inputs.current[i + 1]?.focus();
    }
    if (next.every(d => d !== "")) {
      submit(next.join(""));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputs.current[5]?.focus();
      submit(pasted);
    }
    e.preventDefault();
  };

  const progress = (secondsLeft / PERIOD) * 100;
  const urgent = secondsLeft <= 8;

  return (
    <div className="flex flex-col gap-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div
          className="w-12 h-12 rounded-r3 flex items-center justify-center"
          style={{ background: tokens.bronzeSoft, border: `1px solid ${tokens.bronzeLine}` }}
        >
          <Sparkle size={22} />
        </div>
      </div>

      {/* Copy */}
      <div className="text-center">
        <h2 className="mb-1.5">Two-factor authentication</h2>
        <p className="text-[12.5px] text-fg-2 leading-relaxed">
          Enter the 6-digit code from your authenticator app
          <br />
          <span className="font-mono-do text-[11px] text-fg-3">{email}</span>
        </p>
      </div>

      {/* 6-digit input */}
      <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            autoFocus={i === 0}
            className="w-11 h-13 text-center text-[22px] font-semibold rounded-r2 outline-none transition-all font-mono-do"
            style={{
              height: 52,
              background: tokens.bg4,
              border: `1.5px solid ${d ? tokens.bronze : error ? tokens.oxblood : tokens.line2}`,
              color: tokens.fg0,
              caretColor: tokens.bronze,
            }}
            onFocus={e => (e.target.style.borderColor = tokens.bronze)}
            onBlur={e => (e.target.style.borderColor = d ? tokens.bronze : tokens.line2)}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-[12px]" style={{ color: tokens.oxblood }}>{error}</p>
      )}

      {/* Timer bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono-do text-[10.5px] text-fg-3 uppercase tracking-[0.06em]">Code expires in</span>
          <span
            className="font-mono-do text-[11px] font-semibold tabular-nums"
            style={{ color: urgent ? tokens.oxblood : tokens.fg2 }}
          >
            {String(secondsLeft).padStart(2, "0")}s
          </span>
        </div>
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: tokens.bg3 }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              background: urgent
                ? tokens.oxblood
                : `linear-gradient(90deg, ${tokens.bronze}, #d4964a)`,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 items-center">
        <button
          type="button"
          className="text-[12px] text-fg-3 hover:text-bronze transition-colors"
        >
          Use a recovery code instead
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] text-fg-3 hover:text-fg-1 transition-colors flex items-center gap-1"
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  );
}
