import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Navigation */}
      <nav className="nav">
        <Link href="/" className="brand" aria-label="StepUp Academy home">
          <img
            src="/logo"
            alt="StepUp Academy logo"
            width={34}
            height={34}
            style={{
              objectFit: "cover",
              border: "2px solid var(--ink)",
              borderRadius: 7,
            }}
          />
          <span>StepUp Academy</span>
        </Link>

        <div className="nav-actions">
          <Link href="/login">Login</Link>
          <Link className="button small" href="/register">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <p className="eyebrow">THE STEP TO UP</p>

        <h1>
          From SEE to your
          <br />
          <em>next big step.</em>
        </h1>

        <p className="lead">
          Your bridge course for +2 — clear notes, focused lessons, and
          exam-focused preparation made specifically for NEB students.
        </p>

        <div className="actions">
          <Link className="button" href="/register">
            Start your journey
          </Link>

          <Link className="text-link" href="/login">
            I already have an account <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="channel">
        <p className="eyebrow">STEPUP ON YOUTUBE</p>

        <h2>Study smarter. Score stronger.</h2>

        <p>
          NEB Class 11/12 one-shots, chapter summaries, and practical
          exam-strategy videos — straight to the point and built around the
          questions that matter.
        </p>

        <a
          className="youtube"
          href="https://www.youtube.com/@StepUpAcademyNp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">▶</span> Watch on YouTube
        </a>
      </section>
    </main>
  );
}