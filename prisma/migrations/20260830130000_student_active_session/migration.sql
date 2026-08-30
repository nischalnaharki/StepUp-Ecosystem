-- A random marker is replaced on every successful student sign-in.
-- JWTs containing an older marker are rejected by the Auth.js jwt callback.
ALTER TABLE "Student" ADD COLUMN "activeSessionId" TEXT;
