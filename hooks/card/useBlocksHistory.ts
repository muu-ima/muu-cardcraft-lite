// hooks/card/useBlocksHistory.ts
"use client";

import { useEffect, useRef } from "react";
import { useHistoryState } from "@/hooks/History"; 
import type { Block } from "@/shared/blocks";

export function useBlocksHistory(initial: Block[]) {
  const { present: blocks, set, commit, undo, redo } =
    useHistoryState<Block[]>(initial);

  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const setRef = useRef(set);
  useEffect(() => {
    setRef.current = set;
  }, [set]);

  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  }, [commit]);

  return { blocks, set, commit, undo, redo, blocksRef, setRef, commitRef };
}
