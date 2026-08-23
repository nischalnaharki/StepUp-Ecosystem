"use server";
import { auth } from "@/auth"; import { prisma } from "@/lib/prisma"; import { revalidatePath } from "next/cache"; import { ApprovalStatus } from "@prisma/client";
export async function setApproval(id:string,status:ApprovalStatus){const session=await auth();if(session?.user.role!=="admin")throw new Error("Unauthorized");await prisma.student.update({where:{id},data:{approvalStatus:status}});revalidatePath("/admin");}
