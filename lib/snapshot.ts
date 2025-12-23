// lib/snapshot.ts
import { createClient } from "@supabase/supabase-js";
import type { SnapshotPayload } from "./snapshot.types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** 保存して token を返す */
export async function createSnapshot(payload: SnapshotPayload): Promise<string> {
  const { data, error } = await supabase.rpc("create_snapshot", {
    p_snapshot: payload,
  });
  if (error) throw error;
  return data as string;
}

/** token から snapshot を取得（なければ null） */
export async function getSnapshotByToken(
  token: string
): Promise<SnapshotPayload | null> {
  const { data, error } = await supabase.rpc("get_snapshot_by_token", {
    p_token: token,
  });
  if (error) throw error;
  return data as SnapshotPayload | null;
}
export { SnapshotPayload };

