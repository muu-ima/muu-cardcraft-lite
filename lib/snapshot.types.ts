// lib/snapshot.types.ts
import type { DesignKey } from "@/shared/design";
import type { Block } from "@/shared/blocks";

export type SnapshotPayload = {
  version: 1;
  design: DesignKey;
  blocks: Block[];
};
