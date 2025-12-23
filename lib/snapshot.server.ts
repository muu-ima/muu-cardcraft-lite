// lib/snapshot.server.ts
import { createClient } from "@supabase/supabase-js";
import type { SnapshotPayload } from "./snapshot.types";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ← server only
);

export async function getSnapshotByTokenServer(
  token: string
): Promise<SnapshotPayload | null> {
  const { data, error } = await supabaseAdmin.rpc("get_snapshot_by_token", {
    p_token: token,
  });

  if (error) throw error;
  return (data ?? null) as SnapshotPayload | null;
}
