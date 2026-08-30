# StepUp Academy

**The steps to Up** — a course platform for Nepali NEB/BSc CSIT students, built with Next.js (App Router), Prisma, and PostgreSQL.

## Features

### Student-facing
- Landing page with channel info and course overview
- Registration with course selection, email/password or Google OAuth
- Admin-approval gated access (Pending / Approved / Declined / Suspended)
- Single active session enforcement (logging in on a new device signs out the old one)
- Auto-redirect for already-logged-in users (no repeated logins)
- Per-course modules, each toggleable independently by admin:
  - **Book** — protected in-browser PDF viewer (no download/print/right-click), page navigation with resume-last-page, per-course file
  - **Mock Test** — sectioned multiple-choice tests, randomized questions/options per attempt, timer, question navigator with flagging, autosave, resume support, server-side scoring with optional negative marking, per-test and global leaderboards, score history, question-by-question review
  - **Videos** — organized by topic/chapter, admin-provided links
  - **Notes** — external study material links
  - **Live Classes** — Zoom/meeting links and session details
  - **Notices** — general announcements, newest first
- Student progress tracking: toggleable "seen"/"attended" ticks for videos, notes, and live classes (Mock Test progress is automatic via attempt records)
- Student dashboard/profile: edit name, set or change password (including for Google-only accounts)

### Admin-facing
- Dashboard with student/course statistics
- Student directory: search, filter, bulk approve/decline, individual course reassignment, suspend/reinstate, delete (with confirmation)
- CSV export of the student directory
- Email notifications (via Resend) on approve/decline
- Full activity log of admin actions (approvals, course changes, deletions, content changes, etc.)
- Course management: create courses, toggle which modules each course includes
- Per-course book upload/replacement (Vercel Blob storage in production, local filesystem in development)
- Mock Test builder: sections with per-section point values, manual question entry or CSV/JSON bulk import, preview before publishing, per-test analytics (average score, hardest questions)
- Content management for Videos, Notes, Live Classes, and Notices
- Multi-admin support (create additional admin accounts)

## Local Setup

### 1. Environment variables

Create a `.env` file in the project root with:

```
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
AUTH_SECRET="a-long-random-secret"
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="StepUp Academy <onboarding@resend.dev>"
```

- `DATABASE_URL` — a Postgres connection string (Neon or Supabase recommended). Use the **pooled** connection string if using Neon.
- `AUTH_SECRET` — generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — from Google Cloud Console. Add both `http://localhost:3000` (Authorized JavaScript origin) and `http://localhost:3000/api/auth/callback/google` (Authorized redirect URI).
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — from resend.com. Without a verified sending domain, Resend's shared sender (`onboarding@resend.dev`) only delivers to the email address that owns the Resend account — fine for local testing, not sufficient for real students until a custom domain is verified.

**Book storage:** in local development, uploaded book PDFs are saved to the local filesystem. No extra setup is needed locally. This is different from production — see the Vercel section below.

### 2. Install and set up the database

```bash
npm install
npx prisma generate
npx prisma db push
```

Run `npx prisma generate` again any time the schema changes.

### 3. Create the first admin account

```bash
npx tsx scripts/create-admin.ts admin@example.com use-a-strong-password
```

(Password must be at least 8 characters.)

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Deploying to Vercel

In addition to the environment variables above, production requires:

- **Vercel Blob storage** — book PDFs are stored in local filesystem storage only during development. In production, they must be stored in Vercel Blob, since Vercel's serverless functions have a read-only, ephemeral filesystem.
  1. In your Vercel project, go to **Storage** → **Create Database** → **Blob**
  2. Choose **Private** access (required — book access must stay gated behind student approval, not publicly accessible by URL)
  3. Connect the store to your project (this adds `BLOB_READ_WRITE_TOKEN` automatically)
  4. Redeploy after connecting, so the new environment variable takes effect
- All other environment variables (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`) must be set in the Vercel project's Environment Variables settings.
- Add your production URL to Google Cloud Console's Authorized JavaScript origins and Authorized redirect URIs (`https://your-domain.vercel.app/api/auth/callback/google`).

## Key Routes

### Student
| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/register` | Student registration |
| `/login` | Student login |
| `/course` | Course hub — Book, Mock Test, Videos, Notes, Live Classes, Notices tabs (only enabled modules shown) |
| `/dashboard` | Student profile and progress overview |

### Admin
| Route | Purpose |
|---|---|
| `/admin/login` | Admin login |
| `/admin` | Dashboard — pending registrations, stats |
| `/admin/students` | Student directory — search, filter, bulk actions, course editing, suspend/delete |
| `/admin/courses` | Create and manage courses, toggle enabled modules |
| `/admin/book` | Upload/replace each course's book PDF |
| `/admin/mock-tests` | Create and manage mock tests, sections, and questions |
| `/admin/videos` | Manage video topics and videos per course |
| `/admin/notes` | Manage note links per course |
| `/admin/live-classes` | Manage live class entries per course |
| `/admin/notices` | Manage general announcements per course |
| `/admin/admins` | Create additional admin accounts |
| `/admin/activity` | Full log of admin actions |

## Notes

- Student access statuses: `PENDING`, `APPROVED`, `DECLINED`, `SUSPENDED`.
- PDF uploads are limited to 50 MB, PDF files only.
- A student can only have one active session at a time — logging in elsewhere signs out the previous session.
- Book PDFs are protected in-browser (no direct download link, no print/right-click) but this is a deterrent against casual sharing, not a guarantee against screen recording or determined redistribution.