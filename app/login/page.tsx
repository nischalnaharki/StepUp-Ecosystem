import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export default function Login() {
  return (
    <main className="auth-page">
      <Link className="back" href="/">
        <span aria-hidden="true">←</span> StepUp Academy
      </Link>

      <section className="auth-container">
        <LoginForm />
      </section>
    </main>
  );
}