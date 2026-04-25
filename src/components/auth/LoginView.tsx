"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInForm } from "./SignInForm";
import { TwoFactorForm } from "./TwoFactorForm";
import { tokens } from "@/lib/tokens";

type Step = "signin" | "2fa";

export function LoginView() {
  const [step, setStep] = useState<Step>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: tokens.bg0 }}
    >
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${tokens.line} 1px, transparent 1px),
            linear-gradient(90deg, ${tokens.line} 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.4,
        }}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[400px] rounded-r4 p-8 flex flex-col gap-6"
        style={{
          background: tokens.bg1,
          border: `1px solid ${tokens.line2}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <div
            className="w-11 h-11 rounded-r3 flex items-center justify-center text-[18px] font-bold text-[#1a1108]"
            style={{ background: "linear-gradient(135deg, #c8893f, #8a5a1e)" }}
          >
            d.
          </div>
          <div className="text-center">
            <div className="font-display text-[20px] font-semibold tracking-[-0.02em]">
              {step === "signin" ? "Sign in to do." : "Verify your identity"}
            </div>
            {step === "signin" && (
              <p className="text-[12px] text-fg-3 mt-1">
                Your unified action inbox
              </p>
            )}
          </div>
        </div>

        {/* Step content */}
        {step === "signin" ? (
          <SignInForm
            onSuccess={(e, requiresTOTP, pw) => {
              setEmail(e);
              if (requiresTOTP) {
                setPassword(pw);
                setStep("2fa");
              } else {
                router.push("/");
              }
            }}
          />
        ) : (
          <TwoFactorForm
            email={email}
            password={password}
            onSuccess={() => router.push("/")}
            onBack={() => setStep("signin")}
          />
        )}

        {/* Footer */}
        {step === "signin" && (
          <p className="text-center text-[11.5px] text-fg-3">
            Don't have an account?{" "}
            <button className="text-bronze hover:underline transition-colors">
              Request access
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
