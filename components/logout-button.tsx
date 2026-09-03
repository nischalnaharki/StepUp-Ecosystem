"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await signOut({ callbackUrl: "/" });
  }

  return <button type="button" className={`logout-button ${className}`.trim()} onClick={logout} disabled={busy}>{busy ? "Logging out…" : "Log out"}</button>;
}
