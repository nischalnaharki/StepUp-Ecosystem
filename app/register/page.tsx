import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";
import { prisma } from "@/lib/prisma";

// Course choices are managed by admins and must never be served from a build-time cache.
export const dynamic = "force-dynamic";

export default async function Register() {
  const courses = await prisma.course.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });
  return (
    <main className="auth-page">
      <Link className="back" href="/">
        <span aria-hidden="true">←</span> StepUp Academy
      </Link>

      <section className="auth-container">
        <RegisterForm courses={courses} />
      </section>
    </main>
  );
}
