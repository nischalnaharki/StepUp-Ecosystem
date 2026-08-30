CREATE TABLE "BookProgress" (
  "studentId" TEXT NOT NULL,
  "bookAssetId" TEXT NOT NULL,
  "page" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BookProgress_pkey" PRIMARY KEY ("studentId", "bookAssetId")
);

CREATE INDEX "BookProgress_bookAssetId_idx" ON "BookProgress"("bookAssetId");

ALTER TABLE "BookProgress" ADD CONSTRAINT "BookProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookProgress" ADD CONSTRAINT "BookProgress_bookAssetId_fkey" FOREIGN KEY ("bookAssetId") REFERENCES "BookAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
