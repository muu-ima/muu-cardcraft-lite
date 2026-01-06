"use client";

import React, { useRef, useState } from "react";
import ModalPreview from "@/app/components/ModalPreview";
import Toolbar from "@/app/components/Toolbar";
import CardSurface from "@/app/components/CardSurface";
import ToolPanel from "@/app/components/ToolPanel";
import CanvasArea from "@/app/components/editor/CanvasArea";
import BottomSheet from "@/app/components/editor/BottomSheet";
import MobileBottomBar from "@/app/components/editor/MobileBottomBar";
import EditorCanvas from "@/app/components/editor/EditorCanvas";
import MobileHeader from "@/app/components/editor/MobileHeader";
import ExportSurface from "@/app/components/ExportSurface";
import CenterToolbar from "@/app/components/editor/CenterToolbar";
import InlineTextEditor from "@/app/components/editor/InlineTextEditor";

import { useScaleToFit } from "@/hooks/useScaleToFit";
import { useCardBlocks } from "@/hooks/useCardBlocks";
import { useEditorLayout } from "@/hooks/useEditorLayout";
import { useCardEditorState } from "@/hooks/useCardEditorState";
import { type DesignKey } from "@/shared/design";
import type { TabKey } from "@/shared/editor";
import { CARD_FULL_DESIGNS } from "@/shared/cardDesigns";
import { CARD_BASE_W, CARD_BASE_H } from "@/shared/print";

type Side = "front" | "back";

type EditingState = { id: string; initialText: string } | null;

export default function CardEditor() {
  const [editing, setEditing] = useState<EditingState>(null);
  const [design, setDesign] = useState<DesignKey>("plain");
  const exportRef = useRef<HTMLDivElement | null>(null);

  // ★ CanvasArea内の幅でスケール作る（表面/裏面 共通）
  const { ref: canvasRef, scale } = useScaleToFit(CARD_BASE_W, true);

  const {
    blocks: editableBlocks,
    addBlock,
    previewText,
    commitText,
    updateFont,
    updateTextStyle,
    bumpFontSize,
    handlePointerDown: dragPointerDown,
    cardRef,
    blockRefs,
    downloadImage,
    undo,
    redo,
    editingBlockId,
    startEditing,
    stopEditing,
    editingText,
    setEditingText,
  } = useCardBlocks();

  const editor = useCardEditorState({
    editableBlocks,
    design,
    setDesign,
    cardRef,
    blockRefs,
    previewText,
    commitText,
    updateTextStyle,
    bumpFontSize,
    dragPointerDown,
  });

  const { state, actions, selectors } = editor;

  const { sheetTitle } = useEditorLayout({
    activeTab: state.activeTab,
    isPreview: state.isPreview,
  });

  // 追加（CardEditor 内）
  type SheetSnap = "collapsed" | "half" | "full";

  const [sheetSnap, setSheetSnap] = useState<SheetSnap>("collapsed");

  const closeSheet = () => {
    setSheetSnap("collapsed");
    actions.setActiveTab(null);
  };

  // ✅ “タブを開く”はイベントでやる（useEffectで同期しない）
  const openTab = (tab: TabKey) => {
    actions.onChangeTab(tab);
    setSheetSnap((s) => (s === "collapsed" ? "half" : s));
  };

  const getBlocksFor = (s: Side) =>
    s === "front" ? editableBlocks : CARD_FULL_DESIGNS[design].back.blocks;

  // いま編集してる面
  const currentBlocks = getBlocksFor(state.side);

  const centerWrapRef = useRef<HTMLDivElement | null>(null);
  // CardEditor 内
  const onAnyPointerDownCapture = (e: React.PointerEvent) => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const target = e.target as Node;

    // ✅ ツールバー上なら無視（=全解除しない）
    if (centerWrapRef.current?.contains(target)) return;

    // ✅ カード外を押した → 全解除
    if (!cardEl.contains(target)) {
      if (editing) {
        const b = currentBlocks.find((x) => x.id === editing.id);
        if (b && b.type === "text") commitText(editing.id, b.text);
        setEditing(null);

        // ✅ 編集中の“外クリック”は編集終了だけで止める（選択は維持）
        return;
      }

      actions.setActiveBlockId("");
      actions.setActiveTab(null);
    }
  };
  // CardEditor 内に追加
  const resetEditingState = (mode: "commit" | "cancel" = "commit") => {
    if (editing) {
      const b = currentBlocks.find((x) => x.id === editing.id);
      if (b && b.type === "text") {
        if (mode === "commit") commitText(editing.id, b.text);
        if (mode === "cancel") previewText(editing.id, editing.initialText);
      }
    }
    setEditing(null);
    actions.setActiveBlockId(""); // もしくは undefined にしたいなら state 型を変える
    actions.setActiveTab(null);
  };

  const onChangeText = (id: string, value: string) => {
    if (state.side !== "front") return;
    previewText(id, value);
  };

  const onCommitText = (id: string, value: string) => {
    if (state.side !== "front") return;
    commitText(id, value);
  };

  const handleBlockPointerDown = (
    e: React.PointerEvent<Element>,
    blockId: string,
    opts: { scale: number }
  ) => {
    // ✅ 編集中でも「切り替え」は許可する
    if (editing) {
      e.preventDefault();
      e.stopPropagation();

      // ① 現在の編集中テキストを確定（previewTextで更新済みの b.text を commit）
      const cur = currentBlocks.find((x) => x.id === editing.id);
      if (cur && cur.type === "text") {
        commitText(editing.id, cur.text);
      }

      // ② クリックしたブロックへ選択移動
      actions.setActiveBlockId(blockId);

      // ③ クリック先が text なら編集を切り替える。違うなら編集終了
      const next = currentBlocks.find((x) => x.id === blockId);
      if (next && next.type === "text") {
        setEditing({ id: blockId, initialText: next.text });
      } else {
        setEditing(null);
      }
      return; // ✅ 編集中はドラッグ開始しない
    }

    // 通常時はこれまで通り
    actions.setActiveBlockId(blockId);
    dragPointerDown(e, blockId, opts);
  };

  const centerVisible = selectors.centerVisible;
  const centerToolbarValue = selectors.centerToolbarValue;

  return (
    <div
      className="relative h-dvh w-full"
      style={{
        background:
          "linear-gradient(135deg, #eef3f8 0%, #f7eef2 55%, #eef4ff 100%)",
      }}
    >
      {/* ================= Mobile / Tablet (<xl) ================= */}
      <div className="xl:hidden">
        {/* Mobile Header */}
        <MobileHeader
          isPreview={state.isPreview}
          onTogglePreview={actions.togglePreview}
          onUndo={undo}
          onRedo={redo}
          onHome={() => {
            actions.setActiveTab(null);
            actions.setIsPreview(false);
            actions.setSide("front");
          }}
        />

        {/* BottomSheet */}
        <BottomSheet
          snap={sheetSnap}
          onChangeSnap={setSheetSnap}
          onClose={closeSheet}
          title={sheetTitle}
        >
          <ToolPanel
            variant="sheet"
            open={sheetSnap !== "collapsed"}
            onClose={closeSheet}
            activeTab={state.activeTab}
            activeBlockId={state.activeBlockId}
            side={state.side}
            onChangeSide={actions.setSide}
            blocks={getBlocksFor(state.side)}
            onAddBlock={addBlock}
            isPreview={state.isPreview}
            onChangeText={onChangeText}
            onCommitText={onCommitText}
            onChangeFont={updateFont}
            onBumpFontSize={bumpFontSize}
            design={design}
            onChangeDesign={setDesign}
            fontFamily="default"
            onDownload={(format) => {
              if (!exportRef.current) return;
              downloadImage(format, exportRef.current);
            }}
          />
        </BottomSheet>

        {/* Canvas (mobile/tablet) */}
        <div className="pt-14">
          <CanvasArea innerRef={canvasRef}>
            <div onPointerDownCapture={onAnyPointerDownCapture}>
              {/* CenterToolbar: md以上で表示（モバイルは別UI運用） */}
              <div
                ref={centerWrapRef}
                className="hidden md:block relative z-50"
              >
                <CenterToolbar
                  value={centerToolbarValue}
                  activeTab={state.activeTab}
                  onOpenTab={openTab}
                  onChangeFontSize={actions.onChangeFontSize}
                  onToggleBold={actions.onToggleBold}
                  onChangeAlign={actions.onChangeAlign}
                  side={state.side}
                  onChangeSide={actions.setSide}
                  showGuides={state.showGuides}
                  onToggleGuides={() => actions.setShowGuides((v) => !v)}
                  disabled={state.isPreview || state.side !== "front"}
                  visible={centerVisible}
                />
              </div>

              <div className="flex w-full justify-center">
                <EditorCanvas
                  blocks={getBlocksFor(state.side)}
                  design={design}
                  scale={scale}
                  isPreview={state.isPreview}
                  showGuides={state.showGuides}
                  onPointerDown={
                    state.side === "front" ? handleBlockPointerDown : undefined
                  }
                  onBlockDoubleClick={(id) => {
                    const b = editableBlocks.find((block) => block.id === id);
                    if (!b || b.type !== "text") return;
                    startEditing(id, b.text);
                  }}
                  editingBlockId={editingBlockId}
                  editingText={editingText}
                  onChangeEditingText={setEditingText}
                  onStopEditing={stopEditing}
                  onCommitText={commitText}
                  activeBlockId={state.activeBlockId}
                  cardRef={cardRef}
                  blockRefs={blockRefs}
                />
              </div>
            </div>
          </CanvasArea>
        </div>

        {/* Mobile bottom bar */}
        {!state.isPreview && (
          <MobileBottomBar activeTab={state.activeTab} onChangeTab={openTab} />
        )}
      </div>

      {/* ================= Desktop (xl+) ================= */}
      <div className="hidden xl:flex w-full h-[calc(100dvh-56px)]">
        {/* 左：縦ツール（幅として参加） */}
        <aside className="w-14 shrink-0 border-r bg-white/70 backdrop-blur h-full min-h-0">
          <Toolbar
            activeTab={state.activeTab}
            isPreview={state.isPreview}
            onChange={openTab}
            onUndo={undo}
            onRedo={redo}
            onTogglePreview={actions.togglePreview}
          />
        </aside>

        {/* 左：詳細パネル（開いてる時だけ幅を取る） */}
        {state.activeTab !== null && (
          <aside className="w-[416px] shrink-0 border-r bg-white">
            <ToolPanel
              variant="desktop"
              open={true}
              onClose={() => actions.setActiveTab(null)}
              activeTab={state.activeTab}
              activeBlockId={state.activeBlockId}
              side={state.side}
              isPreview={state.isPreview}
              onChangeSide={actions.setSide}
              blocks={getBlocksFor(state.side)}
              onAddBlock={addBlock}
              onChangeText={onChangeText}
              onCommitText={onCommitText}
              onBumpFontSize={bumpFontSize}
              onChangeFont={updateFont}
              design={design}
              onChangeDesign={setDesign}
              fontFamily="default"
              onDownload={(format) => {
                if (!exportRef.current) return;
                downloadImage(format, exportRef.current);
              }}
            />
          </aside>
        )}

        {/* 右：キャンバス領域 */}
        <main className="flex-1 min-w-0 min-h-0">
          <CanvasArea innerRef={canvasRef}>
            <div onPointerDownCapture={onAnyPointerDownCapture}>
              {/* Desktopは常時表示でOK */}
              <div ref={centerWrapRef} className="relative z-50">
                <CenterToolbar
                  value={centerToolbarValue}
                  activeTab={state.activeTab}
                  onOpenTab={openTab}
                  onChangeFontSize={actions.onChangeFontSize}
                  onToggleBold={actions.onToggleBold}
                  onChangeAlign={actions.onChangeAlign}
                  side={state.side}
                  onChangeSide={actions.setSide}
                  showGuides={state.showGuides}
                  onToggleGuides={() => actions.setShowGuides((v) => !v)}
                  disabled={state.isPreview || state.side !== "front"}
                  visible={centerVisible}
                />
              </div>

              <div className="flex w-full justify-center">
                <EditorCanvas
                  blocks={getBlocksFor(state.side)}
                  design={design}
                  scale={scale}
                  isPreview={state.isPreview}
                  showGuides={state.showGuides}
                  onPointerDown={
                    state.side === "front" ? handleBlockPointerDown : undefined
                  }
                  onBlockDoubleClick={(id) => {
                    const b = editableBlocks.find((block) => block.id === id);
                    if (!b || b.type !== "text") return;
                    startEditing(id, b.text);
                  }}
                  editingBlockId={editingBlockId}
                  editingText={editingText}
                  onChangeEditingText={setEditingText}
                  onStopEditing={stopEditing}
                  onCommitText={commitText}
                  activeBlockId={state.activeBlockId}
                  cardRef={cardRef}
                  blockRefs={blockRefs}
                />
              </div>
            </div>
          </CanvasArea>
        </main>
      </div>

      {/* 共通：Preview / Export / Inline editor */}
      <ModalPreview
        open={state.isPreview}
        onClose={() => actions.setIsPreview(false)}
        title="プレビュー"
      >
        {({ scale }) => (
          <div
            style={{ width: CARD_BASE_W * scale, height: CARD_BASE_H * scale }}
          >
            <div
              style={{
                width: CARD_BASE_W,
                height: CARD_BASE_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <CardSurface
                blocks={getBlocksFor(state.side)}
                design={design}
                w={CARD_BASE_W}
                h={CARD_BASE_H}
                interactive={false}
                activeBlockId={undefined}
                onSurfacePointerDown={() => {
                  resetEditingState("commit");
                }}
                className="shadow-lg"
              />
            </div>
          </div>
        )}
      </ModalPreview>

      <ExportSurface
        ref={exportRef}
        blocks={getBlocksFor(state.side)}
        design={design}
      />

      {editing && (
        <InlineTextEditor
          targetEl={blockRefs.current[editing.id]}
          text={
            (currentBlocks.find((b) => b.id === editing.id && b.type === "text")
              ?.text as string) ?? ""
          }
          onChangeText={(next) => previewText(editing.id, next)}
          onCommit={() => {
            const b = currentBlocks.find((x) => x.id === editing.id);
            if (b && b.type === "text") commitText(editing.id, b.text);
            setEditing(null);
          }}
          onCancel={() => {
            previewText(editing.id, editing.initialText);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
