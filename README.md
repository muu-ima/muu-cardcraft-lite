# CardCraft Lite – 名刺作成エディタ（Prototype）

CardCraft Lite は、Web上で名刺デザイン（裏面）を編集・プレビュー・画像書き出しできる  
**描画システム志向の名刺エディタ**です。

現在は **エディタ構造・描画責務・スケール制御の確立**までを目的としたプロトタイプ段階です。

---

## ✨ 主な機能（現時点）

- 名刺サイズ（480 × 260）を基準とした **実寸ベース描画**
- テキストブロックの編集・ドラッグ配置
- レスポンシブ対応（scale による表示縮小）
- プレビューモーダル（編集不可・スケール追従）
- PNG / JPEG 画像書き出し（Canvasベース）
- 描画 / プレビュー / 書き出し の **完全分離構造**

---

## 🧠 設計思想（重要）

このプロジェクトでは、  
**「表示は scale、保存は実寸、状態は blocks が唯一の真実」**  
という設計原則を採用しています。

### レイヤ構造

blocks（状態）
├─ CardSurface（描画）
│ ├─ editor（scaleあり・操作可）
│ ├─ preview（scaleあり・操作不可）
│ └─ export（scaleなし・画面外）

- 表示サイズはすべて `scale` で制御
- 座標・フォントサイズは常に **実寸（480×260基準）**
- 書き出しは DOM を信用せず **Canvasで再描画**

---

## 🧩 コンポーネント構成

app/
├─ components/
│ ├─ CardSurface.tsx // 名刺描画の唯一の責務
│ ├─ ExportSurface.tsx // 書き出し専用DOM
│ ├─ ModalPreview.tsx
│ └─ Toolbar.tsx
│
├─ hooks/
│ ├─ useCardBlocks.ts // blocks管理・ドラッグ・書き出し
│ └─ useScaleToFit.ts // ResizeObserver + scale算出
│
└─ editor/
└─ CardEditor.tsx // 状態管理・制御の親

yaml
コードをコピーする

---

## 📐 スケール管理

- `useScaleToFit(baseWidth, enabled)`
  - 編集用 / プレビュー用で共通化
  - ResizeObserver により自動追従
- **ref の二重付与を禁止**
- 表示用と保存用のDOMを完全分離

---

## 📤 書き出し仕様

- Canvas で 2x 解像度描画
- 背景色・背景画像（cover / contain）対応
- テキストは blocks 情報から再描画
- DOM キャプチャには依存しない設計

---

## 🚧 現在のステータス

- [x] 描画アーキテクチャ確立
- [x] スケール問題解消
- [x] プレビューと書き出し分離
- [ ] タブUIの完全分離
- [ ] モバイル操作（タップ対応）
- [ ] 表面デザイン編集対応
- [ ] フォント選択・行揃え

---

## 🔮 今後の予定

- タブUIのコンポーネント分離
- モバイル向け「タップ選択 → 操作」設計
- 表裏両面デザイン切替
- デザインテンプレートのJSON化
- WordPress / API連携（予定）

---

## 📝 補足

このプロジェクトは  
**「Webフロントエンド」ではなく「描画システム設計」の練習・検証**を主目的としています。

Canvas / Konva / WebGL を使わず、  
DOM + state 管理だけでどこまで設計できるかを重視しています。