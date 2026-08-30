"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type AvailableTest = { id: string; name: string; questionCount: number; timeLimitMinutes: number | null; status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" };

export function MockTestList({ tests }: { tests: AvailableTest[] }) {
  const [busy, setBusy] = useState<string | null>(null); const [message, setMessage] = useState(""); const router = useRouter();
  async function start(testId: string) { setBusy(testId); setMessage(""); try { const response = await fetch(`/api/mock-tests/${testId}/start`, { method: "POST" }); if (response.status === 403) { window.location.assign("/login?error=signed-in-elsewhere"); return; } const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to start test."); router.push(`/course/mock-tests/${data.attemptId}`); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to start test."); } finally { setBusy(null); } }
  if (!tests.length) return <section className="empty"><h2>No mock tests available</h2><p>Published mock tests for your course will appear here.</p></section>;
  return <section className="mock-test-list">{message && <p className="error">{message}</p>}<div className="results-actions"><Link className="button secondary" href="/course/mock-tests/results">My Results</Link><Link className="button secondary" href="/course/mock-tests/leaderboard">Global leaderboard</Link></div>{tests.map((test) => <article key={test.id} className="course-card"><div><span>TEST</span><h2>{test.name}</h2><p>{test.questionCount} questions · {test.timeLimitMinutes ? `${test.timeLimitMinutes} minutes` : "Untimed"}</p><p className="fine">{test.status === "NOT_STARTED" ? "Not started" : test.status === "IN_PROGRESS" ? "In progress" : "Completed"}</p></div><button className="button" disabled={busy === test.id} onClick={() => start(test.id)}>{busy === test.id ? "Opening…" : test.status === "IN_PROGRESS" ? "Resume" : test.status === "COMPLETED" ? "Retake" : "Start"}</button></article>)}</section>;
}
