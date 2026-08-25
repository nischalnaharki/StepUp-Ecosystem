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

  return (
    <section className="course-tabs">
      <nav className="course-tab-nav" aria-label="Course sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "active" : ""}
            onClick={() => setActiveTab(tab.id)}
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
          <BookViewer />
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
