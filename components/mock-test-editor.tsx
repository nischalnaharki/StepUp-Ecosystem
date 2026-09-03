"use client";

import { useState } from "react";

export type TestDraft = {
  courseId: string;
  name: string;
  timeLimitMinutes: number | null;
  negativeMarkingPercent: number | null;
  isPublished: boolean;
  leaderboardHidden: boolean;
  sections: SectionDraft[];
};

type SectionDraft = {
  name: string;
  pointsPerQuestion: number;
  questions: QuestionDraft[];
};

type QuestionDraft = {
  text: string;
  options: string[];
  correctOptionIndex: number;
};

type CourseOption = {
  id: string;
  name: string;
};

const blankQuestion = (): QuestionDraft => ({
  text: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
});

const blankSection = (): SectionDraft => ({
  name: "",
  pointsPerQuestion: 1,
  questions: [],
});

export function MockTestEditor({
  courses,
  initial,
  action,
}: {
  courses: CourseOption[];
  initial?: TestDraft;
  action: (formData: FormData) => void;
}) {
  const [draft, setDraft] = useState<TestDraft>(
    initial ?? {
      courseId: courses[0]?.id || "",
      name: "",
      timeLimitMinutes: null,
      negativeMarkingPercent: null,
      isPublished: false,
      leaderboardHidden: false,
      sections: [blankSection()],
    },
  );

  const [preview, setPreview] = useState(false);
  const [importError, setImportError] = useState("");

  const update = (change: Partial<TestDraft>) =>
    setDraft((current) => ({
      ...current,
      ...change,
    }));

  const updateSection = (
    index: number,
    change: Partial<SectionDraft>,
  ) =>
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, i) =>
        i === index
          ? { ...section, ...change }
          : section,
      ),
    }));

  const updateQuestion = (
    sectionIndex: number,
    questionIndex: number,
    change: Partial<QuestionDraft>,
  ) =>
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              questions: section.questions.map(
                (question, q) =>
                  q === questionIndex
                    ? { ...question, ...change }
                    : question,
              ),
            }
          : section,
      ),
    }));

  const removeSection = (index: number) =>
    setDraft((current) => ({
      ...current,
      sections: current.sections.filter(
        (_, i) => i !== index,
      ),
    }));

  const removeQuestion = (
    sectionIndex: number,
    questionIndex: number,
  ) =>
    updateSection(sectionIndex, {
      questions: draft.sections[
        sectionIndex
      ].questions.filter(
        (_, i) => i !== questionIndex,
      ),
    });

  async function importQuestions(
    sectionIndex: number,
    file?: File,
  ) {
    if (!file) return;

    setImportError("");

    try {
      const questions = parseImport(
        await file.text(),
        file.name,
      );

      updateSection(sectionIndex, {
        questions: [
          ...draft.sections[sectionIndex].questions,
          ...questions,
        ],
      });
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Could not import questions.",
      );
    }
  }

  return (
    <form action={action} className="mock-test-editor">
      <input
        type="hidden"
        name="definition"
        value={JSON.stringify(draft)}
      />

      <section className="card admin-card">
        <h2>Test details</h2>

        <div className="form compact">
          <select
            value={draft.courseId}
            onChange={(event) =>
              update({ courseId: event.target.value })
            }
            required
          >
            <option value="">Choose course</option>

            {courses.map((course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.name}
              </option>
            ))}
          </select>

          <input
            value={draft.name}
            onChange={(event) =>
              update({ name: event.target.value })
            }
            placeholder="Mock Test name"
            required
          />

          <label>
            Time limit in minutes (optional)
            <input
              type="number"
              min="1"
              value={draft.timeLimitMinutes ?? ""}
              onChange={(event) =>
                update({
                  timeLimitMinutes: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </label>

          <label>
            Negative marking % (optional)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={draft.negativeMarkingPercent ?? ""}
              onChange={(event) =>
                update({
                  negativeMarkingPercent: event.target
                    .value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={draft.isPublished}
              onChange={(event) =>
                update({
                  isPublished: event.target.checked,
                })
              }
            />{" "}
            Publish now
          </label>

          <label>
            <input
              type="checkbox"
              checked={draft.leaderboardHidden}
              onChange={(event) =>
                update({
                  leaderboardHidden:
                    event.target.checked,
                })
              }
            />{" "}
            Hide from leaderboard
          </label>
        </div>
      </section>

      <section className="mock-sections">
        <div className="section-heading">
          <h2>Sections and questions</h2>

          <button
            type="button"
            onClick={() =>
              update({
                sections: [
                  ...draft.sections,
                  blankSection(),
                ],
              })
            }
          >
            Add section
          </button>
        </div>

        {draft.sections.map(
          (section, sectionIndex) => (
            <section
              className="card section-editor"
              key={sectionIndex}
            >
              <div className="section-heading">
                <h3>
                  Section {sectionIndex + 1}
                </h3>

                <button
                  className="delete"
                  type="button"
                  onClick={() =>
                    removeSection(sectionIndex)
                  }
                  disabled={draft.sections.length === 1}
                >
                  Remove section
                </button>
              </div>

              <div className="form compact">
                <input
                  value={section.name}
                  onChange={(event) =>
                    updateSection(sectionIndex, {
                      name: event.target.value,
                    })
                  }
                  placeholder="Section name (e.g. English)"
                  required
                />

                <label>
                  Points per question
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={section.pointsPerQuestion}
                    onChange={(event) =>
                      updateSection(sectionIndex, {
                        pointsPerQuestion: Number(
                          event.target.value,
                        ),
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Import CSV or JSON
                  <input
                    type="file"
                    accept=".csv,.json,text/csv,application/json"
                    onChange={(event) =>
                      importQuestions(
                        sectionIndex,
                        event.target.files?.[0],
                      )
                    }
                  />
                </label>

                <p className="fine">
                  CSV: question, option1, option2,
                  option3, option4, correctOption (1–4).
                  JSON: question, options,
                  correctOptionIndex.
                </p>
              </div>

              {section.questions.map(
                (question, questionIndex) => (
                  <QuestionEditor
                    key={questionIndex}
                    question={question}
                    number={questionIndex + 1}
                    update={(change) =>
                      updateQuestion(
                        sectionIndex,
                        questionIndex,
                        change,
                      )
                    }
                    remove={() =>
                      removeQuestion(
                        sectionIndex,
                        questionIndex,
                      )
                    }
                  />
                ),
              )}

              <button
                type="button"
                onClick={() =>
                  updateSection(sectionIndex, {
                    questions: [
                      ...section.questions,
                      blankQuestion(),
                    ],
                  })
                }
              >
                Add question
              </button>
            </section>
          ),
        )}
      </section>

      {importError && (
        <p className="error">{importError}</p>
      )}

      <div className="mock-actions">
        <button
          type="button"
          className="secondary"
          onClick={() => setPreview(!preview)}
        >
          {preview ? "Close preview" : "Preview test"}
        </button>

        <button>
          {draft.isPublished
            ? "Save and publish"
            : "Save draft"}
        </button>
      </div>

      {preview && <Preview draft={draft} />}
    </form>
  );
}

function QuestionEditor({
  question,
  number,
  update,
  remove,
}: {
  question: QuestionDraft;
  number: number;
  update: (change: Partial<QuestionDraft>) => void;
  remove: () => void;
}) {
  return (
    <div className="question-editor">
      <div className="section-heading">
        <strong>Question {number}</strong>

        <button
          type="button"
          className="delete"
          onClick={remove}
        >
          Remove
        </button>
      </div>

      <textarea
        value={question.text}
        onChange={(event) =>
          update({ text: event.target.value })
        }
        placeholder="Question text"
        required
      />

      {question.options.map((option, index) => (
        <label key={index}>
          <input
            type="radio"
            name={`correct-${number}`}
            checked={
              question.correctOptionIndex === index
            }
            onChange={() =>
              update({
                correctOptionIndex: index,
              })
            }
          />{" "}
          <input
            value={option}
            onChange={(event) => {
              const options = [...question.options];
              options[index] = event.target.value;

              update({ options });
            }}
            placeholder={`Option ${index + 1}`}
            required
          />
        </label>
      ))}
    </div>
  );
}

function Preview({ draft }: { draft: TestDraft }) {
  return (
    <section className="card preview">
      <h2>
        Preview: {draft.name || "Untitled mock test"}
      </h2>

      {draft.sections.map(
        (section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3>
              {section.name ||
                `Section ${sectionIndex + 1}`}{" "}
              · {section.pointsPerQuestion} points each
            </h3>

            {section.questions.map(
              (question, questionIndex) => (
                <div
                  className="preview-question"
                  key={questionIndex}
                >
                  <strong>
                    {questionIndex + 1}.{" "}
                    {question.text ||
                      "Untitled question"}
                  </strong>

                  {question.options.map(
                    (option, index) => (
                      <p
                        className={
                          index ===
                          question.correctOptionIndex
                            ? "correct-option"
                            : ""
                        }
                        key={index}
                      >
                        {index + 1}.{" "}
                        {option || "(empty)"}
                      </p>
                    ),
                  )}
                </div>
              ),
            )}
          </div>
        ),
      )}
    </section>
  );
}

function parseImport(
  content: string,
  filename: string,
): QuestionDraft[] {
  if (
    filename.toLowerCase().endsWith(".json")
  ) {
    let data: unknown;

    try {
      data = JSON.parse(content);
    } catch {
      throw new Error("JSON is not valid.");
    }

    if (!Array.isArray(data)) {
      throw new Error(
        "JSON must be an array of question objects.",
      );
    }

    return data.map((entry, index) =>
      validateImported(entry, index + 1),
    );
  }

  const rows = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((row) => row.trim());

  if (rows.length < 2) {
    throw new Error(
      "CSV needs a header and at least one question row.",
    );
  }

  const header = parseCsvRow(rows[0]).map(
    (value) => value.trim(),
  );

  const expected = [
    "question",
    "option1",
    "option2",
    "option3",
    "option4",
    "correctOption",
  ];

  if (
    header.length !== expected.length ||
    header.some(
      (value, index) => value !== expected[index],
    )
  ) {
    throw new Error(
      `CSV header must be: ${expected.join(", ")}`,
    );
  }

  return rows.slice(1).map((row, index) => {
    const values = parseCsvRow(row);

    if (values.length !== 6) {
      throw new Error(
        `CSV row ${index + 2} must have exactly 6 columns.`,
      );
    }

    return validateImported(
      {
        question: values[0],
        options: values.slice(1, 5),
        correctOptionIndex: Number(values[5]) - 1,
      },
      index + 2,
    );
  });
}

function validateImported(
  entry: unknown,
  position: number,
): QuestionDraft {
  const value = entry as {
    question?: unknown;
    options?: unknown;
    correctOptionIndex?: unknown;
  };

  if (
    !value ||
    typeof value.question !== "string" ||
    !value.question.trim()
  ) {
    throw new Error(
      `Entry ${position}: question is required.`,
    );
  }

  if (
    !Array.isArray(value.options) ||
    value.options.length !== 4 ||
    value.options.some(
      (option) =>
        typeof option !== "string" ||
        !option.trim(),
    )
  ) {
    throw new Error(
      `Entry ${position}: options must be exactly four non-empty strings.`,
    );
  }

  if (
    !Number.isInteger(value.correctOptionIndex) ||
    Number(value.correctOptionIndex) < 0 ||
    Number(value.correctOptionIndex) > 3
  ) {
    throw new Error(
      `Entry ${position}: correct option must be 0–3 (JSON) or 1–4 (CSV).`,
    );
  }

  return {
    text: value.question.trim(),
    options: value.options.map((option) =>
      (option as string).trim(),
    ),
    correctOptionIndex: Number(
      value.correctOptionIndex,
    ),
  };
}

function parseCsvRow(row: string) {
  const values: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];

    if (char === '"') {
      if (
        quoted &&
        row[index + 1] === '"'
      ) {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }

  if (quoted) {
    throw new Error(
      "CSV contains an unclosed quoted value.",
    );
  }

  values.push(value);

  return values;
}