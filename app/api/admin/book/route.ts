import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { BookStorageConfigurationError, removeBookPdf, saveBookPdf } from "@/lib/book-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const redirectToBookAdmin = (params: Record<string, string>) => {
    const url = new URL("/admin/book", request.url);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return NextResponse.redirect(url, 303);
  };

  if ((await auth())?.user.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  try {
    const data = await request.formData();
    const file = data.get("book");
    const courseId = String(data.get("courseId") || "");

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, hasBook: true, bookAsset: { select: { storageFilename: true } } },
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

    const storageFilename = await saveBookPdf(course.id, file);

    await prisma.bookAsset.upsert({
      where: { courseId: course.id },
      update: { filename: file.name, storageFilename, uploadedAt: new Date() },
      create: { courseId: course.id, filename: file.name, storageFilename },
    });
    removeBookPdf(course.bookAsset?.storageFilename).catch(console.error);

    revalidatePath("/admin/book");
    revalidatePath("/course", "layout");

    return redirectToBookAdmin({ uploaded: "1" });
  } catch (error) {
    console.error("Book upload failed", error);
    const message = error instanceof BookStorageConfigurationError
      ? "Book uploads need a Vercel Blob store. Add BLOB_READ_WRITE_TOKEN to this deployment."
      : "Unable to upload the PDF. Please try again.";
    return redirectToBookAdmin({ error: message });
  }
}
