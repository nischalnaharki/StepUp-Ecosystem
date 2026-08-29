import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (session?.user.role !== "student") {
    return new Response("Unauthorized", { status: 403 });
  }

  const student = await prisma.student.findUnique({
    where: { id: session.user.id },
    include: { course: true },
  });

  if (student?.approvalStatus !== "APPROVED" || !student.course.hasBook) {
    return new Response("Access denied", { status: 403 });
  }

  const bookAsset = await prisma.bookAsset.findUnique({
    where: { id: "after-see-book" },
  });

  if (!bookAsset) {
    return new Response("Book not uploaded yet", { status: 404 });
  }

  try {
    const pdf = await readFile(path.join(process.cwd(), "storage", "after-see-book.pdf"));

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Book file unavailable", { status: 404 });
  }
}
