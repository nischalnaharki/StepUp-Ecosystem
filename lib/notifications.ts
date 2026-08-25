import { Resend } from "resend";

export async function sendApprovalNotification(student: { name: string; email: string }, status: "APPROVED" | "DECLINED") {
  if (!process.env.RESEND_API_KEY) { console.warn("RESEND_API_KEY is not configured; approval email was not sent."); return; }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const approved = status === "APPROVED";
  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({ from: "StepUp Academy <onboarding@resend.dev>", to: student.email, subject: approved ? "Your StepUp Academy access is approved" : "StepUp Academy registration update", text: approved ? `Hi ${student.name}, your StepUp Academy registration has been approved. You can now log in: ${appUrl}/login` : `Hi ${student.name}, your StepUp Academy registration was not approved.` });
  } catch (error) { console.warn("Unable to send student approval email:", error); }
}
