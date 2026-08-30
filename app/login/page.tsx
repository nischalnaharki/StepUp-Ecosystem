import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="auth-page">
      <Link className="back" href="/">
        <span aria-hidden="true">←</span> StepUp Academy
      </Link>

      <section className="auth-container">
        <LoginForm loggedOutElsewhere={error === "signed-in-elsewhere"} />
      </section>
    </main>
  );
}
