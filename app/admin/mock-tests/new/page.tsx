import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";
import { MockTestEditor } from "@/components/mock-test-editor";
import { createMockTest } from "../actions";

export default async function NewMockTest({ searchParams }: { searchParams: Promise<{ error?: string }> }) { if ((await auth())?.user.role !== "admin") redirect("/admin/login"); const [courses, params] = await Promise.all([prisma.course.findMany({ where: { hasMockTest: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }), searchParams]); return <main className="admin"><AdminNav /><header><p className="eyebrow">ASSESSMENTS</p><h1>Create mock test</h1><p>Add sections and questions, then preview before publishing.</p></header>{params.error && <p className="error">{params.error}</p>}{courses.length === 0 ? <section className="empty"><h2>No eligible courses</h2><p>Enable Mock Test for a course before creating a test.</p></section> : <MockTestEditor courses={courses} action={createMockTest} />}</main>; }
