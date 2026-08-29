"use client";

import { createManagedCourse, deleteManagedCourse, updateManagedCourse } from "@/app/admin/actions";

type CourseRow = {
  id: string;
  name: string;
  slug: string;
  hasBook: boolean;
  hasMockTest: boolean;
  studentCount: number;
  hasBookContent: boolean;
};

export function CourseManager({ courses }: { courses: CourseRow[] }) {
  return (
    <>
      <section className="card admin-card">
        <h2>New course</h2>
        <form action={createManagedCourse} className="form compact course-form">
          <input name="name" placeholder="Course name" required />
          <input name="slug" placeholder="Slug (auto-generated if blank)" />
          <ModuleFields />
          <button>Create course</button>
        </form>
      </section>

      <div className="table course-table">
        {courses.map((course) => (
          <article key={course.id}>
            <div className="course-details">
              <h2>{course.name}</h2>
              <p><code>/{course.slug}</code> · {course.studentCount} enrolled</p>
              <p className="fine">Enabled: {course.hasBook ? "Book" : "—"}{course.hasBook && course.hasMockTest ? " · " : ""}{course.hasMockTest ? "Mock Test" : ""}</p>
            </div>
            <form
              action={updateManagedCourse.bind(null, course.id)}
              className="form compact course-form"
              onSubmit={(event) => {
                const form = new FormData(event.currentTarget);
                const disablingExistingBook = course.hasBook && course.hasBookContent && form.get("hasBook") !== "on";
                if (disablingExistingBook && !window.confirm("This course has an existing book. Disabling Book will hide it from students but will not delete it. Continue?")) event.preventDefault();
              }}
            >
              <input name="name" defaultValue={course.name} required aria-label={`${course.name} name`} />
              <input name="slug" defaultValue={course.slug} required aria-label={`${course.name} slug`} />
              <ModuleFields course={course} />
              <button>Save changes</button>
            </form>
            <form action={deleteManagedCourse.bind(null, course.id)} onSubmit={(event) => { if (!window.confirm(`Delete ${course.name}? This cannot be undone.`)) event.preventDefault(); }}>
              <button className="delete" disabled={course.studentCount > 0} title={course.studentCount > 0 ? "Move enrolled students before deleting this course." : undefined}>Delete course</button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}

function ModuleFields({ course }: { course?: Pick<CourseRow, "hasBook" | "hasMockTest"> }) {
  return <fieldset className="module-fields"><legend>Modules</legend><label><input name="hasBook" type="checkbox" defaultChecked={course?.hasBook} /> Book</label><label><input name="hasMockTest" type="checkbox" defaultChecked={course?.hasMockTest} /> Mock Test</label></fieldset>;
}
