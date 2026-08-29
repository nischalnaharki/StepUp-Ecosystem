"use client";

import { useActionState } from "react";
import { updateAdminProfile, type AdminProfileResult } from "@/app/admin/actions";
import { PasswordInput } from "@/components/password-input";

const initialState: AdminProfileResult = {};

export function AdminSettings({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateAdminProfile, initialState);
  return <section className="card admin-card settings-panel"><div><p className="eyebrow">YOUR ACCOUNT</p><h2>Settings</h2><p>Update your administrator details and password.</p></div><form action={action} className="form settings-form"><label>Name<input name="name" defaultValue={name} required /></label><label>Email address<input name="email" type="email" defaultValue={email} required /></label><fieldset><legend>Change password</legend><label>Current password<PasswordInput name="currentPassword" autoComplete="current-password" /></label><label>New password<PasswordInput name="newPassword" minLength={8} autoComplete="new-password" placeholder="Leave blank to keep your password" /></label></fieldset>{state.error && <p className="error">{state.error}</p>}{state.success && <p className="success">{state.success}</p>}<button disabled={pending}>{pending ? "Saving…" : "Save settings"}</button></form></section>;
}
