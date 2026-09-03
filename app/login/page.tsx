import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (session?.user.role === "student") redirect("/course");
  if (session?.user.role === "admin") redirect("/admin");
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
