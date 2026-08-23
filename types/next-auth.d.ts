import "next-auth";
declare module "next-auth" { interface Session { user: { id: string; role: "student" | "admin"; status?: string; course?: string; name?: string | null; email?: string | null } } interface User { role?: "student" | "admin"; status?: string; course?: string } }
declare module "next-auth/jwt" { interface JWT { role?: "student" | "admin"; status?: string; course?: string } }
