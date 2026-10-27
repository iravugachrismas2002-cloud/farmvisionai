"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/forms";
import { Alert } from "@/components/ui/alert";

type AuthMode = "login" | "register";

type AuthResponse = {
  message?: string;
  error?: string;
  issues?: Array<{ path: string; message: string }>;
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isRegistration = mode === "register";
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage(null);
    setIsError(false);
    setIsSubmitting(true);

    const data = new FormData(event.currentTarget);
    const payload = isRegistration
      ? {
          firstName: String(data.get("firstName") ?? ""),
          lastName: String(data.get("lastName") ?? ""),
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
        }
      : {
          email: String(data.get("email") ?? ""),
          password: String(data.get("password") ?? ""),
        };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as AuthResponse;

      if (!response.ok) {
        setIsError(true);
        setMessage(
          result.issues?.[0]?.message ??
            result.error ??
            "The request could not be completed.",
        );
        return;
      }

      setMessage(result.message ?? "The request completed.");
      if (mode === "login") router.push("/dashboard");
      if (isRegistration) form.reset();
    } catch {
      setIsError(true);
      setMessage("FarmVision could not be reached. Check the connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="auth-card">
      <CardHeader
        title={
          <div>
            <p className="eyebrow">{isRegistration ? "JOIN FARMVISION" : "WELCOME BACK"}</p>
            <h1 className="mb-2">{isRegistration ? "Create a farmer account" : "Sign in to FarmVision"}</h1>
          </div>
        }
      />
      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegistration ? (
          <div className="auth-name-row">
            <Input
              label="First name"
              placeholder="Enter your first name"
              name="firstName"
              autoComplete="given-name"
              maxLength={80}
              required
            />
            <Input
              label="Last name"
              placeholder="Enter your last name"
              name="lastName"
              autoComplete="family-name"
              maxLength={80}
              required
            />
          </div>
        ) : null}
        <Input
          label="Email address"
          placeholder="you@farm.com"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          placeholder="••••••••••••"
          name="password"
          type="password"
          autoComplete={isRegistration ? "new-password" : "current-password"}
          minLength={isRegistration ? 12 : 1}
          maxLength={128}
          required
        />
        {isRegistration && (
          <p className="auth-hint">Use at least 12 characters.</p>
        )}

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
          {isSubmitting
            ? "Please wait…"
            : isRegistration
              ? "Create farmer account"
              : "Sign in"}
        </Button>

        <p className="auth-switch">
          {isRegistration ? "Already have an account?" : "New to FarmVision?"}{" "}
          <Link href={isRegistration ? "/login" : "/register"}>
            {isRegistration ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </form>
    </Card>
  );
}

export function EmailVerification({ token }: { token: string }) {
  const [message, setMessage] = useState("Verifying your email…");
  const [isError, setIsError] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const verificationStarted = useRef(false);

  const verify = useCallback(async () => {
    setMessage("Verifying your email…");
    setIsError(false);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = (await response.json()) as AuthResponse;
      if (!response.ok) {
        setIsError(true);
        setMessage(result.error ?? "This verification link is invalid or expired.");
        return;
      }
      setHasVerified(true);
      setMessage(result.message ?? "Your email was verified.");
    } catch {
      setIsError(true);
      setMessage("FarmVision could not be reached. Check the connection and try again.");
    }
  }, [token]);

  useEffect(() => {
    if (verificationStarted.current) return;
    verificationStarted.current = true;
    void verify();
  }, [verify]);

  return (
    <div className="verification-status">
      <Alert
        severity={isError ? "error" : "success"}
        title={isError ? "Verification failed" : hasVerified ? "Email verified" : "Verifying…"}
        description={message}
      />
      {isError && !hasVerified ? (
        <Button
          variant="secondary"
          onClick={() => void verify()}
          type="button"
          className="mt-4"
        >
          Try again
        </Button>
      ) : null}
      {hasVerified ? (
        <Button
          variant="primary"
          href="/login"
          className="mt-4"
        >
          Continue to sign in
        </Button>
      ) : null}
    </div>
  );
}
