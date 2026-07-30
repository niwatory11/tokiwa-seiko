# TASK-006: QuoteForm マイクロインタラクション「製図の手つき・第四稿A」

## Context

- スタック: Vite + React 19 + TypeScript + CSS Modules。アニメーションライブラリなし(新規 npm 依存は**禁止**)
- モーションコンセプトは「製図の手つき」。語彙は リビール(フェード+上昇)/ 罫線ドロー / 段差フェード / 検印 / ホバー色変化(`--dur-quick`)に限定
- 見積もりフォーム(`src/features/quote/QuoteForm.tsx` + `QuoteForm.module.css`)は blur+送信時バリデーション・エラーサマリー・完了ボックスを持つが、**マイクロインタラクションが皆無**: フォーカスしても色の遷移がなく、エラー(`.error` / `.summary`)は条件付きレンダーで突然現れ、完了ボックス(`.doneBox`)も無演出で切り替わる
- 意匠の狙い:「いま記入している欄」をラベル色で示し(製図者が参照中の欄)、エラーは「検図の指摘が書き込まれる」手つき(小さなフェード+上昇)で現れる
- 並列で別タスクが `src/components/layout/MobileDrawer.*` を変更中。**Allowed files 以外に絶対に触れないこと**

## Objective

`src/features/quote/QuoteForm.module.css` **のみ**を変更し、以下を追加する:

- A. フォーカス遷移: `.field:focus-within` でラベルを濃常盤へ(`--dur-quick`)
- B. input ホバー: 枠線が薄墨→墨へ(`--dur-quick`。色変化のみ)
- C. エラー出現: `.error` と `.summary` にフェード+4px上昇のマウントアニメーション(`--dur-quick`)
- D. 完了ボックス出現: `.doneBox` にリビール(フェード+12px上昇、`--dur-reveal`)

TSX(`QuoteForm.tsx`)の変更は**不要**(すべて既存のクラス・属性にCSSを足すだけで成立する)。

## Current behavior(QuoteForm.module.css の関連箇所)

- `.label`: transition なし
- `.input`: `border: 1px solid var(--c-usuzumi)`、transition なし。`:hover` なし
- `.input[aria-invalid='true']`: `border-color: var(--color-error); border-width: 2px`(`.input` の直後に定義)
- `.error` / `.summary` / `.doneBox`: いずれも animation なし(条件付きレンダーで突然現れる)
- `.submit` には既に `transition: background-color var(--dur-quick) var(--ease-out)` + `:hover` があり、**変更しない**

## Existing behavior to preserve

- **静止状態(非フォーカス・非ホバー・アニメ完了後)の見た目は変更前と完全同一**であること
- `aria-invalid='true'` の朱枠(2px)は、hover 中でも朱のまま(墨に上書きされない)
- 色は `tokens.css` の既存トークンのみ。色値の直書き禁止。角丸禁止。translate/scale による持ち上げ・影は禁止
- reduced-motion: global.css が `animation-duration: 0.01ms + animation-delay: 0s + transition-* !important` で全停止する方式。**新規 keyframes は「隠し状態は `from` にのみ」「`to` は最終静止状態と厳密一致」「fill-mode `both`」を厳守**(破ると reduced-motion で要素が隠れたままになる)

## Detailed implementation requirements

以下の完成形コードをそのまま適用してよい(コメント含む)。

### 1. ファイル先頭に keyframes を追加(`.form` の前)

```css
/* 検図の指摘: エラーはフェード+4px上昇で書き込まれる(リビールの縮小形)
   reduced-motion 対策: 隠し状態は from のみ・to は最終静止状態・fill は both */
@keyframes noteIn {
  from {
    opacity: 0;
    translate: 0 4px;
  }

  to {
    opacity: 1;
    translate: 0 0;
  }
}

/* 完了ボックス: セクションと同じリビール(フェード+12px上昇) */
@keyframes doneIn {
  from {
    opacity: 0;
    translate: 0 12px;
  }

  to {
    opacity: 1;
    translate: 0 0;
  }
}
```

### 2. `.label` に transition を1行追記(既存宣言はそのまま)

```css
.label {
  /* 既存宣言はそのまま */
  transition: color var(--dur-quick) var(--ease-out);
}
```

### 3. `.label` ブロックの直後に focus-within を新設

```css
/* いま記入している欄: 製図者が参照中の行をラベル色で示す */
.field:focus-within .label {
  color: var(--color-accent-strong);
}
```

(`.required` バッジは独自の color/background を持つため影響を受けない。変更しない)

### 4. `.input` に transition を1行追記(既存宣言はそのまま)

```css
.input {
  /* 既存宣言はそのまま */
  transition: border-color var(--dur-quick) var(--ease-out);
}
```

### 5. `.input` と `.input[aria-invalid='true']` の**間**に hover を新設

```css
/* hover は色変化のみ(薄墨→墨)。朱枠(aria-invalid)が後勝ちするようこの位置に置く */
.input:hover {
  border-color: var(--color-text);
}
```

**位置が重要**: `.input:hover` と `.input[aria-invalid='true']` は特異性が同じ(0,2,0)なので、ソース順で invalid が後にないと「エラー欄に hover すると朱→墨に化ける」バグになる。

### 6. `.summary` と `.error` に animation を1行ずつ追記(既存宣言はそのまま)

```css
.summary {
  /* 既存宣言はそのまま */
  animation: noteIn var(--dur-quick) var(--ease-out) both;
}

.error {
  /* 既存宣言はそのまま */
  animation: noteIn var(--dur-quick) var(--ease-out) both;
}
```

### 7. `.doneBox` に animation を1行追記(既存宣言はそのまま)

```css
.doneBox {
  /* 既存宣言はそのまま */
  animation: doneIn var(--dur-reveal) var(--ease-out) both;
}
```

## Allowed files

- `src/features/quote/QuoteForm.module.css` **のみ**

## Restricted files

- 上記以外の**すべて**。特に: `src/features/quote/QuoteForm.tsx` / `validation.ts` / `types.ts` / `src/components/**`(並列タスクが変更中)/ `src/styles/**` / `src/data/**` / `src/test/**` / `CLAUDE.md` / `package.json`

## Acceptance criteria

1. input/select/textarea にフォーカスすると、その欄のラベルが濃常盤へ 0.2s で遷移する
2. input に hover すると枠線が薄墨→墨へ 0.2s で遷移する。`aria-invalid='true'` の欄は hover 中も朱 2px のまま
3. blur・送信でエラー(`.error`)とサマリー(`.summary`)が「フェード+4px上昇」で現れる
4. 送信完了で `.doneBox` が「フェード+12px上昇」(0.6s)で現れる
5. 静止状態の見た目(寸法・色・罫線)は変更前と完全同一
6. reduced-motion で全要素が即・最終状態(opacity 1 / translate 0)。隠れたままの要素がない
7. 色値の直書きなし(すべて `var(--...)`)
8. **コマンドは一切実行しない**(CSSのみの変更。lint/test/build は親セッションが並列作業の完了後に直列実行する)
9. Allowed files 以外の変更がゼロ

## Risks

1. **reduced-motion で隠れたまま**: keyframes の `from` 以外に opacity 0 を書く・`both` を忘れる、が典型。上記コードから逸脱しない
2. **hover と invalid の順序**: `.input:hover` を `.input[aria-invalid='true']` より後に置くとエラー枠が hover で墨になる。ソース順を厳守
3. **`.summary` の再アニメーション**: showSummary は送信ごとに再マウントされないため、2回目の失敗送信では再生されない。これは許容(仕様)。TSX に key を足す等の変更をしない
4. **`.submit` の既存 transition**: 変更・重複追加しない
