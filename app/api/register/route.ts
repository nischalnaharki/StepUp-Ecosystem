import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  courseId: z.string().cuid(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password, courseId } = parsed.data;

  try {
    if (!(await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } }))) {
      return NextResponse.json({ error: "Choose a valid course." }, { status: 400 });
    }

    await prisma.student.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(password, 12),
        courseId,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/students");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }
}
