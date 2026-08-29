import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      <nav className="nav">
        <Link href="/" className="brand" aria-label="StepUp Academy home">
          <img src="/logo" alt="StepUp Academy logo" width={34} height={34} style={{ objectFit: "cover", border: "2px solid var(--ink)", borderRadius: 7 }} />
          <span>StepUp Academy</span>
        </Link>
        <div className="nav-actions">
          <Link href="/login">Login</Link>
          <Link className="button small" href="/register">Register</Link>
        </div>
      </nav>

      <section className="hero hero-upgraded">
        <div className="hero-copy">
          <p className="eyebrow"><span /> MADE FOR NEB STUDENTS</p>
          <h1>From SEE to your<br /><em> Bachelors</em></h1>
          <p className="lead">Your bridge to +2: clear notes, focused lessons, and exam-ready preparation that makes every study session count.</p>
          <div className="actions">
            <Link className="button" href="/register">Start learning <span aria-hidden="true">→</span></Link>
            <Link className="text-link" href="/login">I already have an account <span aria-hidden="true">→</span></Link>
          </div>
          <div className="hero-proof" aria-label="StepUp benefits">
            <span><b>✓</b> Study at your pace</span><span><b>✓</b> Built around NEB</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="study-card main-study-card">
            <div className="study-card-top"><span>Our&apos;s focus</span><i>24/7</i></div>
            <strong>Your Success</strong><p>Your &amp; Our Efforts</p>
            <div className="progress-line"><i /></div><small>3 of 5 steps complete</small>
          </div>
          <div className="study-card result-card"><span className="card-icon">✦</span><div><small>Mock test score</small><strong>92%</strong></div></div>
          <div className="paper-note"><span>After SEE, +2 to Before Bachelors </span><b>READY</b><i>↗</i></div><div className="hero-sun" />
        </div>
      </section>

      <section className="landing-strip" aria-label="What StepUp offers">
        <p>One clear place for your +2 preparation</p>
        <div><span>Notes</span><i /> <span>Lessons</span><i /> <span>Mock tests</span><i /> <span>Progress</span></div>
      </section>

      <section className="steps-section">
        <div className="section-intro"><p className="eyebrow">A SMARTER STUDY ROUTINE</p><h2>Everything you need to <em>move forward.</em></h2></div>
        <div className="steps-grid">
          <article><span>01</span><div className="feature-icon lime-icon">▤</div><h3>Learn clearly</h3><p>Focused lessons and notes that get straight to the concepts you need.</p></article>
          <article><span>02</span><div className="feature-icon orange-icon">✓</div><h3>Practice often</h3><p>Test your understanding with questions designed for your exams.</p></article>
          <article><span>03</span><div className="feature-icon blue-icon">↗</div><h3>See your growth</h3><p>Track your progress, build confidence, and know what to study next.</p></article>
        </div>
      </section>

      <section className="channel channel-upgraded">
        <div><p className="eyebrow">STEPUP ON YOUTUBE</p><h2>Study smarter.<br /><em>Score stronger.</em></h2><p>NEB Class 11/12 one-shots, chapter summaries, and practical exam strategy—straight to the point and built around what matters.</p><a className="youtube" href="https://www.youtube.com/@StepUpAcademyNp" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">▶</span> Watch free lessons</a></div>
        <div className="channel-stat"><strong>Free</strong><span>short, useful lessons<br />whenever you need them.</span></div>
      </section>
    </main>
  );
}
