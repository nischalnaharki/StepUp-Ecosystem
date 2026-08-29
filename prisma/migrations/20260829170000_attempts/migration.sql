CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

CREATE TABLE "Attempt" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "mockTestId" TEXT NOT NULL,
  "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "answers" JSONB NOT NULL DEFAULT '{}',
  "flaggedQuestionIds" JSONB NOT NULL DEFAULT '[]',
  "questionOrder" JSONB NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "timeRemainingSeconds" INTEGER,
  CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Attempt_studentId_mockTestId_status_idx" ON "Attempt"("studentId", "mockTestId", "status");
CREATE INDEX "Attempt_mockTestId_idx" ON "Attempt"("mockTestId");
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
