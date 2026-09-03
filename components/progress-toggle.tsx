"use client";

import { useState, useTransition } from "react";

export function ProgressToggle({
  checked: initialChecked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => Promise<boolean>;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [pending, startTransition] = useTransition();

  return (
    <label className="progress-toggle">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={() =>
          startTransition(async () => {
            try {
              setChecked(await onToggle());
            } catch {
              setChecked(initialChecked);
            }
          })
        }
      />

      <span>{pending ? "Saving…" : label}</span>
    </label>
  );
}