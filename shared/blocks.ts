import type { FontKey } from "@/shared/fonts";

export type Block = {
  type: "text"; 
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontKey: FontKey;
};