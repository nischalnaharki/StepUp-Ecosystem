import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";
import { StudentTable } from "@/components/student-table";
import { ApprovalStatus, Course, Student } from "@prisma/client";

type StatusTotal = { approvalStatus: ApprovalStatus; _count: number };
type CourseWithStudentCount = Course & { _count: { students: number } };

export default async function Admin() {
  if ((await auth())?.user.role !== "admin") redirect("/admin/login");

  const [pending, byStatus, courses] = await Promise.all([
    prisma.student.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.student.groupBy({ by: ["approvalStatus"], _count: true }),
    prisma.course.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const status = (value: ApprovalStatus) =>
    byStatus.find((item: StatusTotal) => item.approvalStatus === value)?._count || 0;

  return (
    <main className="admin">
      <AdminNav />
      <header>
        <p className="eyebrow">STEPUP ACADEMY · ADMIN</p>
        <h1>Pending registrations</h1>
        <p>Review student access requests.</p>
      </header>

      <section className="stats">
        <Stat
          value={byStatus.reduce(
            (total: number, item: StatusTotal) => total + item._count,
            0,
          )}
          label="Total students"
        />
        <Stat value={status("PENDING")} label="Pending" />
        <Stat value={status("APPROVED")} label="Approved" />
        <Stat value={status("DECLINED")} label="Declined" />
        <Stat value={status("SUSPENDED")} label="Suspended" />
        {courses.map((course: CourseWithStudentCount) => (
          <Stat key={course.id} value={course._count.students} label={course.name} />
        ))}
      </section>

      {pending.length === 0 ? (
        <section className="empty">
          <h2>All caught up</h2>
          <p>There are no pending registrations.</p>
        </section>
      ) : (
        <StudentTable
          courses={courses.map((course: CourseWithStudentCount) => ({
            id: course.id,
            name: course.name,
          }))}
          students={pending.map((student: Student) => ({
            id: student.id,
            name: student.name,
            email: student.email,
            courseId: student.courseId,
            courseName:
              courses.find((course: CourseWithStudentCount) => course.id === student.courseId)
                ?.name ?? "Unknown course",
            status: student.approvalStatus,
            registeredAt: student.createdAt.toLocaleDateString(),
          }))}
        />
      )}
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div><strong>{value}</strong><span>{label}</span></div>;
}
