import { auth } from "@/auth";
import { AdminNav } from "@/components/admin-nav";
import { StudentTable } from "@/components/student-table";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus, Course } from "@prisma/client";
import { redirect } from "next/navigation";

const labels: Record<string, string> = {
  AFTER_SEE: "After SEE",
  CLASS_11: "Class 11",
  CLASS_12: "Class 12",
};

export default async function Students({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    course?: string;
  }>;
}) {
  const session = await auth();

  if (session?.user.role !== "admin") {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const q = params.q?.trim();

  const where = {
    ...(q
      ? {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(Object.values(ApprovalStatus).includes(
      params.status as ApprovalStatus,
    )
      ? {
          approvalStatus: params.status as ApprovalStatus,
        }
      : {}),

    ...(Object.values(Course).includes(params.course as Course)
      ? {
          selectedCourse: params.course as Course,
        }
      : {}),
  };

  const students = await prisma.student.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="admin">
      <AdminNav />

      <header>
        <p className="eyebrow">STUDENT DIRECTORY</p>
        <h1>All students</h1>
        <p>Search, update course placement, and manage access.</p>
      </header>

      <form className="filters">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
        />

        <select
          name="status"
          defaultValue={params.status || ""}
        >
          <option value="">All statuses</option>

          {Object.values(ApprovalStatus).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <select
          name="course"
          defaultValue={params.course || ""}
        >
          <option value="">All courses</option>

          {Object.entries(labels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <button type="submit">Filter</button>
      </form>

      <StudentTable
        directory
        students={students.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          course: student.selectedCourse,
          status: student.approvalStatus,
          registeredAt: student.createdAt.toLocaleDateString(),
        }))}
      />
    </main>
  );
}