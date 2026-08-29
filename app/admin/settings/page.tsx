import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { AdminSettings } from "@/components/admin-settings";

export default async function Settings() {
  const session = await auth();
  if (session?.user.role !== "admin" || !session.user.id) redirect("/admin/login");
  const admin = await prisma.admin.findUnique({ where: { id: session.user.id } });
  if (!admin) redirect("/admin/login");
  return <main className="admin"><AdminNav /><header><p className="eyebrow">ADMINISTRATION</p><h1>Settings</h1><p>Manage your account details and password.</p></header><AdminSettings name={admin.name} email={admin.email} /></main>;
}
