import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if ((await auth())?.user.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const data = await request.formData();
  const file = data.get("book");
  const courseId = String(data.get("courseId") || "");
  const redirectToBookAdmin = (params: Record<string, string>) => {
    const url = new URL("/admin/book", request.url);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return NextResponse.redirect(url);
  };

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, hasBook: true },
  });

  if (!course || !course.hasBook) {
    return redirectToBookAdmin({ error: "Select a course with the Book module enabled." });
  }

  if (
    !(file instanceof File) ||
    !file.name.toLowerCase().endsWith(".pdf") ||
    file.type !== "application/pdf"
  ) {
    return redirectToBookAdmin({ error: "Only PDF files are allowed." });
  }

  if (file.size > 50 * 1024 * 1024) {
    return redirectToBookAdmin({ error: "The PDF must be 50MB or smaller." });
  }

  const folder = path.join(process.cwd(), "storage");
  await mkdir(folder, { recursive: true });
  const storageFilename = `course-book-${course.id}.pdf`;
  await writeFile(path.join(folder, storageFilename), Buffer.from(await file.arrayBuffer()));

  await prisma.bookAsset.upsert({
    where: { courseId: course.id },
    update: { filename: file.name, storageFilename, uploadedAt: new Date() },
    create: { courseId: course.id, filename: file.name, storageFilename },
  });

  revalidatePath("/admin/book");
  revalidatePath("/course", "layout");

  return redirectToBookAdmin({ uploaded: "1" });
}
