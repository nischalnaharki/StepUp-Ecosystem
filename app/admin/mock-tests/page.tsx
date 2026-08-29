import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";

export default async function MockTests({ searchParams }: { searchParams: Promise<{ course?: string; deleted?: string }> }) {
  if ((await auth())?.user.role !== "admin") redirect("/admin/login");
  const params = await searchParams;
  const courses = await prisma.course.findMany({ where: { hasMockTest: true }, orderBy: { name: "asc" } });
  const selected = courses.some((course) => course.id === params.course) ? params.course : undefined;
  const tests = await prisma.mockTest.findMany({ where: selected ? { courseId: selected } : {}, include: { course: { select: { name: true } }, sections: { include: { _count: { select: { questions: true } } } } }, orderBy: { createdAt: "desc" } });
  return <main className="admin"><AdminNav /><header><p className="eyebrow">ASSESSMENTS</p><h1>Mock tests</h1><p>Create, proofread, publish, and manage course mock tests.</p></header>{params.deleted && <p className="success">Mock test deleted.</p>}<div className="mock-list-actions"><form className="filters"><select name="course" defaultValue={params.course || ""}><option value="">All Mock Test courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select><button>Filter</button></form><Link className="button" href="/admin/mock-tests/new">Create mock test</Link></div><div className="table">{tests.length === 0 ? <section className="empty"><h2>No mock tests found</h2><p>Create a draft to start adding questions.</p></section> : tests.map((test) => <article key={test.id}><div><h2>{test.name} <span className={`status ${test.isPublished ? "approved" : ""}`}>{test.isPublished ? "PUBLISHED" : "DRAFT"}</span></h2><p>{test.course.name} · {test.sections.reduce((total, section) => total + section._count.questions, 0)} questions · {test.timeLimitMinutes ? `${test.timeLimitMinutes} min` : "Untimed"}</p></div><Link className="button small" href={`/admin/mock-tests/${test.id}`}>Edit</Link></article>)}</div></main>;
}
