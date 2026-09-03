import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

function normalizedAnswer(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

async function hasValidAdminVerification(
  admin: { luckyNumberHash: string | null; dobBsHash: string | null; favoriteColorHash: string | null; currentCollegeHash: string | null },
  credentials: Record<string, unknown> | undefined,
) {
  const answers = {
    luckyNumber: normalizedAnswer(credentials?.luckyNumber),
    dobBs: normalizedAnswer(credentials?.dobBs),
    favoriteColor: normalizedAnswer(credentials?.favoriteColor),
    currentCollege: normalizedAnswer(credentials?.currentCollege),
  };
  const hashes = [admin.luckyNumberHash, admin.dobBsHash, admin.favoriteColorHash, admin.currentCollegeHash];

  if (hashes.every(Boolean)) {
    return (await Promise.all([
      bcrypt.compare(answers.luckyNumber, admin.luckyNumberHash!),
      bcrypt.compare(answers.dobBs, admin.dobBsHash!),
      bcrypt.compare(answers.favoriteColor, admin.favoriteColorHash!),
      bcrypt.compare(answers.currentCollege, admin.currentCollegeHash!),
    ])).every(Boolean);
  }

  // Existing accounts can use the temporary environment configuration until
  // their individual verification answers are added through account management.
  const expected = [process.env.ADMIN_LUCKY_NUMBER, process.env.ADMIN_DOB_BS, process.env.ADMIN_FAVORITE_COLOR, process.env.ADMIN_CURRENT_COLLEGE];
  return expected.every((answer, index) => Boolean(answer) && [answers.luckyNumber, answers.dobBs, answers.favoriteColor, answers.currentCollege][index] === normalizedAnswer(answer));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({ allowDangerousEmailAccountLinking: false }),
    Credentials({ id: "student-credentials", name: "Student login", credentials: { email: {}, password: {} }, async authorize(c) {
      const email = String(c?.email ?? "").trim().toLowerCase();
      const password = String(c?.password ?? "");
      const student = await prisma.student.findUnique({ where: { email } });

      // A student may have joined with Google and set a password later.  Login
      // eligibility for this provider is deliberately based only on passwordHash:
      // googleId is an alternate sign-in method, not a credentials restriction.
      if (!student?.passwordHash) return null;
      const passwordMatches = await bcrypt.compare(password, student.passwordHash);
      if (!passwordMatches) return null;

      return { id: student.id, name: student.name, email: student.email, role: "student", status: student.approvalStatus, course: student.courseId };
    }}),
    Credentials({ id: "admin-credentials", name: "Admin login", credentials: { email: {}, password: {}, luckyNumber: {}, dobBs: {}, favoriteColor: {}, currentCollege: {} }, async authorize(c) {
      const admin = await prisma.admin.findUnique({ where: { email: String(c?.email ?? "").trim().toLowerCase() } });
      if (!admin || !(await bcrypt.compare(String(c?.password ?? ""), admin.passwordHash)) || !(await hasValidAdminVerification(admin, c))) return null;
      return { id: admin.id, email: admin.email, name: admin.name, role: "admin" };
    }})
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
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
      }

      // A new student login replaces the only valid session marker for that account.
      // Admin JWTs deliberately have no marker and are never checked here.
      if (user.role === "student") {
        const sessionId = randomUUID();
        await prisma.student.update({ where: { id: user.id! }, data: { activeSessionId: sessionId } });
        user.sessionId = sessionId;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) { token.sub = user.id; token.role = user.role; token.status = user.status; token.course = user.course; token.sessionId = user.sessionId; }
      if (token.role === "student") {
        const student = await prisma.student.findUnique({ where: { id: token.sub! }, select: { activeSessionId: true } });
        if (!student || !token.sessionId || student.activeSessionId !== token.sessionId) return null;
      }
      return token;
    },
    async session({ session, token }) { session.user.id = token.sub!; session.user.role = token.role as "student" | "admin"; session.user.status = token.status as string | undefined; session.user.course = token.course as string | undefined; return session; }
  },
  pages: { signIn: "/login" }
});
