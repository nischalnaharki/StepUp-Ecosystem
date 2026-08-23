import { NextResponse } from "next/server";
import { Course } from "@prisma/client";
export async function POST(request: Request) { const { course } = await request.json(); if (!Object.values(Course).includes(course)) return NextResponse.json({ error: "Choose a course first." }, { status: 400 }); const response = NextResponse.json({ ok: true }); response.cookies.set("stepup-google-course", course, { httpOnly: true, sameSite: "lax", maxAge: 600, path: "/" }); return response; }
