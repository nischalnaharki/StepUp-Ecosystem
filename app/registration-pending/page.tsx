import Link from "next/link";
export default function Pending(){return <main className="auth-page"><section className="card centered"><div className="mark">✓</div><h1>You&apos;re on the list!</h1><p>Your registration is pending admin approval. We&apos;ll unlock your course once it&apos;s approved.</p><Link className="button" href="/login">Go to login</Link></section></main>}
