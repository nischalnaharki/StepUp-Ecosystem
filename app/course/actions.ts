"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function currentStudent() {
  const session = await auth();
  if (session?.user.role !== "student" || !session.user.id) throw new Error("Unauthorized");
  const student = await prisma.student.findUnique({ where: { id: session.user.id }, select: { id: true, courseId: true, approvalStatus: true } });
  if (!student || student.approvalStatus !== "APPROVED") throw new Error("Unauthorized");
  return student;
}

function refreshCourse() { revalidatePath("/course", "layout"); }

export type ProfileResult = { error?: string; success?: string };

export async function updateStudentProfile(_: ProfileResult, formData: FormData): Promise<ProfileResult> {
  const session = await auth();
  if (session?.user.role !== "student" || !session.user.id) return { error: "You need to sign in again." };
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  if (!name || name.length > 100) return { error: "Enter a name of up to 100 characters." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (newPassword && newPassword.length < 8) return { error: "Your new password must be at least 8 characters." };
  const student = await prisma.student.findUnique({ where: { id: session.user.id } });
  if (!student) return { error: "Account not found." };
  if (student.passwordHash && newPassword && !(await bcrypt.compare(currentPassword, student.passwordHash))) return { error: "Your current password is incorrect." };
  const duplicate = await prisma.student.findFirst({ where: { email, NOT: { id: student.id } }, select: { id: true } });
  if (duplicate) return { error: "That email address is already in use." };
  await prisma.student.update({ where: { id: student.id }, data: { name, email, ...(newPassword ? { passwordHash: await bcrypt.hash(newPassword, 12) } : {}) } });
  refreshCourse();
  return { success: "Settings saved." };
}

export async function toggleVideoSeen(videoId: string) {
  const student = await currentStudent();
  const video = await prisma.video.findFirst({ where: { id: videoId, videoTopic: { courseId: student.courseId, course: { hasVideos: true } } }, select: { id: true } });
  if (!video) throw new Error("Video not found");
  const key = { studentId_videoId: { studentId: student.id, videoId } };
  const existing = await prisma.videoProgress.findUnique({ where: key });
  if (existing) await prisma.videoProgress.delete({ where: key }); else await prisma.videoProgress.create({ data: { studentId: student.id, videoId, seenAt: new Date() } });
  refreshCourse();
  return !existing;
}

export async function toggleNoteSeen(noteLinkId: string) {
  const student = await currentStudent();
  const note = await prisma.noteLink.findFirst({ where: { id: noteLinkId, courseId: student.courseId, course: { hasNotes: true } }, select: { id: true } });
  if (!note) throw new Error("Note not found");
  const key = { studentId_noteLinkId: { studentId: student.id, noteLinkId } };
  const existing = await prisma.noteProgress.findUnique({ where: key });
  if (existing) await prisma.noteProgress.delete({ where: key }); else await prisma.noteProgress.create({ data: { studentId: student.id, noteLinkId, seenAt: new Date() } });
  refreshCourse();
  return !existing;
}

export async function toggleLiveClassAttendance(liveClassId: string) {
  const student = await currentStudent();
  const liveClass = await prisma.liveClass.findFirst({ where: { id: liveClassId, courseId: student.courseId, course: { hasLiveClasses: true } }, select: { id: true } });
  if (!liveClass) throw new Error("Live class not found");
  const key = { studentId_liveClassId: { studentId: student.id, liveClassId } };
  const existing = await prisma.liveClassAttendance.findUnique({ where: key });
  if (existing) await prisma.liveClassAttendance.delete({ where: key }); else await prisma.liveClassAttendance.create({ data: { studentId: student.id, liveClassId, attendedAt: new Date() } });
  refreshCourse();
  return !existing;
}
