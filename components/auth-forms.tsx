"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/password-input";

const courses = [
  ["AFTER_SEE", "After SEE"],
  ["CLASS_11", "Class 11"],
  ["CLASS_12", "Class 12"],
] as const;

/* ─────────────────────────────────────────────
   Register Form
───────────────────────────────────────────── */

export function RegisterForm() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setBusy(true);

    try {
      const form = new FormData(e.currentTarget);

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(form)),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }

      router.push("/registration-pending");
    } catch {
      setMessage("Unable to create your account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setMessage("");

    const course = (
      document.querySelector(
        "select[name=course]"
      ) as HTMLSelectElement | null
    )?.value;

    if (!course) {
      setMessage("Choose a course before continuing with Google.");
      return;
    }

    try {
      const response = await fetch("/api/google-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course }),
      });

      if (!response.ok) {
        setMessage("Choose a course before continuing with Google.");
        return;
      }

      await signIn("google", {
        callbackUrl: "/course",
      });
    } catch {
      setMessage("Unable to continue with Google. Please try again.");
    }
  }

  return (
    <form onSubmit={submit} className="card form">
      <div className="form-header">
        <h1>Join StepUp</h1>
        <p>Choose your course. Approval comes next.</p>
      </div>

      <div className="form-fields">
        <input
          name="name"
          type="text"
          placeholder="Full name"
          autoComplete="name"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
        />

        <PasswordInput
          name="password"
          placeholder="Password (8+ characters)"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <select
          name="course"
          defaultValue="AFTER_SEE"
          aria-label="Select your course"
          required
        >
          {courses.map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}

      <button type="submit" disabled={busy}>
        {busy ? "Creating account…" : "Register"}
      </button>

      <button
        type="button"
        className="google"
        onClick={google}
        disabled={busy}
      >
        Continue with Google
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────────
   Login Form
───────────────────────────────────────────── */

export function LoginForm({ admin = false }: { admin?: boolean }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setBusy(true);

    try {
      const form = new FormData(e.currentTarget);

      const result = await signIn(
        admin ? "admin-credentials" : "student-credentials",
        {
          email: form.get("email"),
          password: form.get("password"),
          redirect: false,
        }
      );

      if (result?.error) {
        setMessage("Incorrect email or password.");
        return;
      }

      router.push(admin ? "/admin" : "/course");
      router.refresh();
    } catch {
      setMessage("Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card form">
      <div className="form-header">
        <h1>{admin ? "Admin sign in" : "Welcome back"}</h1>

        <p>
          {admin
            ? "StepUp Academy administration"
            : "Sign in to continue learning."}
        </p>
      </div>

      <div className="form-fields">
        <input
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
        />

        <PasswordInput
          name="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />
      </div>

      {message && (
        <p className="error" role="alert">
          {message}
        </p>
      )}

      <button type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Login"}
      </button>

      {!admin && (
        <>
          <button
            type="button"
            className="google"
            onClick={() =>
              signIn("google", {
                callbackUrl: "/course",
              })
            }
            disabled={busy}
          >
            Continue with Google
          </button>

          <p className="fine">
            New here?{" "}
            <a href="/register">
              Create an account
            </a>
          </p>
        </>
      )}
    </form>
  );
}
