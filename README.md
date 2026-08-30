# StepUp Academy

**The steps to Up** — a bridge-course platform for Nepali NEB students, from SEE to +2.

## Day 1 — Status

- Landing page
- Student registration + course selection (After SEE / Class 11 / Class 12)
- Login via email/password and Google OAuth
- Admin-approval gated access
- Admin panel: pending approvals, all-students directory, course editing, suspend/reinstate, dashboard stats, book PDF upload, admin account management
- After SEE course: Book (PDF) + Mock Test (coming soon) sections

## Local Setup

### 1. Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — your Neon or Supabase Postgres connection string (must include `?sslmode=require`)
- `AUTH_SECRET` — a random secret (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — from Google Cloud Console
- `BLOB_READ_WRITE_TOKEN` — required on Vercel for persistent, private book PDF storage. Create and connect a Vercel Blob store to the project; Vercel adds this variable automatically.

In the Google Cloud Console, add this as an **authorized redirect URI**:
http://localhost:3000/api/auth/callback/google


### 2. Install and set up the database

```bash
npm install
npm run db:generate
npm run db:push
```

Run `npm run db:push` again any time you pull schema updates.

### 3. Create the first admin account

```bash
npm run admin:create -- admin@example.com use-a-strong-password
```

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Key Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/register` | Student registration |
| `/login` | Student login |
| `/admin/login` | Admin login |
| `/admin` | Pending registrations dashboard |
| `/admin/students` | All-students directory |
| `/admin/book` | Upload/replace After SEE book PDF |
| `/admin/admins` | Manage admin accounts |
| `/course` | Student course view (After SEE / Coming Soon) |
| `/after-see-book.pdf` | Served book PDF (approved After SEE students only) |

## Notes

- PDF uploads are limited to 50 MB, PDF files only.
- Local development stores PDFs in `storage/`; Vercel deployments store them in the connected private Vercel Blob store. After connecting Blob and deploying, upload the book once to move it from the old local-only storage.
- Student access statuses: `PENDING`, `APPROVED`, `DECLINED`, `SUSPENDED`.
