"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActivityAction, ApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sendApprovalNotification } from "@/lib/notifications";

async function requireAdmin() { const session = await auth(); if (session?.user.role !== "admin" || !session.user.id || !session.user.email) throw new Error("Unauthorized"); return { id: session.user.id, email: session.user.email }; }
const actionForStatus: Partial<Record<ApprovalStatus, ActivityAction>> = { APPROVED: "APPROVE", DECLINED: "DECLINE", SUSPENDED: "SUSPEND" };
function refreshStudents() { revalidatePath("/admin"); revalidatePath("/admin/students"); revalidatePath("/admin/activity"); }
async function logAction(admin: { id: string; email: string }, action: ActivityAction, student: { id: string; name: string; email: string }) { await prisma.activityLog.create({ data: { adminId: admin.id, adminEmail: admin.email, action, studentId: student.id, studentName: student.name, studentEmail: student.email } }); }
function refreshCourses() { revalidatePath("/admin"); revalidatePath("/admin/courses"); revalidatePath("/admin/students"); revalidatePath("/admin/activity"); revalidatePath("/register"); revalidatePath("/course"); }
async function logCourseAction(admin: { id: string; email: string }, action: ActivityAction, course: { id: string; name: string; slug: string }) { await prisma.activityLog.create({ data: { adminId: admin.id, adminEmail: admin.email, action, studentId: course.id, studentName: course.name, studentEmail: course.slug } }); }
function courseValues(formData: FormData) { const name = String(formData.get("name") || "").trim(); const suppliedSlug = String(formData.get("slug") || "").trim().toLowerCase(); const slug = suppliedSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); return { name, slug, hasBook: formData.get("hasBook") === "on", hasMockTest: formData.get("hasMockTest") === "on", hasVideos: formData.get("hasVideos") === "on", hasNotes: formData.get("hasNotes") === "on", hasNotices: formData.get("hasNotices") === "on" }; }

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

export async function createAdmin(formData: FormData) { await requireAdmin(); const email = String(formData.get("email") || "").trim().toLowerCase(); const password = String(formData.get("password") || ""); if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) redirect("/admin/admins?error=invalid"); if (await prisma.admin.findUnique({ where: { email } })) redirect("/admin/admins?error=duplicate"); await prisma.admin.create({ data: { email, passwordHash: await bcrypt.hash(password, 12) } }); revalidatePath("/admin/admins"); redirect("/admin/admins?created=1"); }

export async function createManagedCourse(formData: FormData) { const admin = await requireAdmin(); const values = courseValues(formData); if (!values.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) redirect("/admin/courses?error=invalid"); if (await prisma.course.findUnique({ where: { slug: values.slug } })) redirect("/admin/courses?error=duplicate"); const course = await prisma.course.create({ data: values }); await logCourseAction(admin, "COURSE_CREATE", course); refreshCourses(); redirect("/admin/courses?created=1"); }

export async function updateManagedCourse(id: string, formData: FormData) { const admin = await requireAdmin(); const values = courseValues(formData); if (!values.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) redirect("/admin/courses?error=invalid"); const duplicate = await prisma.course.findFirst({ where: { slug: values.slug, NOT: { id } }, select: { id: true } }); if (duplicate) redirect("/admin/courses?error=duplicate"); const course = await prisma.course.update({ where: { id }, data: values }); await logCourseAction(admin, "COURSE_UPDATE", course); refreshCourses(); redirect("/admin/courses?updated=1"); }

export async function deleteManagedCourse(id: string) { const admin = await requireAdmin(); const course = await prisma.course.findUnique({ where: { id }, include: { _count: { select: { students: true } } } }); if (!course) redirect("/admin/courses?error=missing"); if (course._count.students > 0) redirect("/admin/courses?error=enrolled"); await prisma.course.delete({ where: { id } }); await logCourseAction(admin, "COURSE_DELETE", course); refreshCourses(); redirect("/admin/courses?deleted=1"); }
