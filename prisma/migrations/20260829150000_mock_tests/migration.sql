ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'MOCKTEST_CREATE';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'MOCKTEST_UPDATE';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'MOCKTEST_PUBLISH';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'MOCKTEST_DELETE';

CREATE TABLE "MockTest" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "timeLimitMinutes" INTEGER,
  "negativeMarkingPercent" DOUBLE PRECISION,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "leaderboardHidden" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MockTest_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Section" (
  "id" TEXT NOT NULL,
  "mockTestId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "pointsPerQuestion" DOUBLE PRECISION NOT NULL,
  "order" INTEGER NOT NULL,
  CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Question" (
  "id" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "options" TEXT[] NOT NULL,
  "correctOptionIndex" INTEGER NOT NULL,
  "order" INTEGER NOT NULL,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MockTest_courseId_idx" ON "MockTest"("courseId");
CREATE INDEX "Section_mockTestId_idx" ON "Section"("mockTestId");
CREATE INDEX "Question_sectionId_idx" ON "Question"("sectionId");
CREATE UNIQUE INDEX "Section_mockTestId_order_key" ON "Section"("mockTestId", "order");
CREATE UNIQUE INDEX "Question_sectionId_order_key" ON "Question"("sectionId", "order");
ALTER TABLE "MockTest" ADD CONSTRAINT "MockTest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Section" ADD CONSTRAINT "Section_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
