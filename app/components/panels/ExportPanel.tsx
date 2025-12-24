"use client";

import type { DesignKey } from "@/shared/design";
import PanelSection from "@/app/components/panels/PanelSection";
import ExportTab from "@/app/components/tabs/ExportTab";

export default function ExportPanel({
  design,
  onDownload,
}: {
  design: DesignKey;
  onDownload: (
    format: "png" | "jpeg",
    design: DesignKey,
    options?: { quality?: number; pixelRatio?: number; fontFamily?: string }
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <PanelSection title="書き出し" desc="画像として保存します。">
        <ExportTab design={design} onDownload={onDownload} />
      </PanelSection>
    </div>
  );
}
