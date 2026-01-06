"use client";

import { useState } from "react";

type InlineEditingState = {
  editingBlockId: string | null;
  editingText: string;
  setEditingText: (text: string) => void;

  startEditing: (id: string, initialText: string) => void;
  stopEditing: () => void;
  isEditing: boolean;
};

export function useInlineEditing(): InlineEditingState {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const startEditing = (id: string, initialText: string) => {
    setEditingBlockId(id);
    setEditingText(initialText);
  };

  const stopEditing = () => {
    setEditingBlockId(null);
    setEditingText("");
  };

  return {
    editingBlockId,
    editingText,
    setEditingText,
    startEditing,
    stopEditing,
    isEditing: editingBlockId !== null,
  };
}
