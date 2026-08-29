-- Preserve every existing enum assignment while converting it to Course rows.
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "hasBook" BOOLEAN NOT NULL DEFAULT false,
    "hasMockTest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

INSERT INTO "courses" ("id", "name", "slug", "hasBook", "hasMockTest") VALUES
    ('caftersee0000000000000000', 'After SEE', 'after-see', true, true),
    ('cclass1100000000000000000', 'Class 11', 'class-11', false, false),
    ('cclass1200000000000000000', 'Class 12', 'class-12', false, false);

ALTER TABLE "Student" ADD COLUMN "courseId" TEXT;

UPDATE "Student" AS student
SET "courseId" = course."id"
FROM "courses" AS course
WHERE course."slug" = CASE student."selectedCourse"::text
    WHEN 'AFTER_SEE' THEN 'after-see'
    WHEN 'CLASS_11' THEN 'class-11'
    WHEN 'CLASS_12' THEN 'class-12'
END;

DO $$
DECLARE
    student_count INTEGER;
    assigned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO student_count FROM "Student";
    SELECT COUNT(*) INTO assigned_count FROM "Student" WHERE "courseId" IS NOT NULL;
    IF student_count <> assigned_count THEN
        RAISE EXCEPTION 'Course migration verification failed: % students, but % course assignments', student_count, assigned_count;
    END IF;
END $$;

ALTER TABLE "Student" ALTER COLUMN "courseId" SET NOT NULL;
ALTER TABLE "Student" ADD CONSTRAINT "Student_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
DROP INDEX IF EXISTS "Student_courseId_idx";
CREATE INDEX "Student_courseId_idx" ON "Student"("courseId");
ALTER TABLE "Student" DROP COLUMN "selectedCourse";
DROP TYPE "Course";
