# TASK-003: 罫線ドローの統一「製図の手つき・第三稿A」

## Context

- スタック: Vite + React 19 + TypeScript + CSS Modules。アニメーションライブラリなし(新規 npm 依存は**禁止**)
- デザインコンセプト「図面のように、話す」/ モーションコンセプト「製図の手つき」(様式→罫線→記入の製図順序を時間軸に翻訳する)
- TASK-001/002(コミット済み)で罫線 scaleX ドローの語彙は確立済み(Company 8行 / SiteFooter / SectionHeading / Quote 工程線)。本タスクは**未適用のまま残った罫線**へ同じ語彙を広げ、サイト全体の統一を完成させる
- 本タスクは **CSS Modules 3ファイルのみの変更**。TSX は一切変更しない
- 並列で別タスクが他ファイルを変更中。**Allowed files 以外に絶対に触れないこと**

## Objective

- A. Hero 表題欄: ロード時に「様式が現れる(既存フェード)→ 罫線を引く(ドロー)→ 値を記入する(段差フェード)」の製図順序で組み上げる(Hero.module.css)
- B. Quality 4項目の左罫(2px 常盤色)の **scaleY** ドロー(Quality.module.css)
- C. Services 加工4項目の上罫+末尾の下罫の scaleX ドロー(Services.module.css)

## Current behavior

- `src/components/sections/Hero.module.css`: Hero は **useReveal 不使用**。ロード時 keyframes ステージング(`.eyebrow`〜`.fact` に `animation: heroRise var(--dur-reveal) var(--ease-out) both` + `animation-delay` 0〜0.62s)。表題欄 `.titleBlock`(delay 0.32s)は一括フェードのみ
  - DOM(Hero.tsx、変更禁止): `dl.titleBlock` > `div.tbRow` ×4(品名/材質/図番/注記)> `dt.tbLabel` + `dd.tbValue`
  - `.tbRow + .tbRow` に `border-top: 1px solid var(--c-sumi)`、`.tbLabel` に `border-right: 1px solid var(--c-sumi)`。外枠は `.titleBlock` の `border: 1.5px solid var(--c-sumi)`
- `src/components/sections/Quality.module.css`: `.item` は Reveal 要素自身(`<Reveal as="li" delay={index * 0.08} className={styles.item}>`、`data-visible` 属性と `--reveal-delay` を自身に持つ)。`border-left: 2px solid var(--color-accent)` は無演出
- `src/components/sections/Services.module.css`: `.item` も同様に Reveal 要素自身(delay `index * 0.08`)。`border-top: 1px solid var(--color-line)`、`:last-child` に `border-bottom`。無演出(TASK-002 で実装済みの `.materialRow` スタガーには**触らない**)

## Existing behavior to preserve

- **TSX 変更禁止**。DOM 構造・セマンティクス・属性を変えない
- **アニメーション完了後の最終静止状態は、現在の見た目と視覚的に完全同一であること**。罫線は「border を `-color: transparent` にして box を維持し、absolute の疑似要素線を重ねる」方式(TASK-002 C/E 項と同方式。1px レイアウトズレ回避)
- Hero の既存 heroRise ステージング(対象クラス・delay 値・keyframes)は**変更しない**
- Hero はロード時 keyframes ベースなので `[data-visible]` パターンは使えない。**隠し状態(scale 0 / opacity 0)は keyframes の `from` にのみ書き、基底宣言には書かない。`to` は最終静止状態と厳密一致。fill-mode `both` 必須**(global.css の reduced-motion 包括ルールは `animation-duration: 0.01ms + animation-delay: 0s !important` 方式のため、これを破ると reduced-motion で隠れたまま/ズレたままになる)
- Quality / Services の隠し状態は**必ず `[data-visible='false']` を含むセレクタ側にだけ**書く(`.item` は Reveal 要素自身なので `:global()` は不要)
- reduced-motion 用の CSS を新たに書かない(global.css の既存包括ルールに任せる。global.css は変更禁止)
- 色は既存トークンのみ(色値の直書き禁止)。時間・イージングは `--ease-draw` / `--ease-out` を使う(振付固有の秒数 0.3〜0.5s は直書き可 = 既存慣例)
- レスポンシブ: 360 / 375 / 768 / 1024 / 1440px で横スクロールが出ないこと(疑似要素は親の box 内に収まる)

## Detailed implementation requirements

以下の完成形コードをそのまま適用してよい。既存宣言のうち記載のないものは変更しない。

### A. Hero 表題欄(src/components/sections/Hero.module.css)

意匠: 表題欄の外枠とラベルは「印刷済みの様式」なので既存フェードのまま。**罫線を引き、値を記入する**動きを重ねる。時間軸は「ブロックフェード 0.32s〜 → ラベル縦罫 0.45s〜 → 行罫線 0.5s〜 → 値の記入 0.7〜1.39s」(facts 帯の完了 1.22s とほぼ同時に収束)。

既存ブロックの変更(3箇所):

```css
.tbRow {
  display: flex;
  position: relative;
}

.tbRow + .tbRow {
  border-top: 1px solid transparent;
}

.tbLabel {
  flex: 0 0 4.5em;
  padding: var(--space-2) var(--space-3);
  border-right: 1px solid transparent;
  position: relative;
  font-size: var(--fs-caption);
  letter-spacing: 0.2em;
  color: var(--color-text-muted);
}
```

`.tbValue` の既存ブロックに animation を1行追記:

```css
.tbValue {
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-caption);
  letter-spacing: 0.06em;
  animation: tbFill 0.45s var(--ease-out) both;
}
```

新規追加(表題欄セクションの末尾、`/* --- 事実の帯 --- */` の前に置く):

```css
/* 行罫線: 透明border上に1px疑似要素を重ね、左から引く */
.tbRow + .tbRow::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--c-sumi);
  transform-origin: left center;
  animation: tbDrawX 0.4s var(--ease-draw) both;
}

.tbRow:nth-child(2)::before {
  animation-delay: 0.5s;
}

.tbRow:nth-child(3)::before {
  animation-delay: 0.58s;
}

.tbRow:nth-child(4)::before {
  animation-delay: 0.66s;
}

/* ラベル列の縦罫: 1本の線を上の行から順に引き下ろす */
.tbLabel::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: -1px;
  width: 1px;
  background: var(--c-sumi);
  transform-origin: center top;
  animation: tbDrawY 0.3s var(--ease-draw) both;
}

.tbRow:nth-child(1) .tbLabel::after {
  animation-delay: 0.45s;
}

.tbRow:nth-child(2) .tbLabel::after {
  animation-delay: 0.53s;
}

.tbRow:nth-child(3) .tbLabel::after {
  animation-delay: 0.61s;
}

.tbRow:nth-child(4) .tbLabel::after {
  animation-delay: 0.69s;
}

/* 値の記入: 様式→罫線→値の製図順序 */
.tbRow:nth-child(1) .tbValue {
  animation-delay: 0.7s;
}

.tbRow:nth-child(2) .tbValue {
  animation-delay: 0.78s;
}

.tbRow:nth-child(3) .tbValue {
  animation-delay: 0.86s;
}

.tbRow:nth-child(4) .tbValue {
  animation-delay: 0.94s;
}
```

keyframes(ファイル末尾の `@keyframes heroRise` の後に追加):

```css
@keyframes tbDrawX {
  from {
    scale: 0 1;
  }

  to {
    scale: 1 1;
  }
}

@keyframes tbDrawY {
  from {
    scale: 1 0;
  }

  to {
    scale: 1 1;
  }
}

@keyframes tbFill {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
```

### B. Quality 左罫の scaleY ドロー(src/components/sections/Quality.module.css)

`.item` の既存ブロックを変更し、疑似要素と隠し状態を追加:

```css
.item {
  border-left: 2px solid transparent;
  position: relative;
  padding-left: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* 左罫: 透明border上に2px疑似要素を重ね、上から下へ引く */
.item::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -2px;
  width: 2px;
  background: var(--color-accent);
  transform-origin: center top;
  transition: scale 0.5s var(--ease-draw) calc(var(--reveal-delay, 0s) + 0.2s);
}

.item[data-visible='false']::before {
  scale: 1 0;
}
```

### C. Services 罫線の scaleX ドロー(src/components/sections/Services.module.css)

`.item` / `.item:last-child` の既存ブロックを変更し、疑似要素と隠し状態を追加:

```css
.item {
  padding-block: var(--space-6);
  border-top: 1px solid transparent;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.item:last-child {
  border-bottom: 1px solid transparent;
}

/* 上罫: 透明border上に1px疑似要素を重ね、左から引く */
.item::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-line);
  transform-origin: left center;
  transition: scale 0.5s var(--ease-draw) calc(var(--reveal-delay, 0s) + 0.2s);
}

.item:last-child::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-line);
  transform-origin: left center;
  transition: scale 0.5s var(--ease-draw) calc(var(--reveal-delay, 0s) + 0.3s);
}

.item[data-visible='false']::before,
.item[data-visible='false']::after {
  scale: 0 1;
}
```

注意: 768px 以上で `.item` は `flex-direction: row` になるが、`position: relative` と疑似要素はそのまま機能する。メディアクエリ内は変更しない。

## Allowed files

- `src/components/sections/Hero.module.css`
- `src/components/sections/Quality.module.css`
- `src/components/sections/Services.module.css`

## Restricted files

- 上記以外の**すべて**。特に: `src/styles/tokens.css` / `src/styles/global.css` / `src/components/**/*.tsx` / `src/components/ui/**` / `src/hooks/**` / `src/data/**` / `CLAUDE.md` / `package.json`
- ファイルの新規作成・削除・リネーム禁止

## Acceptance criteria

1. ロード時、表題欄が「ブロックフェード(0.32s〜)→ ラベル縦罫が上の行から(0.45s〜)→ 行罫線が左から(0.5s〜)→ 値の記入(0.7s〜)」の順に組み上がる
2. Quality 各項目: リビール(フェード+上昇)に続いて左罫が**上→下**に引かれる
3. Services 各項目: リビールに続いて上罫が**左→右**に引かれ、末尾項目は下罫も続いて引かれる
4. アニメーション完了後の見た目が変更前と完全同一(罫線の 1px ズレ・欠けなし)
5. reduced-motion で全演出が即最終状態(罫線・値が隠れたままにならない)
6. 360 / 375 / 768 / 1024 / 1440px で横スクロールが出ない
7. Allowed files 以外の変更がゼロ

## Required tests

- なし(CSS のみの変更。vitest は `css: false` のため対象外)
- **このタスクでは npm コマンド(lint / typecheck / test / build / dev)を実行しないこと**。並列タスクとの干渉を避けるため、検証は親セッションが一括で行う

## Risks

1. **scale の縦横取り違え**: 隠し状態は scaleX ドローが `scale: 0 1`(横に潰す)、scaleY ドローが `scale: 1 0`(縦に潰す)。Quality(縦)と Services(横)で逆になる
2. **1px ズレ**: border を消すだけ(`border: none`)にすると box が縮む。必ず `transparent` 化 + 疑似要素は `top/bottom/left/right: -1px`(Quality は `-2px`)で透明 border 上に重ねる
3. **reduced-motion × keyframes**: `both` を忘れる、または隠し状態を基底宣言に書くと、reduced-motion で表題欄の罫線・値が消える
4. **`.tbValue` のフェードを `.tbRow` に置かない**: 行ごとフェードにすると罫線疑似要素まで一緒に隠れ、ドローの時間軸が破綻する
5. **既存スタガーへの干渉**: Services の `.materialRow`(TASK-002 実装)には触らない
