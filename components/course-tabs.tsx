"use client";

import { useState } from "react";
import { BookViewer } from "@/components/book-viewer";

type CourseTab = "book" | "mock-test";

const tabs: { id: CourseTab; label: string }[] = [
  { id: "book", label: "Book" },
  { id: "mock-test", label: "Mock Test" },
];

export function CourseTabs() {
  const [activeTab, setActiveTab] = useState<CourseTab>("book");
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <section className="course-tabs">
      <nav className="course-tab-nav" aria-label="Course sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== "book") setBookOpen(false);
            }}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div role="tabpanel" hidden={activeTab !== "book"}>
        <section className="book-section">
          <div>
            <span>01</span>
            <h2>Book</h2>
            <p>Read your After SEE study book in StepUp Academy.</p>
          </div>

          {bookOpen ? (
            <>
              <button
                type="button"
                className="button small"
                style={{ marginBottom: 14 }}
                onClick={() => setBookOpen(false)}
              >
                ← Close book
              </button>
              <BookViewer />
            </>
          ) : (
            <div className="book-launch">
              <p>Ready to study? Open your book whenever you are.</p>
              <button
                type="button"
                className="button"
                onClick={() => setBookOpen(true)}
              >
                Open Book
              </button>
            </div>
          )}
        </section>
      </div>

      <div role="tabpanel" hidden={activeTab !== "mock-test"}>
        <section className="course-card mock">
          <span>02</span>
          <h2>Mock Test</h2>
          <p>Put your preparation to the test.</p>
          <div className="soon">Coming soon</div>
        </section>
      </div>
    </section>
  );
}