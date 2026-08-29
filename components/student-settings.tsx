"use client";

import { useActionState } from "react";
import { updateStudentProfile, type ProfileResult } from "@/app/course/actions";
import { PasswordInput } from "@/components/password-input";

const initialState: ProfileResult = {};

export function StudentSettings({ name, email, hasPassword }: { name: string; email: string; hasPassword: boolean }) {
  const [state, action, pending] = useActionState(updateStudentProfile, initialState);
  return <section className="settings-panel"><div><p className="eyebrow">ACCOUNT</p><h2>Settings</h2><p>Update your details and sign-in password.</p></div><form action={action} className="form settings-form"><label>Name<input name="name" defaultValue={name} required /></label><label>Email address<input name="email" type="email" defaultValue={email} required /></label><fieldset><legend>{hasPassword ? "Change password" : "Set a password"}</legend>{hasPassword && <label>Current password<PasswordInput name="currentPassword" autoComplete="current-password" /></label>}<label>New password<PasswordInput name="newPassword" minLength={8} autoComplete="new-password" placeholder="Leave blank to keep your password" /></label></fieldset>{state.error && <p className="error">{state.error}</p>}{state.success && <p className="success">{state.success}</p>}<button disabled={pending}>{pending ? "Saving…" : "Save settings"}</button></form></section>;
}
