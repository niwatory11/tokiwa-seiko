# TASK-004: ホバー演出「製図の手つき・第三稿B」

## Context

- スタック: Vite + React 19 + TypeScript + CSS Modules。アニメーションライブラリなし(新規 npm 依存は**禁止**)
- デザインコンセプト「図面のように、話す」。マイクロインタラクションは `--dur-quick`(0.2s)+ `--ease-out` が既存慣例(ヘッダーナビ下線・CTA ボタン等)
- Works の加工例カードと Equipment の設備表には現在 `:hover` が1つもなく、ポインタ操作への応答が皆無。読んでいる場所の手がかりを最小限のホバーで返す
- 本タスクは **CSS Modules 2ファイルのみの変更**。TSX は一切変更しない
- 並列で別タスクが他ファイルを変更中。**Allowed files 以外に絶対に触れないこと**

## Objective

- A. Works カード hover: 図面枠(`.artWrap` の 1.5px 墨枠)を常盤色へ(「いま読んでいる図面」の合図)(Works.module.css)
- B. Equipment 行 hover: 淡常盤の行ハイライト(部品表に定規を当てる手つき)(Equipment.module.css)

## Current behavior

- `src/components/sections/Works.module.css`: カード自体(`.card`)に枠はない。枠は `.artWrap`(図面部)の `border: 1.5px solid var(--c-sumi)` のみ。hover なし
  - DOM(Works.tsx、変更禁止): `<Reveal as="article" className={styles.card}>`(featured は `` `${styles.card} ${styles.cardFeatured}` `` 併記)> `div.artWrap` > PartDrawing SVG。カードは**非インタラクティブ**(リンクなし)
- `src/components/sections/Equipment.module.css`: `.table tbody tr` には **TASK-002 のスタガー用 transition**(`opacity 0.45s` + `transition-delay` 0.15〜0.5s)が既にある。hover なし
  - DOM(Equipment.tsx、変更禁止): tbody 6行、各行 `<th scope="row" class={styles.tdName}>` + `<td class={styles.tdCount}>` + `<td>`。行は非インタラクティブ
  - thead th は `background: var(--color-bg)` を持つ(hover 対象外)

## Existing behavior to preserve

- **TSX 変更禁止**。DOM 構造・属性を変えない
- **非 hover 時の見た目は現在と完全同一**であること
- Works: 持ち上げ(translate / box-shadow)は**採用しない** — 図面は紙の上から動かない。枠色の変化のみ
- Equipment: **スタガー用 transition(`tr` 側)に background-color を追加してはならない**。追加すると `transition-delay`(最大 0.5s)が hover にも効いてハイライトが遅れる。hover 用 transition は**セル側(th / td)**に置く
- カード・行は非インタラクティブ(フォーカス不可)なので `:focus-visible` 対応は不要。`@media (hover: hover)` ガードも既存 hover 実装との統一のため使わない
- 色は既存トークンのみ(`--color-accent` / `--color-accent-bg`)。色値の直書き禁止
- reduced-motion 用の CSS を書かない(global.css の包括ルールで transition が即時化される)

## Detailed implementation requirements

以下の完成形コードをそのまま適用してよい。既存宣言のうち記載のないものは変更しない。

### A. Works カード hover(src/components/sections/Works.module.css)

`.artWrap` の既存ブロックに transition を1行追記し、hover ルールを追加:

```css
.artWrap {
  background-color: var(--color-bg-alt);
  background-image: var(--grid-image);
  background-size: var(--grid-size) var(--grid-size);
  border: 1.5px solid var(--c-sumi);
  padding: var(--space-4);
  transition: border-color var(--dur-quick) var(--ease-out);
}

/* hover: いま読んでいる図面の枠を常盤色にする(持ち上げはしない) */
.card:hover .artWrap {
  border-color: var(--color-accent);
}
```

featured カードは `.card` と `.cardFeatured` を併記しているため、`.card:hover .artWrap` だけで両方に効く。`.cardFeatured` 用の追加ルールは書かない。

### B. Equipment 行 hover(src/components/sections/Equipment.module.css)

スタガー定義(`.table tbody tr:nth-child(n)`)の後に追加:

```css
/* 行ハイライト: スタガー用 transition-delay が tr にあるため、hover はセル側に置く */
.table tbody th,
.table tbody td {
  transition: background-color var(--dur-quick) var(--ease-out);
}

.table tbody tr:hover > th,
.table tbody tr:hover > td {
  background-color: var(--color-accent-bg);
}
```

## Allowed files

- `src/components/sections/Works.module.css`
- `src/components/sections/Equipment.module.css`

## Restricted files

- 上記以外の**すべて**。特に: `src/styles/tokens.css` / `src/styles/global.css` / `src/components/**/*.tsx` / `src/components/ui/**` / `src/hooks/**` / `src/data/**` / `CLAUDE.md` / `package.json`
- ファイルの新規作成・削除・リネーム禁止

## Acceptance criteria

1. Works カードに hover すると図面枠が `--dur-quick` で常盤色に変わり、外すと墨色に戻る(featured カード含む)。位置・影は一切変化しない
2. Equipment の tbody 行に hover すると**遅延なく**淡常盤(`--color-accent-bg`)にハイライトされる(スタガー遅延の混入がないこと)。thead は反応しない
3. 非 hover 時の見た目が変更前と完全同一
4. スクロールリビール(行スタガー・カードリビール)の動きが変更前と同一
5. 360 / 375 / 768 / 1024 / 1440px で横スクロールが出ない
6. Allowed files 以外の変更がゼロ

## Required tests

- なし(CSS のみの変更。vitest は `css: false` のため対象外)
- **このタスクでは npm コマンド(lint / typecheck / test / build / dev)を実行しないこと**。並列タスクとの干渉を避けるため、検証は親セッションが一括で行う

## Risks

1. **hover 遅延の混入**(最重要): `tr` の既存 transition に background-color を足すと、スタガー用 delay がそのまま hover に効いて最大 0.5 秒遅れる。必ずセル側に別 transition を置く
2. **thead への波及**: セレクタに `tbody` を必ず含める。`thead th` の `background: var(--color-bg)` を上書きしない
3. **`border-color` transition の対象**: `.artWrap` の border は一括指定(`border: 1.5px solid var(--c-sumi)`)。transition プロパティは `border-color` のみを指定し、幅や style を動かさない
