import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const shuffle = <T,>(items: T[]) => { const copy = [...items]; for (let index = copy.length - 1; index > 0; index -= 1) { const swap = Math.floor(Math.random() * (index + 1)); [copy[index], copy[swap]] = [copy[swap], copy[index]]; } return copy; };

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (session?.user.role !== "student" || !session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id: session.user.id }, select: { courseId: true, approvalStatus: true } });
  const test = await prisma.mockTest.findFirst({ where: { id, courseId: student?.courseId, isPublished: true }, include: { sections: { include: { questions: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } } });
  if (!student || student.approvalStatus !== "APPROVED" || !test) return NextResponse.json({ error: "Test unavailable" }, { status: 404 });
  const existing = await prisma.attempt.findFirst({ where: { studentId: student ? session.user.id : "", mockTestId: id, status: "IN_PROGRESS" }, orderBy: { startedAt: "desc" } });
  if (existing) return NextResponse.json({ attemptId: existing.id, resumed: true });
  const items = test.sections.flatMap((section) => shuffle(section.questions).map((question) => ({ questionId: question.id, sectionId: section.id, optionOrder: shuffle([0, 1, 2, 3]) })));
  const attempt = await prisma.attempt.create({ data: { studentId: session.user.id, mockTestId: test.id, questionOrder: { items }, timeRemainingSeconds: test.timeLimitMinutes ? test.timeLimitMinutes * 60 : null } });
  return NextResponse.json({ attemptId: attempt.id });
}
