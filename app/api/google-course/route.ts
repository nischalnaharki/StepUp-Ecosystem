import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { courseId } = await request.json();

  if (typeof courseId !== "string" || !/^c[a-z0-9]{24}$/.test(courseId)) {
    return NextResponse.json({ error: "Choose a course first." }, { status: 400 });
  }

  const selectedCourse = await prisma.course.findUnique({ where: { id: courseId } });
  if (!selectedCourse) return NextResponse.json({ error: "Choose a course first." }, { status: 400 });

  const response = NextResponse.json({ ok: true });

  response.cookies.set("stepup-google-course", selectedCourse.slug, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
