import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setApproval } from "./actions";
import { AdminNav } from "@/components/admin-nav";

const label: Record<string, string> = {
  AFTER_SEE: "After SEE",
  CLASS_11: "Class 11",
  CLASS_12: "Class 12",
};

export default async function Admin() {
  if ((await auth())?.user.role !== "admin") {
    redirect("/admin/login");
  }

  const [pending, byStatus, byCourse] = await Promise.all([
    prisma.student.findMany({
      where: { approvalStatus: "PENDING" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.student.groupBy({ by: ["approvalStatus"], _count: true }),
    prisma.student.groupBy({ by: ["selectedCourse"], _count: true }),
  ]);

  const status = (value: string) =>
    byStatus.find((item) => item.approvalStatus === value)?._count || 0;

  const course = (value: string) =>
    byCourse.find((item) => item.selectedCourse === value)?._count || 0;

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
          value={byStatus.reduce((total, item) => total + item._count, 0)}
          label="Total students"
        />
        <Stat value={status("PENDING")} label="Pending" />
        <Stat value={status("APPROVED")} label="Approved" />
        <Stat value={status("DECLINED")} label="Declined" />
        <Stat value={status("SUSPENDED")} label="Suspended" />
        <Stat value={course("AFTER_SEE")} label="After SEE" />
        <Stat value={course("CLASS_11")} label="Class 11" />
        <Stat value={course("CLASS_12")} label="Class 12" />
      </section>

      {pending.length === 0 ? (
        <section className="empty">
          <h2>All caught up</h2>
          <p>There are no pending registrations.</p>
        </section>
      ) : (
        <div className="table">
          {pending.map((student) => (
            <article key={student.id}>
              <div>
                <h2>{student.name}</h2>
                <p>
                  {student.email} · {label[student.selectedCourse]} ·{" "}
                  {student.createdAt.toLocaleDateString()}
                </p>
              </div>

              <div className="row">
                <form action={setApproval.bind(null, student.id, "APPROVED")}>
                  <button>Approve</button>
                </form>
                <form action={setApproval.bind(null, student.id, "DECLINED")}>
                  <button className="decline">Decline</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}