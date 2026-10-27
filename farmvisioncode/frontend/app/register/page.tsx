import Link from "next/link";
import { AuthForm } from "../../src/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span>FarmVision<span className="brand-ai"> AI</span></span>
      </Link>
      <section className="auth-card">
        <p className="eyebrow">JOIN FARMVISION</p>
        <h1>Create a farmer account</h1>
        <p className="auth-intro">
          Register with your email. You’ll need to verify the address and wait for administrator approval before signing in.
        </p>
        <AuthForm mode="register" />
        <p className="auth-policy">
          Registration is currently for farmers. Other roles require administrator assignment.
        </p>
      </section>
      <p className="auth-footer"><Link href="/">← Back to FarmVision</Link></p>
    </main>
  );
}
