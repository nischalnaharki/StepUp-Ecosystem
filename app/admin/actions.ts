"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActivityAction, ApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sendApprovalNotification } from "@/lib/notifications";

export type AdminProfileResult = { error?: string; success?: string };

async function requireAdmin() { const session = await auth(); if (session?.user.role !== "admin" || !session.user.id || !session.user.email) throw new Error("Unauthorized"); return { id: session.user.id, email: session.user.email }; }
const actionForStatus: Partial<Record<ApprovalStatus, ActivityAction>> = { APPROVED: "APPROVE", DECLINED: "DECLINE", SUSPENDED: "SUSPEND" };
function refreshStudents() { revalidatePath("/admin"); revalidatePath("/admin/students"); revalidatePath("/admin/activity"); revalidatePath("/course", "layout"); }
async function logAction(admin: { id: string; email: string }, action: ActivityAction, student: { id: string; name: string; email: string }) { await prisma.activityLog.create({ data: { adminId: admin.id, adminEmail: admin.email, action, studentId: student.id, studentName: student.name, studentEmail: student.email } }); }
function refreshCourses() { revalidatePath("/admin"); revalidatePath("/admin/courses"); revalidatePath("/admin/students"); revalidatePath("/admin/activity"); revalidatePath("/register"); revalidatePath("/course", "layout"); }
async function logCourseAction(admin: { id: string; email: string }, action: ActivityAction, course: { id: string; name: string; slug: string }) { await prisma.activityLog.create({ data: { adminId: admin.id, adminEmail: admin.email, action, studentId: course.id, studentName: course.name, studentEmail: course.slug } }); }
function courseValues(formData: FormData) { const name = String(formData.get("name") || "").trim(); const suppliedSlug = String(formData.get("slug") || "").trim().toLowerCase(); const slug = suppliedSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); return { name, slug, hasBook: formData.get("hasBook") === "on", hasMockTest: formData.get("hasMockTest") === "on", hasVideos: formData.get("hasVideos") === "on", hasNotes: formData.get("hasNotes") === "on", hasNotices: formData.get("hasNotices") === "on", hasLiveClasses: formData.get("hasLiveClasses") === "on" }; }

export async function updateAdminProfile(_: AdminProfileResult, formData: FormData): Promise<AdminProfileResult> {
  const session = await auth();
  if (session?.user.role !== "admin" || !session.user.id) return { error: "You need to sign in again." };
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  if (!name || name.length > 100) return { error: "Enter a name of up to 100 characters." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (newPassword && newPassword.length < 8) return { error: "Your new password must be at least 8 characters." };
  const admin = await prisma.admin.findUnique({ where: { id: session.user.id } });
  if (!admin) return { error: "Account not found." };
  if (newPassword && !(await bcrypt.compare(currentPassword, admin.passwordHash))) return { error: "Your current password is incorrect." };
  const duplicate = await prisma.admin.findFirst({ where: { email, NOT: { id: admin.id } }, select: { id: true } });
  if (duplicate) return { error: "That email address is already in use." };
  await prisma.admin.update({ where: { id: admin.id }, data: { name, email, ...(newPassword ? { passwordHash: await bcrypt.hash(newPassword, 12) } : {}) } });
  revalidatePath("/admin/settings");
  return { success: "Settings saved." };
}

export async function setApproval(id: string, status: ApprovalStatus) {
  const admin = await requireAdmin(); const before = await prisma.student.findUnique({ where: { id } }); if (!before) throw new Error("Student not found"); const student = await prisma.student.update({ where: { id }, data: { approvalStatus: status } });
  await logAction(admin, status === "APPROVED" && before.approvalStatus === "SUSPENDED" ? "REINSTATE" : actionForStatus[status] || "APPROVE", student);
  if (status === "APPROVED" || status === "DECLINED") await sendApprovalNotification(student, status);
  refreshStudents();
}

export async function bulkSetApproval(ids: string[], status: "APPROVED" | "DECLINED") {
  const admin = await requireAdmin(); const uniqueIds = [...new Set(ids)].filter(Boolean); if (!uniqueIds.length) return;
  const students = await prisma.student.findMany({ where: { id: { in: uniqueIds } } });
  await prisma.$transaction([prisma.student.updateMany({ where: { id: { in: students.map((student) => student.id) } }, data: { approvalStatus: status } }), prisma.activityLog.createMany({ data: students.map((student) => ({ adminId: admin.id, adminEmail: admin.email, action: status === "APPROVED" ? "APPROVE" : "DECLINE", studentId: student.id, studentName: student.name, studentEmail: student.email })) })]);
  await Promise.all(students.map((student) => sendApprovalNotification(student, status))); refreshStudents();
}

export async function updateCourse(id: string, formData: FormData) { const admin = await requireAdmin(); const courseId = String(formData.get("courseId") || ""); if (!courseId || !(await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }))) throw new Error("Invalid course"); const student = await prisma.student.update({ where: { id }, data: { courseId } }); await logAction(admin, "COURSE_CHANGE", student); refreshStudents(); }

export async function deleteStudent(id: string) { const admin = await requireAdmin(); const student = await prisma.student.delete({ where: { id } }); await logAction(admin, "DELETE", student); refreshStudents(); }

export async function createAdmin(formData: FormData) { await requireAdmin(); const name = String(formData.get("name") || "").trim() || "StepUp Admin"; const email = String(formData.get("email") || "").trim().toLowerCase(); const password = String(formData.get("password") || ""); const luckyNumber = String(formData.get("luckyNumber") || "").trim(); const dobBs = String(formData.get("dobBs") || "").trim(); const favoriteColor = String(formData.get("favoriteColor") || "").trim(); const currentCollege = String(formData.get("currentCollege") || "").trim(); if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !luckyNumber || !dobBs || !favoriteColor || !currentCollege) redirect("/admin/admins?error=invalid"); if (await prisma.admin.findUnique({ where: { email } })) redirect("/admin/admins?error=duplicate"); const [passwordHash, luckyNumberHash, dobBsHash, favoriteColorHash, currentCollegeHash] = await Promise.all([bcrypt.hash(password, 12), bcrypt.hash(luckyNumber.toLowerCase(), 12), bcrypt.hash(dobBs.toLowerCase(), 12), bcrypt.hash(favoriteColor.toLowerCase(), 12), bcrypt.hash(currentCollege.toLowerCase(), 12)]); await prisma.admin.create({ data: { name, email, passwordHash, luckyNumberHash, dobBsHash, favoriteColorHash, currentCollegeHash } }); revalidatePath("/admin/admins"); redirect("/admin/admins?created=1"); }

export async function createManagedCourse(formData: FormData) { const admin = await requireAdmin(); const values = courseValues(formData); if (!values.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) redirect("/admin/courses?error=invalid"); if (await prisma.course.findUnique({ where: { slug: values.slug } })) redirect("/admin/courses?error=duplicate"); const course = await prisma.course.create({ data: values }); await logCourseAction(admin, "COURSE_CREATE", course); refreshCourses(); redirect("/admin/courses?created=1"); }

export async function updateManagedCourse(id: string, formData: FormData) { const admin = await requireAdmin(); const values = courseValues(formData); if (!values.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) redirect("/admin/courses?error=invalid"); const duplicate = await prisma.course.findFirst({ where: { slug: values.slug, NOT: { id } }, select: { id: true } }); if (duplicate) redirect("/admin/courses?error=duplicate"); const course = await prisma.course.update({ where: { id }, data: values }); await logCourseAction(admin, "COURSE_UPDATE", course); refreshCourses(); redirect("/admin/courses?updated=1"); }

export async function deleteManagedCourse(id: string) { const admin = await requireAdmin(); const course = await prisma.course.findUnique({ where: { id }, include: { _count: { select: { students: true } } } }); if (!course) redirect("/admin/courses?error=missing"); if (course._count.students > 0) redirect("/admin/courses?error=enrolled"); await prisma.course.delete({ where: { id } }); await logCourseAction(admin, "COURSE_DELETE", course); refreshCourses(); redirect("/admin/courses?deleted=1"); }
