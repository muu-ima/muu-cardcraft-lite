import type { FontKey } from "@/shared/fonts";

export type Block = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontKey: FontKey;
};