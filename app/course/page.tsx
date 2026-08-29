import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CourseTabs } from "@/components/course-tabs";

export const dynamic = "force-dynamic";

export default async function Course() {
  const session = await auth(); if (!session) redirect("/login"); if (session.user.role !== "student") redirect("/admin");
  const student = await prisma.student.findUnique({ where: { id: session.user.id }, include: { course: true } }); if (!student) redirect("/login");
  if (student.approvalStatus === "PENDING") return <Gate title="Registration pending" text="Your registration is awaiting admin approval. Please check back soon." />;
  if (student.approvalStatus === "DECLINED") return <Gate title="Registration declined" text="Your registration was not approved. Contact StepUp Academy if you believe this is a mistake." />;
  if (student.approvalStatus === "SUSPENDED") return <Gate title="Access suspended" text="Your access has been suspended. Contact StepUp Academy support for help." />;
  const course = student.course;
  if (!course.hasBook && !course.hasMockTest && !course.hasVideos && !course.hasNotes && !course.hasLiveClasses && !course.hasNotices) return <main className="course"><p className="eyebrow">STEPUP ACADEMY</p><h1>{course.name}</h1><section className="empty"><h2>Coming soon</h2><p>We&apos;re preparing this course for you. Stay tuned!</p></section></main>;
  const [mockTests, videoTopics, notes, liveClasses, notices] = await Promise.all([
    course.hasMockTest ? prisma.mockTest.findMany({ where: { courseId: student.courseId, isPublished: true }, include: { sections: { include: { _count: { select: { questions: true } } } }, attempts: { where: { studentId: student.id }, orderBy: { startedAt: "desc" }, select: { status: true } } }, orderBy: { createdAt: "desc" } }) : [],
    course.hasVideos ? prisma.videoTopic.findMany({ where: { courseId: student.courseId }, include: { videos: { orderBy: { order: "asc" }, include: { progress: { where: { studentId: student.id }, select: { studentId: true } } } } }, orderBy: { order: "asc" } }) : [],
    course.hasNotes ? prisma.noteLink.findMany({ where: { courseId: student.courseId }, include: { progress: { where: { studentId: student.id }, select: { studentId: true } } }, orderBy: { order: "asc" } }) : [],
    course.hasLiveClasses ? prisma.liveClass.findMany({ where: { courseId: student.courseId }, include: { attendance: { where: { studentId: student.id }, select: { studentId: true } } }, orderBy: { createdAt: "desc" } }) : [],
    course.hasNotices ? prisma.notice.findMany({ where: { courseId: student.courseId }, orderBy: { createdAt: "desc" } }) : [],
  ]);
  const availableTests = mockTests.map(test => ({ id: test.id, name: test.name, questionCount: test.sections.reduce((total, section) => total + section._count.questions, 0), timeLimitMinutes: test.timeLimitMinutes, status: test.attempts.find(attempt => attempt.status === "IN_PROGRESS") ? "IN_PROGRESS" as const : test.attempts.length ? "COMPLETED" as const : "NOT_STARTED" as const }));
  return <main className="course"><p className="eyebrow">STEPUP ACADEMY · {course.name.toUpperCase()}</p><h1>Welcome, {student.name.split(" ")[0]}!</h1><p className="lead">Choose a module to continue learning.</p><CourseTabs hasBook={course.hasBook} hasMockTest={course.hasMockTest} hasVideos={course.hasVideos} hasNotes={course.hasNotes} hasLiveClasses={course.hasLiveClasses} hasNotices={course.hasNotices} mockTests={availableTests} videoTopics={videoTopics.map((topic) => ({ ...topic, videos: topic.videos.map((video) => ({ id: video.id, title: video.title, url: video.url, seen: video.progress.length > 0 })) }))} notes={notes.map((note) => ({ id: note.id, title: note.title, url: note.url, seen: note.progress.length > 0 }))} liveClasses={liveClasses.map((liveClass) => ({ id: liveClass.id, title: liveClass.title, url: liveClass.url, body: liveClass.body, createdAt: liveClass.createdAt, attended: liveClass.attendance.length > 0 }))} notices={notices} /></main>;
}

function Gate({ title, text }: { title: string; text: string }) { return <main className="auth-page"><section className="card centered"><h1>{title}</h1><p>{text}</p><Link className="button" href="/">Back home</Link></section></main>; }
