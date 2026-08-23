import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ApprovalStatus, Course } from "@prisma/client";
import { AdminNav } from "@/components/admin-nav";
import { setApproval, updateCourse } from "../actions";

const labels: Record<string, string> = {
  AFTER_SEE: "After SEE",
  CLASS_11: "Class 11",
  CLASS_12: "Class 12",
};

export default async function Students({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; course?: string }>;
}) {
  if ((await auth())?.user.role !== "admin") {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const q = params.q?.trim();

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(Object.values(ApprovalStatus).includes(params.status as ApprovalStatus)
      ? { approvalStatus: params.status as ApprovalStatus }
      : {}),
    ...(Object.values(Course).includes(params.course as Course)
      ? { selectedCourse: params.course as Course }
      : {}),
  };

  const students = await prisma.student.findMany({
    where,
    orderBy: { createdAt: "desc" },
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
        <input name="q" defaultValue={q} placeholder="Search name or email" />

        <select name="status" defaultValue={params.status || ""}>
          <option value="">All statuses</option>
          {Object.values(ApprovalStatus).map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>

        <select name="course" defaultValue={params.course || ""}>
          <option value="">All courses</option>
          {Object.entries(labels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>

        <button>Filter</button>
      </form>

      <div className="table directory">
        {students.length === 0 ? (
          <section className="empty">
            <h2>No students found</h2>
          </section>
        ) : (
          students.map((student) => (
            <article key={student.id}>
              <div>
                <h2>
                  {student.name}{" "}
                  <span className={`status ${student.approvalStatus.toLowerCase()}`}>
                    {student.approvalStatus}
                  </span>
                </h2>
                <p>
                  {student.email} · Registered {student.createdAt.toLocaleDateString()}
                </p>
              </div>

              <div className="row">
                <form action={updateCourse.bind(null, student.id)}>
                  <select name="course" defaultValue={student.selectedCourse}>
                    {Object.entries(labels).map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button>Save course</button>
                </form>

                {student.approvalStatus === "APPROVED" && (
                  <form action={setApproval.bind(null, student.id, "SUSPENDED")}>
                    <button className="decline">Suspend</button>
                  </form>
                )}

                {student.approvalStatus === "SUSPENDED" && (
                  <form action={setApproval.bind(null, student.id, "APPROVED")}>
                    <button>Reinstate</button>
                  </form>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}