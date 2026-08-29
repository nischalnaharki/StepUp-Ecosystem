import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (session?.user.role !== "student" || !session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params; const body = await request.json();
  const attempt = await prisma.attempt.findFirst({ where: { id, studentId: session.user.id, status: "IN_PROGRESS" } });
  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  const allowedQuestionIds = new Set(((attempt.questionOrder as { items?: { questionId: string }[] }).items || []).map((item) => item.questionId));
  const suppliedAnswers = body.answers && typeof body.answers === "object" && !Array.isArray(body.answers) ? body.answers as Record<string, unknown> : null;
  const answers = suppliedAnswers && Object.entries(suppliedAnswers).every(([questionId, optionIndex]) => allowedQuestionIds.has(questionId) && Number.isInteger(optionIndex) && Number(optionIndex) >= 0 && Number(optionIndex) <= 3) ? suppliedAnswers : attempt.answers;
  const flaggedQuestionIds = Array.isArray(body.flaggedQuestionIds) && body.flaggedQuestionIds.every((value: unknown) => typeof value === "string" && allowedQuestionIds.has(value)) ? body.flaggedQuestionIds : attempt.flaggedQuestionIds;
  const timeRemainingSeconds = body.timeRemainingSeconds === null || (Number.isInteger(body.timeRemainingSeconds) && body.timeRemainingSeconds >= 0) ? body.timeRemainingSeconds : attempt.timeRemainingSeconds;
  const complete = body.complete === true;
  await prisma.attempt.update({ where: { id }, data: { answers: answers as Prisma.InputJsonValue, flaggedQuestionIds: flaggedQuestionIds as Prisma.InputJsonValue, timeRemainingSeconds, ...(complete ? { status: "COMPLETED", completedAt: new Date() } : {}) } });
  return NextResponse.json({ ok: true });
}
