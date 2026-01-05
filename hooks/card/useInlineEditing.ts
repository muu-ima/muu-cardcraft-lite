"use client";

import { useState } from "react";

type InlineEditingState = {
  editingBlockId: string | null;
  startEditing: (id: string) => void;
  stopEditing: () => void;
  isEditing: boolean;
};

export function useInlineEditing(): InlineEditingState {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const startEditing = (id: string) => {
    setEditingBlockId(id);
  };

  const stopEditing = () => {
    setEditingBlockId(null);
  };

  return {
    editingBlockId,
    startEditing,
    stopEditing,
    isEditing: editingBlockId !== null,
  };
}
