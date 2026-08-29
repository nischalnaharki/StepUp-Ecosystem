import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({ allowDangerousEmailAccountLinking: false }),
    Credentials({ id: "student-credentials", name: "Student login", credentials: { email: {}, password: {} }, async authorize(c) {
      const student = await prisma.student.findUnique({ where: { email: String(c?.email).toLowerCase() } });
      if (!student?.passwordHash || !(await bcrypt.compare(String(c?.password), student.passwordHash))) return null;
      return { id: student.id, name: student.name, email: student.email, role: "student", status: student.approvalStatus, course: student.courseId };
    }}),
    Credentials({ id: "admin-credentials", name: "Admin login", credentials: { email: {}, password: {} }, async authorize(c) {
      const admin = await prisma.admin.findUnique({ where: { email: String(c?.email).toLowerCase() } });
      if (!admin || !(await bcrypt.compare(String(c?.password), admin.passwordHash))) return null;
      return { id: admin.id, email: admin.email, name: "StepUp Admin", role: "admin" };
    }})
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      const email = user.email?.toLowerCase(); if (!email) return false;
      let existing = await prisma.student.findUnique({ where: { email } });
      if (!existing) {
        const courseSlug = (await cookies()).get("stepup-google-course")?.value;
        if (!courseSlug) return "/register?error=google-course";
        const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
        if (!course) return "/register?error=google-course";
        existing = await prisma.student.create({ data: { name: user.name || "StepUp Student", email, googleId: account.providerAccountId, courseId: course.id } });
      }
      user.id = existing.id; user.role = "student"; user.status = existing.approvalStatus; user.course = existing.courseId;
      return true;
    },
    async jwt({ token, user }) { if (user) { token.sub = user.id; token.role = user.role; token.status = user.status; token.course = user.course; } return token; },
    async session({ session, token }) { session.user.id = token.sub!; session.user.role = token.role as "student" | "admin"; session.user.status = token.status as string | undefined; session.user.course = token.course as string | undefined; return session; }
  },
  pages: { signIn: "/login" }
});
