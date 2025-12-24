"use client";

import PanelSection from "@/app/components/panels/PanelSection";
import DesignTab from "@/app/components/tabs/DesignTab";
import type { DesignKey } from "@/shared/design";

export default function DesignPanel({
  design,
  onChangeDesign,
}: {
  design: DesignKey;
  onChangeDesign: (design: DesignKey) => void;
}) {
  return (
    <div className="space-y-4">
      <PanelSection
        title="背景デザイン"
        desc="カードの背景デザインを選択します。"
      >
        <DesignTab value={design} onChange={onChangeDesign} />
      </PanelSection>
    </div>
  );
}
