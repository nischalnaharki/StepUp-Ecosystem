import { prisma } from "@/lib/prisma";

type ScorableTest = { negativeMarkingPercent: number | null; sections: { pointsPerQuestion: number; questions: { id: string; correctOptionIndex: number }[] }[] };
export function calculateScore(test: ScorableTest, answers: Record<string, number>) {
  let score = 0; let maxPossibleScore = 0;
  for (const section of test.sections) for (const question of section.questions) { maxPossibleScore += section.pointsPerQuestion; const answer = answers[question.id]; if (answer === undefined) continue; if (answer === question.correctOptionIndex) score += section.pointsPerQuestion; else if ((test.negativeMarkingPercent || 0) > 0) score -= section.pointsPerQuestion * (test.negativeMarkingPercent! / 100); }
  return { score, maxPossibleScore };
}
export async function scoreAttempt(attemptId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { mockTest: { include: { sections: { include: { questions: true } } } } },
  });
  if (!attempt) throw new Error("Attempt not found");
  const values = calculateScore(attempt.mockTest, attempt.answers as Record<string, number>);
  return prisma.attempt.update({ where: { id: attempt.id }, data: values });
}
export async function rescoreMockTest(mockTestId: string) {
  const attempts = await prisma.attempt.findMany({ where: { mockTestId, status: "COMPLETED" }, select: { id: true } });
  await Promise.all(attempts.map((attempt) => scoreAttempt(attempt.id)));
}
