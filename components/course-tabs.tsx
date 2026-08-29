"use client";

import { useState } from "react";
import { BookViewer } from "@/components/book-viewer";
import { AvailableTest, MockTestList } from "@/components/mock-test-list";

type CourseTab = "book" | "mock-test";

export function CourseTabs({ hasBook, hasMockTest, mockTests = [] }: { hasBook: boolean; hasMockTest: boolean; mockTests?: AvailableTest[] }) {
  const tabs: { id: CourseTab; label: string }[] = [
    ...(hasBook ? [{ id: "book" as const, label: "Book" }] : []),
    ...(hasMockTest ? [{ id: "mock-test" as const, label: "Mock Test" }] : []),
  ];
  const [activeTab, setActiveTab] = useState<CourseTab>(hasBook ? "book" : "mock-test");
  const [bookOpen, setBookOpen] = useState(false);

  return <section className="course-tabs"><nav className="course-tab-nav" aria-label="Course sections">{tabs.map((tab) => <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => { setActiveTab(tab.id); if (tab.id !== "book") setBookOpen(false); }} aria-selected={activeTab === tab.id} role="tab">{tab.label}</button>)}</nav>{hasBook && <div role="tabpanel" hidden={activeTab !== "book"}><section className="book-section"><div><span>01</span><h2>Book</h2><p>Read your study book in StepUp Academy.</p></div>{bookOpen ? <><button type="button" className="button small" style={{ marginBottom: 14 }} onClick={() => setBookOpen(false)}>← Close book</button><BookViewer /></> : <div className="book-launch"><p>Ready to study? Open your book whenever you are.</p><button type="button" className="button" onClick={() => setBookOpen(true)}>Open Book</button></div>}</section></div>}{hasMockTest && <div role="tabpanel" hidden={activeTab !== "mock-test"}><MockTestList tests={mockTests} /></div>}</section>;
}
