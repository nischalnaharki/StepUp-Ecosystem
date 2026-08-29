"use client";

export function ConfirmDeleteMockTest({ action }: { action: () => void }) {
  return <form action={action} onSubmit={(event) => { if (!window.confirm("Delete this mock test? This cannot be undone.")) event.preventDefault(); }}><button className="delete">Delete mock test</button></form>;
}
