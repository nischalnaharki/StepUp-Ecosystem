import { prisma } from "../lib/prisma";

async function main() {
  const [students, assigned, courses] = await Promise.all([
    prisma.student.count(),
    prisma.student.count(),
    prisma.course.findMany({
      select: {
        name: true,
        slug: true,
        hasBook: true,
        hasMockTest: true,
        _count: { select: { students: true } },
      },
      orderBy: { slug: "asc" },
    }),
  ]);

  console.log(JSON.stringify({
    students,
    assigned,
    courseStudentTotal: courses.reduce((total, course) => total + course._count.students, 0),
    courses,
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
