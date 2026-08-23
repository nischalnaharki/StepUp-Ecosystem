import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const [email,password]=process.argv.slice(2);
if(!email||!password||password.length<8){console.error("Usage: npm run admin:create -- admin@example.com secure-password");process.exit(1)}
const prisma=new PrismaClient();
prisma.admin.upsert({where:{email:email.toLowerCase()},update:{passwordHash:await bcrypt.hash(password,12)},create:{email:email.toLowerCase(),passwordHash:await bcrypt.hash(password,12)}}).then(()=>console.log("Admin account ready.")).finally(()=>prisma.$disconnect());
