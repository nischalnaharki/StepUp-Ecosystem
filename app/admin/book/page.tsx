import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";

export default async function Book({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; uploaded?: string }>;
}) {
  if ((await auth())?.user.role !== "admin") {
    redirect("/admin/login");
  }

  const [courses, params] = await Promise.all([
    prisma.course.findMany({
      where: { hasBook: true },
      include: { bookAsset: true },
      orderBy: { createdAt: "asc" },
    }),
    searchParams,
  ]);

  return (
    <main className="admin">
      <AdminNav />

      <header>
        <p className="eyebrow">COURSE CONTENT</p>
        <h1>Manage books</h1>
        <p>Each enabled course has its own book PDF. Uploading a file only replaces that course&apos;s book.</p>
      </header>

      {params.error && <p className="error">{params.error}</p>}
      {params.uploaded && <p className="success">Book uploaded successfully.</p>}

      {courses.length === 0 ? <section className="card admin-card"><p>No courses have the Book module enabled. Enable it from Manage Courses first.</p></section> : <div className="table course-table">{courses.map((course) => <article key={course.id}><div className="course-details"><h2>{course.name}</h2><p><code>/{course.slug}</code></p>{course.bookAsset ? <p><strong>Current file:</strong> {course.bookAsset.filename}<br /><span>Uploaded {course.bookAsset.uploadedAt.toLocaleString()}</span></p> : <p>No book PDF has been uploaded yet.</p>}</div><form action="/api/admin/book" method="post" encType="multipart/form-data" className="form compact"><input type="hidden" name="courseId" value={course.id} /><input type="file" name="book" accept="application/pdf,.pdf" required aria-label={`${course.name} book PDF`} /><button>{course.bookAsset ? "Replace PDF" : "Upload PDF"}</button><p className="fine">PDF only, maximum 50 MB.</p></form></article>)}</div>}
    </main>
  );
}
