import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseTabs } from "@/components/course-tabs";

// Module flags are admin-managed, so always read the student's current course record.
export const dynamic = "force-dynamic";

export default async function Course() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "student") redirect("/admin");

  const student = await prisma.student.findUnique({ where: { id: session.user.id }, include: { course: true } });
  if (!student) redirect("/login");
  if (student.approvalStatus === "PENDING") return <Gate title="Registration pending" text="Your registration is awaiting admin approval. Please check back soon." />;
  if (student.approvalStatus === "DECLINED") return <Gate title="Registration declined" text="Your registration was not approved. Contact StepUp Academy if you believe this is a mistake." />;
  if (student.approvalStatus === "SUSPENDED") return <Gate title="Access suspended" text="Your access has been suspended. Contact StepUp Academy support for help." />;

  if (!student.course.hasBook && !student.course.hasMockTest) {
    return <main className="course"><p className="eyebrow">STEPUP ACADEMY</p><h1>{student.course.name}</h1><section className="empty"><h2>Coming soon</h2><p>We&apos;re preparing this course for you. Stay tuned!</p></section></main>;
  }

  const mockTests = student.course.hasMockTest ? await prisma.mockTest.findMany({ where: { courseId: student.courseId, isPublished: true }, include: { sections: { include: { _count: { select: { questions: true } } } }, attempts: { where: { studentId: student.id }, orderBy: { startedAt: "desc" }, select: { status: true } } }, orderBy: { createdAt: "desc" } }) : [];
  const availableTests = mockTests.map((test) => ({ id: test.id, name: test.name, questionCount: test.sections.reduce((total, section) => total + section._count.questions, 0), timeLimitMinutes: test.timeLimitMinutes, status: test.attempts.find((attempt) => attempt.status === "IN_PROGRESS") ? "IN_PROGRESS" as const : test.attempts.length ? "COMPLETED" as const : "NOT_STARTED" as const }));

  return <main className="course"><p className="eyebrow">STEPUP ACADEMY · {student.course.name.toUpperCase()}</p><h1>Welcome, {student.name.split(" ")[0]}!</h1><p className="lead">Choose a module to continue learning.</p><CourseTabs hasBook={student.course.hasBook} hasMockTest={student.course.hasMockTest} mockTests={availableTests} /></main>;
}

function Gate({ title, text }: { title: string; text: string }) {
  return <main className="auth-page"><section className="card centered"><h1>{title}</h1><p>{text}</p><Link className="button" href="/">Back home</Link></section></main>;
}
