import Link from "next/link";
import { EmailVerification } from "../../../src/components/auth/auth-form";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span>FarmVision<span className="brand-ai"> AI</span></span>
      </Link>
      <section className="auth-card">
        <p className="eyebrow">EMAIL VERIFICATION</p>
        <h1>Confirm your email</h1>
        {token ? (
          <EmailVerification token={token} />
        ) : (
          <p className="auth-message auth-message-error" role="alert">
            This verification link is missing its token. Open the complete link from your email.
          </p>
        )}
      </section>
      <p className="auth-footer"><Link href="/login">Return to sign in</Link></p>
    </main>
  );
}
