import Link from "next/link";
import { AuthForm } from "../../src/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span>FarmVision<span className="brand-ai"> AI</span></span>
      </Link>
      <section className="auth-card">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in to FarmVision</h1>
        <p className="auth-intro">Use your verified, approved farmer account to continue.</p>
        <AuthForm mode="login" />
      </section>
      <p className="auth-switch">
        Forgot your password?{" "}
        <Link href="/forgot-password">Reset it</Link>
      </p>
      <p className="auth-footer"><Link href="/">← Back to FarmVision</Link></p>
    </main>
  );
}
