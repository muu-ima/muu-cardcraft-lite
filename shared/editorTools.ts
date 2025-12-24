// shared/editorTools.ts
import { Type, TextCursor, Image as ImageIcon, Download } from "lucide-react";
import type { TabKey } from "@/shared/editor";

export const EDITOR_TOOLS: { key: TabKey; label: string; Icon: React.ElementType }[] = [
  { key: "text", label: "文字", Icon: Type },
  { key: "font", label: "フォント", Icon: TextCursor },
  { key: "design", label: "背景", Icon: ImageIcon },
  { key: "export", label: "書き出し", Icon: Download },
];
