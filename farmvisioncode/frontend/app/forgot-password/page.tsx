"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/alert";

type AuthResponse = {
  message?: string;
  error?: string;
  emailSent?: boolean;
  resetToken?: string;
};

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      setMessage(null);
      setIsError(false);
      setIsSubmitting(true);

      const data = new FormData(form);
      const email = String(data.get("email") ?? "");

      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const result = (await response.json()) as AuthResponse;

        if (!response.ok) {
          setIsError(true);
          setMessage(result.error ?? "The request could not be completed.");
          return;
        }

        setMessage(
          result.message ??
            "If an account exists for this email, a password reset link has been sent.",
        );
        if (result.resetToken) {
          setResetToken(result.resetToken);
        }
        form.reset();
      } catch {
        setIsError(true);
        setMessage("FarmVision could not be reached. Check the connection and try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span>FarmVision<span className="brand-ai"> AI</span></span>
      </Link>
      <Card className="auth-card">
        <CardHeader
          title={
            <div>
              <p className="eyebrow">FORGOT PASSWORD</p>
              <h1>Reset your password</h1>
              <p className="auth-intro">
                Enter your email address and we’ll send you a link to reset your password.
              </p>
            </div>
          }
        />
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            placeholder="you@farm.com"
            name="email"
            type="email"
            autoComplete="email"
            required
          />

          {message ? (
            <Alert
              severity={isError ? "error" : "success"}
              title={isError ? "Error" : "Success"}
              description={message}
            />
          ) : null}

          {resetToken ? (
            <div className="auth-token-box">
              <p className="auth-token-label">Reset token (for local development):</p>
              <code className="auth-token-code">{resetToken}</code>
              <p className="auth-token-hint">
                Use this token at <code>/reset-password?token=...</code> to reset your password.
              </p>
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="primary"
            className="auth-submit"
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>

          <p className="auth-switch">
            Remember your password?{" "}
            <Link href="/login">Sign in</Link>
          </p>
          <p className="auth-footer"><Link href="/">← Back to FarmVision</Link></p>
        </form>
      </Card>
    </main>
  );
}
