// shared/cardDesigns.ts
import { CARD_DESIGNS, type DesignKey } from "./design";
import type { Block } from "@/hooks/useCardBlocks";

/**
 * 1つのデザインは
 * - 背景 (bg)
 * - 表面(front): 基本固定（editable:false）
 * - 裏面(back): 編集可能（editable:true）
 * を持つ
 */
export type cardDesign = {
  bg: {
    color: string;
    image?: string;
    mode?: "cover" | "contain";
  };
  front: {
    editable: false;
    blocks: Block[];
  };
  back: {
    editable: true;
    blocks: Block[];
  };
};

/**
 * まずは plain だけ動かす（最小）
 * 表面は固定（空でもOK）
 * 裏面は今の blocks 初期値をここに寄せていく想定
 */
export const CARD_FULL_DESIGNS: Record<DesignKey, cardDesign> = {
  plain: {
    bg: {
      color: CARD_DESIGNS.plain.bgColor,
      image: CARD_DESIGNS.plain.image,
      mode: CARD_DESIGNS.plain.mode,
    },
    front: {
      editable: false,
      blocks: [],
    },
    back: {
      editable: true,
      blocks: [
        {
          id: "name",
          text: "山田 太郎",
          x: 100,
          y: 120,
          fontSize: 24,
          fontWeight: "bold",
        },
        {
          id: "title",
          text: "デザイナー / Designer",
          x: 100,
          y: 80,
          fontSize: 18,
          fontWeight: "normal",
        },
      ],
    },
  },
  // いったん他のデザインも「背景だけ」同じ形で入れておく（裏面はplainと同じでOK）
  girl: {
    bg: {
      color: CARD_DESIGNS.girl.bgColor,
      image: CARD_DESIGNS.girl.image,
      mode: CARD_DESIGNS.girl.mode,
    },
    front: { editable: false, blocks: [] },
    back: { editable: true, blocks: [] },
  },
  kinmokusei: {
    bg: {
      color: CARD_DESIGNS.kinmokusei.bgColor,
      image: CARD_DESIGNS.kinmokusei.image,
      mode: CARD_DESIGNS.kinmokusei.mode,
    },
    front: { editable: false, blocks: [] },
    back: { editable: true, blocks: [] },
  },
  usaCarrot: {
    bg: {
      color: CARD_DESIGNS.usaCarrot.bgColor,
      image: CARD_DESIGNS.usaCarrot.image,
      mode: CARD_DESIGNS.usaCarrot.mode,
    },
    front: { editable: false, blocks: [] },
    back: { editable: true, blocks: [] },
  },
};
