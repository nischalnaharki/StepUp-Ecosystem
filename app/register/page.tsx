import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";

export default function Register() {
  return (
    <main className="auth-page">
      <Link className="back" href="/">
        <span aria-hidden="true">←</span> StepUp Academy
      </Link>

      <section className="auth-container">
        <RegisterForm />
      </section>
    </main>
  );
}