// app/s/[token]/page.tsx
import { getSnapshotByTokenServer } from "@/lib/snapshot.server";
import SnapshotViewer from "./SnapshotViewer";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function Page({ params }: Props) {
  const { token } = await params; // ✅ ここ
  const snapshot = await getSnapshotByTokenServer(token);

  return <SnapshotViewer snapshot={snapshot} />;
}
