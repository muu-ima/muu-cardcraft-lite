// hooks/useCardBlocks.ts
"use client";

import { useRef, useState } from "react";
import { useBlocksHistory } from "@/hooks/card/useBlocksHistory";
import { useBlockActions } from "@/hooks/card/useBlockActions";
import { useBlockDrag } from "@/hooks/card/useBlockDrag";
import { useHistoryHotkeys } from "@/hooks/card/useHistoryHotkeys";
import { useExportImage } from "@/hooks/export/useExportImage";
import type { Block } from "@/shared/blocks";

// ✅ 初期ブロックは定数に（毎レンダリングで作らない）
const INITIAL_BLOCKS: Block[] = [
  {
    id: "name",
    type: "text",
    text: "山田 太郎",
    x: 100,
    y: 120,
    fontSize: 24,
    fontWeight: "bold",
    fontKey: "serif",
  },
  {
    id: "title",
    type: "text",
    text: "デザイナー / Designer",
    x: 100,
    y: 80,
    fontSize: 18,
    fontWeight: "normal",
    fontKey: "sans",
  },
];

export function useCardBlocks() {
  const { blocks, set, commit, undo, redo, blocksRef, setRef, commitRef } =
    useBlocksHistory(INITIAL_BLOCKS);

  const {
    previewText,
    commitText,
    updateFont,
    updateTextStyle,
    addBlock,
    updateFontSize,
    bumpFontSize,
  } = useBlockActions({ set, commit, blocksRef });

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const startEditing = (id: string) => setEditingBlockId(id);
  const stopEditing = () => setEditingBlockId(null);

  useHistoryHotkeys({ undo, redo });
  
  // カードと各ブロックの DOM
  const cardRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { handlePointerDown } = useBlockDrag({
    blocks,
    blocksRef,
    setRef,
    commitRef,
    cardRef,
    blockRefs,
    editingBlockId,
  });

  const { downloadImage } = useExportImage();

  return {
    blocks,
    addBlock,
    previewText,
    commitText,
    updateFont,
    updateFontSize,
    updateTextStyle,
    bumpFontSize,
    handlePointerDown,
    cardRef,
    blockRefs,
    downloadImage,
    undo,
    redo,
    editingBlockId,
    startEditing,
    stopEditing,
  };
}
