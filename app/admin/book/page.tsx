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

  const [book, params] = await Promise.all([
    prisma.bookAsset.findUnique({ where: { id: "after-see-book" } }),
    searchParams,
  ]);

  return (
    <main className="admin">
      <AdminNav />

      <header>
        <p className="eyebrow">AFTER SEE</p>
        <h1>Manage book</h1>
        <p>Upload the bridge-course PDF students open from their course page.</p>
      </header>

      <section className="card admin-card">
        {book ? (
          <p>
            <strong>Current file:</strong> {book.filename}
            <br />
            <span>Uploaded {book.uploadedAt.toLocaleString()}</span>
          </p>
        ) : (
          <p>No book PDF has been uploaded yet.</p>
        )}

        {params.error && <p className="error">{params.error}</p>}
        {params.uploaded && <p className="success">Book uploaded successfully.</p>}

        <form
          action="/api/admin/book"
          method="post"
          encType="multipart/form-data"
          className="form compact"
        >
          <input type="file" name="book" accept="application/pdf,.pdf" required />
          <button>Upload PDF</button>
          <p className="fine">PDF only, maximum 50 MB. A new upload replaces the current file.</p>
        </form>
      </section>
    </main>
  );
}