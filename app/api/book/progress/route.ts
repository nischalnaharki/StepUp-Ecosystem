import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function currentBook() {
  const session = await auth();
  if (session?.user.role !== "student" || !session.user.id) return null;
  const student = await prisma.student.findUnique({ where: { id: session.user.id }, include: { course: { include: { bookAsset: true } } } });
  if (!student || student.approvalStatus !== "APPROVED" || !student.course.hasBook || !student.course.bookAsset) return null;
  return { studentId: student.id, bookAssetId: student.course.bookAsset.id };
}

export async function GET() {
  const book = await currentBook();
  if (!book) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const progress = await prisma.bookProgress.findUnique({ where: { studentId_bookAssetId: book }, select: { page: true } });
  return NextResponse.json({ page: progress?.page ?? 1 });
}

export async function PUT(request: Request) {
  const book = await currentBook();
  if (!book) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const page = typeof body?.page === "number" ? Math.floor(body.page) : 0;
  if (page < 1 || page > 10000) return NextResponse.json({ error: "Enter a valid page number." }, { status: 400 });
  await prisma.bookProgress.upsert({ where: { studentId_bookAssetId: book }, update: { page }, create: { ...book, page } });
  return new NextResponse(null, { status: 204 });
}
