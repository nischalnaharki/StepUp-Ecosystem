import { LoginForm } from "@/components/auth-forms";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLogin() {
  const session = await auth();
  if (session?.user.role === "admin") redirect("/admin");
  if (session?.user.role === "student") redirect("/course");

  return (
    <main className="auth-page">
      <Link className="back" href="/">
        ← StepUp Academy
      </Link>
      <LoginForm admin />
    </main>
  );
}
