// app/s/[token]/SnapshotViewer.tsx
"use client";

import type { SnapshotPayload } from "@/lib/snapshot.types";

export default function SnapshotViewer({
  snapshot,
}: {
  snapshot: SnapshotPayload | null;
}) {
  if (!snapshot) return <div className="p-6">スナップショットが見つかりません</div>;

  return (
    <div className="p-6">
      <pre className="text-xs">{JSON.stringify(snapshot, null, 2)}</pre>
    </div>
  );
}
