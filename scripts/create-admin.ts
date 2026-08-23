import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password || password.length < 8) {
    console.error("Usage: npm run admin:create -- admin@example.com secure-password");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash },
    create: { email: email.toLowerCase(), passwordHash },
  });

  console.log("Admin account ready.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});