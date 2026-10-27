"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/alert";

type AuthResponse = {
  message?: string;
  error?: string;
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const [token, setToken] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract token from search params on mount
  useEffect(() => {
    const paramsPromise = searchParams;
    let cancelled = false;

    paramsPromise.then((params) => {
      if (cancelled) return;
      const t = typeof params.token === "string" ? params.token : "";
      setToken(t);
    });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage(null);
    setIsError(false);
    setIsSubmitting(true);

    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 12) {
      setIsError(true);
      setMessage("Password must be at least 12 characters.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = (await response.json()) as AuthResponse;

      if (!response.ok) {
        setIsError(true);
        setMessage(result.error ?? "The request could not be completed.");
        return;
      }

      setMessage(result.message ?? "Your password has been reset successfully.");
      form.reset();
    } catch {
      setIsError(true);
      setMessage("FarmVision could not be reached. Check the connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasToken = token.length > 0;

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
              <p className="eyebrow">RESET PASSWORD</p>
              <h1>Create a new password</h1>
            </div>
          }
        />

        {!hasToken ? (
          <>
            <Alert
              severity="error"
              title="No reset token provided"
              description="Please request a password reset first."
            />
            <p className="auth-footer">
              <Link href="/forgot-password">Request password reset</Link>
            </p>
          </>
        ) : (
          <>
            <p className="auth-intro">
              Enter your new password below. It must be at least 12 characters.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <Input
                label="New password"
                placeholder="••••••••••••"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />
              <Input
                label="Confirm new password"
                placeholder="••••••••••••"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />

              {message ? (
                <Alert
                  severity={isError ? "error" : "success"}
                  title={isError ? "Error" : "Success"}
                  description={message}
                />
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                className="auth-submit"
              >
                {isSubmitting ? "Resetting…" : "Reset password"}
              </Button>
            </form>

            <p className="auth-switch">
              Remember your password?{" "}
              <Link href="/login">Sign in</Link>
            </p>
          </>
        )}
        <p className="auth-footer"><Link href="/">← Back to FarmVision</Link></p>
      </Card>
    </main>
  );
}
