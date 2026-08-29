-- Existing Notice rows are deliberately left untouched: there is no reliable
-- way to distinguish prior live-class links from general announcements.
ALTER TABLE "courses" ADD COLUMN "hasLiveClasses" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "LiveClass" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "body" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LiveClass_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VideoProgress" (
  "studentId" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "seenAt" TIMESTAMP(3),
  CONSTRAINT "VideoProgress_pkey" PRIMARY KEY ("studentId", "videoId")
);

CREATE TABLE "NoteProgress" (
  "studentId" TEXT NOT NULL,
  "noteLinkId" TEXT NOT NULL,
  "seenAt" TIMESTAMP(3),
  CONSTRAINT "NoteProgress_pkey" PRIMARY KEY ("studentId", "noteLinkId")
);

CREATE TABLE "LiveClassAttendance" (
  "studentId" TEXT NOT NULL,
  "liveClassId" TEXT NOT NULL,
  "attendedAt" TIMESTAMP(3),
  CONSTRAINT "LiveClassAttendance_pkey" PRIMARY KEY ("studentId", "liveClassId")
);

CREATE INDEX "LiveClass_courseId_createdAt_idx" ON "LiveClass"("courseId", "createdAt");
CREATE INDEX "VideoProgress_videoId_idx" ON "VideoProgress"("videoId");
CREATE INDEX "NoteProgress_noteLinkId_idx" ON "NoteProgress"("noteLinkId");
CREATE INDEX "LiveClassAttendance_liveClassId_idx" ON "LiveClassAttendance"("liveClassId");

ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VideoProgress" ADD CONSTRAINT "VideoProgress_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteProgress" ADD CONSTRAINT "NoteProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteProgress" ADD CONSTRAINT "NoteProgress_noteLinkId_fkey" FOREIGN KEY ("noteLinkId") REFERENCES "NoteLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveClassAttendance" ADD CONSTRAINT "LiveClassAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveClassAttendance" ADD CONSTRAINT "LiveClassAttendance_liveClassId_fkey" FOREIGN KEY ("liveClassId") REFERENCES "LiveClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
