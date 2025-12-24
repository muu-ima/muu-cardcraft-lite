// app/comopnents/panels/FontPanel.tsx
"use client";

import type { Block } from "@/shared/blocks";
import FontTab from "@/app/components/tabs/FontTab";
import PanelSection from "@/app/components/panels/PanelSection";
import type { FontKey } from "@/shared/fonts";

type Props = {
  blocks: Block[];
  activeBlockId: string;
  onChangeFont: (id: string, fontKey: FontKey) => void;
};

export default function FontPanel({
  blocks,
  activeBlockId,
  onChangeFont,
}: Props) {
  const value = blocks.find((b) => b.id === activeBlockId)?.fontKey ?? "sans";
 return (
    <PanelSection title="フォント" desc="文字のフォントを選択します。">
      <FontTab
        value={value}
        onChange={(font) => onChangeFont(activeBlockId, font)}
      />
    </PanelSection>
  );
}

