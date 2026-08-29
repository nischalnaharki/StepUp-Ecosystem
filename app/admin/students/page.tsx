import { auth } from "@/auth";
import { AdminNav } from "@/components/admin-nav";
import { StudentTable } from "@/components/student-table";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function Students({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; course?: string }> }) {
  if ((await auth())?.user.role !== "admin") redirect("/admin/login");
  const params = await searchParams;
  const q = params.q?.trim();
  const courses = await prisma.course.findMany({ orderBy: { createdAt: "asc" } });
  const selectedCourseId = courses.some((course) => course.id === params.course) ? params.course : undefined;
  const where = {
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] } : {}),
    ...(Object.values(ApprovalStatus).includes(params.status as ApprovalStatus) ? { approvalStatus: params.status as ApprovalStatus } : {}),
    ...(selectedCourseId ? { courseId: selectedCourseId } : {}),
  };
  const students = await prisma.student.findMany({ where, orderBy: { createdAt: "desc" } });

  return <main className="admin"><AdminNav /><header><p className="eyebrow">STUDENT DIRECTORY</p><h1>All students</h1><p>Search, update course placement, and manage access.</p></header><form className="filters"><input name="q" defaultValue={q} placeholder="Search name or email" /><select name="status" defaultValue={params.status || ""}><option value="">All statuses</option>{Object.values(ApprovalStatus).map((value) => <option key={value} value={value}>{value}</option>)}</select><select name="course" defaultValue={params.course || ""}><option value="">All courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select><button type="submit">Filter</button></form><StudentTable directory courses={courses.map((course) => ({ id: course.id, name: course.name }))} students={students.map((student) => ({ id: student.id, name: student.name, email: student.email, courseId: student.courseId, courseName: courses.find((course) => course.id === student.courseId)?.name ?? "Unknown course", status: student.approvalStatus, registeredAt: student.createdAt.toLocaleDateString() }))} /></main>;
}
