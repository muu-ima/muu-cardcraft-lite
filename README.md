# CardCraft Lite – 名刺作成エディタ（Prototype）

CardCraft Lite は、Web上で名刺デザインを編集・プレビュー・画像書き出しできる  
**描画システム志向の名刺エディタ**です。

CardCraft Lite は、名刺デザイン業務を想定した  
**実寸ベース・状態一元管理型の名刺作成エディタ**です。

編集・プレビュー・書き出しを明確に分離し、  
**印刷物としての信頼性と、将来的な機能拡張性**を重視して設計されています。

---

## ✨ 主な機能（現時点）

- 名刺サイズ（480 × 303）を基準とした **実寸ベース描画**
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

```text

blocks（状態）
└─ CardSurface（描画）
   ├─ editor   （scaleあり・操作可）
   ├─ preview  （scaleあり・操作不可）
   └─ export   （scaleなし・画面外）

```

## 🧩 コンポーネント構成（現行）

```text

app/
└─ editor/
   └─ CardEditor.tsx
      └─ 状態管理・各レイヤの制御を行う親コンポーネント

components/
└─ editor/
   ├─ EditorCanvas.tsx      // 編集用 CardSurface（操作可・scaleあり）
   ├─ CenterToolbar.tsx     // Canva風センターツールバー
   ├─ PrintGuides.tsx       // 安全領域・ガイド描画
   ├─ BottomSheet.tsx       // モバイル用操作UI
   └─ MobileBottomBar.tsx

panels/
├─ TextPanel.tsx            // テキスト編集パネル
├─ FontPanel.tsx            // フォント設定
├─ ExportPanel.tsx          // 書き出し操作
└─ PanelSection.tsx         // パネルUI共通部品

tabs/
└─ EditorTabs.tsx           // タブUI制御
```

## 🧪 実装メモ

- Editor / Preview / Export はすべて同一 blocks を参照
- 表示倍率は scale のみで制御し、状態には一切含めない
- ドラッグ時は見た目座標 → 実寸座標へ逆算
- Export は DOM を信用せず Canvas で再描画

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
- [x] タップ操作（基本操作のみ）
- [ ] タブUIの完全分離
- [ ] ブロック整列（行揃え）
- [ ] 表面デザインの本格編集対応（現在は表面のみ限定編集）

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

## 👤 Author

**muu ima**

Next.js / TypeScript / Laravel / WordPress / Docker を使って  
業務支援アプリや予約管理システム、海外利益計算ツールなどを制作している  
**業務ツールクリエイター**。

- 独学 1年でフルスタック構成を習得  
- 設計・ロジック・UI/UX・デプロイまで一貫して制作  
- 社内ツールを中心に、実用性のあるアプリを継続的に開発  
- Tools Hub を軸に、計算ツールやシステムを随時拡張中  