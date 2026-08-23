import { LoginForm } from "@/components/auth-forms";
import Link from "next/link";

export default function AdminLogin() {
  return (
    <main className="auth-page">
      <Link className="back" href="/">
        ← StepUp Academy
      </Link>
      <LoginForm admin />
    </main>
  );
}