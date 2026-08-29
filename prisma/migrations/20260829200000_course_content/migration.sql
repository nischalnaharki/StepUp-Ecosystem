ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'CONTENT_CREATE';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'CONTENT_UPDATE';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'CONTENT_DELETE';

ALTER TABLE "courses" ADD COLUMN "hasVideos" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "courses" ADD COLUMN "hasNotes" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "courses" ADD COLUMN "hasNotices" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "VideoTopic" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  CONSTRAINT "VideoTopic_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Video" (
  "id" TEXT NOT NULL,
  "videoTopicId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "NoteLink" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NoteLink_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Notice" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "VideoTopic_courseId_idx" ON "VideoTopic"("courseId");
CREATE UNIQUE INDEX "VideoTopic_courseId_order_key" ON "VideoTopic"("courseId", "order");
CREATE INDEX "Video_videoTopicId_idx" ON "Video"("videoTopicId");
CREATE UNIQUE INDEX "Video_videoTopicId_order_key" ON "Video"("videoTopicId", "order");
CREATE INDEX "NoteLink_courseId_idx" ON "NoteLink"("courseId");
CREATE UNIQUE INDEX "NoteLink_courseId_order_key" ON "NoteLink"("courseId", "order");
CREATE INDEX "Notice_courseId_createdAt_idx" ON "Notice"("courseId", "createdAt");
ALTER TABLE "VideoTopic" ADD CONSTRAINT "VideoTopic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Video" ADD CONSTRAINT "Video_videoTopicId_fkey" FOREIGN KEY ("videoTopicId") REFERENCES "VideoTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteLink" ADD CONSTRAINT "NoteLink_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
