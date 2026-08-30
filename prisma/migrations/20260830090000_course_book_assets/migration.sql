-- Give each course at most one independently managed book asset.
ALTER TABLE "BookAsset" ADD COLUMN "courseId" TEXT;
ALTER TABLE "BookAsset" ADD COLUMN "storageFilename" TEXT;

-- Preserve the existing global After SEE upload as that course's first book.
UPDATE "BookAsset"
SET
  "courseId" = (SELECT "id" FROM "courses" WHERE "slug" = 'after-see'),
  "storageFilename" = 'after-see-book.pdf'
WHERE "id" = 'after-see-book';

ALTER TABLE "BookAsset" ALTER COLUMN "courseId" SET NOT NULL;
ALTER TABLE "BookAsset" ALTER COLUMN "storageFilename" SET NOT NULL;
CREATE UNIQUE INDEX "BookAsset_courseId_key" ON "BookAsset"("courseId");
ALTER TABLE "BookAsset" ADD CONSTRAINT "BookAsset_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
