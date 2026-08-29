import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";
import { CourseManager } from "@/components/course-manager";

export default async function Courses({ searchParams }: { searchParams: Promise<{ error?: string; created?: string; updated?: string; deleted?: string }> }) {
  if ((await auth())?.user.role !== "admin") redirect("/admin/login");
  const [courses, bookAsset, params] = await Promise.all([
    prisma.course.findMany({ include: { _count: { select: { students: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.bookAsset.findUnique({ where: { id: "after-see-book" }, select: { id: true } }),
    searchParams,
  ]);
  const messages: Record<string, string> = { invalid: "Enter a course name and a URL-safe slug.", duplicate: "That slug is already in use.", enrolled: "This course cannot be deleted while students are enrolled.", missing: "Course not found." };

  return <main className="admin"><AdminNav /><header><p className="eyebrow">ADMINISTRATION</p><h1>Manage courses</h1><p>Create courses, choose their available modules, and manage course details.</p></header>{params.error && <p className="error">{messages[params.error] || "Unable to save the course."}</p>}{params.created && <p className="success">Course created.</p>}{params.updated && <p className="success">Course updated.</p>}{params.deleted && <p className="success">Course deleted.</p>}<CourseManager courses={courses.map((course) => ({ id: course.id, name: course.name, slug: course.slug, hasBook: course.hasBook, hasMockTest: course.hasMockTest, hasVideos: course.hasVideos, hasNotes: course.hasNotes, hasNotices: course.hasNotices, studentCount: course._count.students, hasBookContent: course.slug === "after-see" && Boolean(bookAsset) }))} /></main>;
}
