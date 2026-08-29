import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin-nav";
import { createAdmin } from "../actions";
import { PasswordInput } from "@/components/password-input";

export default async function Admins({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  if ((await auth())?.user.role !== "admin") {
    redirect("/admin/login");
  }

  const [admins, params] = await Promise.all([
    prisma.admin.findMany({ orderBy: { createdAt: "asc" } }),
    searchParams,
  ]);

  return (
    <main className="admin">
      <AdminNav />

      <header>
        <p className="eyebrow">ADMINISTRATION</p>
        <h1>Manage admins</h1>
        <p>Create credentials for another StepUp administrator.</p>
      </header>

      <section className="card admin-card">
        <h2>New admin account</h2>

        {params.error && (
          <p className="error">
            {params.error === "duplicate"
              ? "An admin with that email already exists."
              : "Enter a valid email and a password of at least 8 characters."}
          </p>
        )}
        {params.created && <p className="success">Admin account created.</p>}

        <form action={createAdmin} className="form compact">
          <input name="name" placeholder="Admin name" />
          <input name="email" type="email" placeholder="Admin email" required />
          <PasswordInput
            name="password"
            minLength={8}
            placeholder="Password (8+ characters)"
            required
          />
          <button>Create admin</button>
        </form>
      </section>

      <div className="table">
        {admins.map((admin) => (
          <article key={admin.id}>
            <div>
              <h2>{admin.name}</h2>
              <p>{admin.email}</p>
              <p>Created {admin.createdAt.toLocaleDateString()}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
