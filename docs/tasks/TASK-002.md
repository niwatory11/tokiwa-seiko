# TASK-002: アニメーション拡充「製図の手つき・第二稿」

## Context

- スタック: Vite + React 19 + TypeScript + CSS Modules。アニメーションライブラリなし(新規 npm 依存は**禁止**)
- デザインコンセプト「図面のように、話す」/ モーションコンセプト「製図の手つき」(中心線→外形線→細部→罫線・寸法記入→検印、の製図順序を時間軸に翻訳する)
- TASK-001(実装済み・未コミット)で Hero 入場ステージング / PartDrawing SVG 線画 / 検印スタンプ / SectionHeading 罫線ドロー / ヘッダーナビ下線ドローを実装済み。本タスクはその語彙を未演出箇所へ広げる
- スクロール連動は `src/hooks/useReveal.ts`(IntersectionObserver、reduced-motion と IO 非対応環境では即 `isVisible=true`)と `src/components/ui/Reveal.tsx`(`.reveal` クラス + `data-visible` 属性 + `--reveal-delay` インライン変数)に一本化されている。**この2ファイルは変更しない**
- reduced-motion 対応は `src/styles/global.css` の包括ルール(全要素の animation/transition の duration 0.01ms 化 + delay 0s 化、いずれも `!important`)が既にあるため、**本タスクで reduced-motion 用の CSS を追加してはならない**(global.css は変更禁止)

## Objective

- A. モーショントークン `--dur-slide` の追加と、直書き `0.2s` の一掃(tokens.css / SkipLink / MobileDrawer / QuoteForm)
- B. LogoMark のロード時線画: 中心線(十字)→外形円の順に描く(SiteHeader.tsx / SiteHeader.module.css)
- C. SiteFooter のスクロールリビール(3段)+ 注記罫線ドロー + フッターリンク下線のヘッダー統一(SiteFooter.tsx / SiteFooter.module.css)
- D. Quote 工程のアクセント線ドロー(Quote.module.css)
- E. Company 会社概要 8 行の罫線スタガードロー(Company.module.css)
- F. Equipment 設備表 6 行の段差フェード(Equipment.module.css)
- G. Services 材質 6 行の段差フェード(Services.module.css)
- H. Works 表題欄(スペック 4 行)の段差フェード — 線画の後に記入される時間軸(Works.module.css)
- I. MobileDrawer の入場アニメーション(MobileDrawer.module.css)
- J. CLAUDE.md のモーション規約 1 行更新 + SiteFooter のユニットテスト新規作成

## Current behavior

- `src/styles/tokens.css`: `--dur-quick: 0.2s` / `--dur-reveal: 0.6s` / `--dur-draw: 0.9s` / `--ease-out` / `--ease-draw` が定義済み。`--dur-slide` は未定義
- `src/components/layout/SkipLink.module.css` 12行目: `transition: translate 0.2s var(--ease-out);`(直書き)
- `src/features/quote/QuoteForm.module.css` 105行目: `transition: background-color 0.2s var(--ease-out);`(直書き)
- `src/components/layout/MobileDrawer.module.css` 63行目: `transition: background-color 0.2s var(--ease-out);`(直書き)。ドロワーは `open=false` で `return null`(アンマウント)のため開閉が瞬間表示
- `src/components/layout/SiteHeader.tsx`: `LogoMark` の SVG(circle + 十字 path)は無演出
- `src/components/layout/SiteFooter.tsx`: Reveal/useReveal を一切使っておらず、フッター全体が無演出。`.concept` は `border-top: 1px solid var(--color-line-inverse)`。`.navLink:hover` は `text-decoration: underline`
- `src/components/sections/Quote.tsx`: 各工程は `<Reveal as="li" delay={index * 0.08} className={styles.step}>`。`.step::before` は朱ではなく `var(--color-accent)`(常盤色)の 2px アクセント線で、無演出
- `src/components/sections/Company.tsx`: `.infoWrap` が `<Reveal delay={0.12}>` に包まれ、`dl.infoList`(`border-top`)> `div.infoRow` ×8(`border-bottom`)。行罫線は無演出
- `src/components/sections/Equipment.tsx`: `<Reveal>` 1 枚が `table.table`(thead 1 行 + tbody 6 行)を包む。行は一括表示
- `src/components/sections/Services.tsx`: `.materials` が `<Reveal>` に包まれ、`dl.materialsList` > `div.materialRow` ×6(`border-top: dotted`)。一括表示
- `src/components/sections/Works.tsx`: 各カードは `<Reveal as="article">`。`dl.specs` > `div.specRow` ×4 が PartDrawing の線画と同時に一括表示
- このタスクでは **`src/components/sections/Quote.tsx` / `Company.tsx` / `Equipment.tsx` / `Services.tsx` / `Works.tsx` / `MobileDrawer.tsx` は変更しない**(CSS Modules のみで実装する)

## Existing behavior to preserve

- DOM 構造・セマンティクス・a11y 属性を変えない。**例外は本仕様 B項(LogoMark への className/pathLength 付与)と C項(SiteFooter の div への ref/data-visible 付与)のみ**。要素の追加・削除・タグ変更は一切しない
- `src/hooks/**` と `src/components/ui/Reveal.tsx` は変更しない
- **アニメーション完了後の最終静止状態は、現在の見た目と視覚的に完全同一であること**。特に罫線: border を疑似要素に置き換えると要素が 1px 縮んでレイアウトがズレるため、**必ず「border は `-color: transparent` にして box を維持し、absolute の 1px 疑似要素線を重ねる」方式**を使うこと(本仕様の C/E 項に完成形を記載)
- 配色ルール: 朱(`--c-shu`)は検印とエラーのみ。本タスクで新しい色値の直書きは禁止(既存トークンのみ使用)
- 角丸なし(`--radius: 0`)
- レスポンシブ: 360 / 375 / 768 / 1024 / 1440px で横スクロールが出ないこと
- reduced-motion: global.css の既存包括ルールに任せる。`useReveal` が即 `isVisible=true` を返すため `[data-visible='false']` セレクタは当たらない(=安全側)。この設計を崩さない
- 隠し状態(opacity 0 / scale 0 等)は **必ず `[data-visible='false']` を含むセレクタ側にだけ**書く。デフォルト(属性なし・true)は常に「描画済み」の見た目であること
- 既存テスト(`src/test/App.test.tsx` の h2 見出し検証・注記 2 件以上、`src/test/useReveal.test.tsx` の 3 ケース)を全てパスさせる
- 新規 npm パッケージの追加禁止(package.json は変更禁止)

## Detailed implementation requirements

### A. モーショントークン追加と直書き一掃(tokens.css / SkipLink.module.css / MobileDrawer.module.css / QuoteForm.module.css)

`src/styles/tokens.css` の `--dur-quick` の行の直後に 1 行追加する:

```css
  --dur-quick: 0.2s; /* マイクロインタラクション(hover等) */
  --dur-slide: 0.3s; /* 面の移動(ドロワーの開閉等) */
  --dur-reveal: 0.6s; /* リビール(フェード+上昇) */
```

直書き `0.2s` を `var(--dur-quick)` に置換する(値は同一なので見た目は変わらない):

1. `src/components/layout/SkipLink.module.css`: `transition: translate 0.2s var(--ease-out);` → `transition: translate var(--dur-quick) var(--ease-out);`
2. `src/features/quote/QuoteForm.module.css`(`.submit`): `transition: background-color 0.2s var(--ease-out);` → `transition: background-color var(--dur-quick) var(--ease-out);`
3. `src/components/layout/MobileDrawer.module.css`(`.link`): `transition: background-color 0.2s var(--ease-out);` → `transition: background-color var(--dur-quick) var(--ease-out);`

**注意**: `src/components/ui/PartDrawing.module.css` / `Quality.module.css` / `SectionHeading.module.css` 内の `0.45s` / `0.5s` / `0.4s` 等の振付固有値は**変更しない**(検証済みの見た目を変えないため。これらは Allowed files にも含めていない)。

### B. LogoMark のロード時線画(SiteHeader.tsx / SiteHeader.module.css)

製図の作法どおり「まず中心線(十字)を引き、次に外形円を描く」。スクロール非連動、ページロード時に 1 回だけ CSS アニメーションで実行する。

`src/components/layout/SiteHeader.tsx` の `LogoMark` を次のとおり変更する(**このファイルで変更してよいのは LogoMark 関数内のみ**):

```tsx
/** ロゴマーク: 図面のセンターマーク(中心線記号) */
function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" className={styles.logoMark} aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        pathLength={1}
        className={styles.logoCircle}
      />
      <path
        d="M16 2v8M16 22v8M2 16h8M22 16h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        className={styles.logoCross}
      />
    </svg>
  )
}
```

`src/components/layout/SiteHeader.module.css` に追記する(既存の `.logoMark` はそのまま):

```css
@keyframes logoDraw {
  from {
    stroke-dashoffset: 1;
  }

  to {
    stroke-dashoffset: 0;
  }
}

.logoCross,
.logoCircle {
  stroke-dasharray: 1;
}

.logoCross {
  animation: logoDraw var(--dur-draw) var(--ease-draw) both;
}

.logoCircle {
  animation: logoDraw var(--dur-draw) var(--ease-draw) 0.25s both;
}
```

(十字が 0〜0.9s、円が 0.25〜1.15s。Hero 入場ステージングとほぼ同時に完了する)

### C. SiteFooter リビール + 罫線ドロー + リンク下線統一(SiteFooter.tsx / SiteFooter.module.css)

#### TSX 側

`src/components/layout/SiteFooter.tsx` を次のとおり変更する。変更点は import 1 行と、`.inner` の div への `ref` / `data-visible` 付与のみ(**要素の追加・削除はしない**。Quality セクションの Stamp ラッパーと同じ `useReveal` 直接使用パターン):

```tsx
import { companyInfo } from '../../data/company'
import { navItems } from '../../data/nav'
import { useReveal } from '../../hooks/useReveal'
import styles from './SiteFooter.module.css'

export function SiteFooter() {
  const { ref, isVisible } = useReveal<HTMLDivElement>()
  return (
    <footer className={styles.footer}>
      <div
        ref={ref}
        data-visible={isVisible}
        className={`container ${styles.inner}`}
      >
```

(div の中身と閉じタグ以降は現状のまま一切変えない)

#### CSS 側: 3 段リビール

`src/components/layout/SiteFooter.module.css` に追記する。`.brand` → `nav` → `.concept` の順にフェード+12px 上昇。隠し状態は `[data-visible='false']` 側にのみ書く:

```css
.brand,
.inner nav,
.concept {
  transition:
    opacity var(--dur-reveal) var(--ease-out),
    translate var(--dur-reveal) var(--ease-out);
}

.inner nav {
  transition-delay: 0.1s;
}

.concept {
  transition-delay: 0.2s;
}

.inner[data-visible='false'] .brand,
.inner[data-visible='false'] nav,
.inner[data-visible='false'] .concept {
  opacity: 0;
  translate: 0 12px;
}
```

#### CSS 側: 注記罫線ドロー(レイアウト保全ルール)

既存の `.concept` の `border-top: 1px solid var(--color-line-inverse);` を `border-top: 1px solid transparent;` に変更し(**border を消さない — box サイズ維持のため**)、`position: relative;` を追加する。そのうえで疑似要素の線を重ねる。absolute の基準は padding-box なので、透明化した border の位置に重ねるには `top: -1px` にすること:

```css
.concept::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-line-inverse);
  transform-origin: left center;
  transition: scale var(--dur-draw) var(--ease-draw) 0.3s;
}

.inner[data-visible='false'] .concept::before {
  scale: 0 1;
}
```

#### CSS 側: フッターリンク下線をヘッダーと統一

既存の `.navLink:hover { text-decoration: underline; text-underline-offset: 0.3em; }` ブロックを削除し、次に置き換える(`.navLink` 本体には `position: relative;` を追加):

```css
.navLink::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 8px;
  height: 1px;
  background: currentColor;
  scale: 0 1;
  transform-origin: left center;
  transition: scale var(--dur-quick) var(--ease-out);
}

.navLink:hover::after,
.navLink:focus-visible::after {
  scale: 1 1;
}
```

### D. Quote 工程のアクセント線ドロー(Quote.module.css のみ)

`.step` は Reveal 要素自身(`.reveal` と同居し `data-visible` と `--reveal-delay` を持つ)なので `:global()` は不要。既存の `.step::before` に `transform-origin` と `transition` を追記し、隠し状態を属性セレクタで書く。`--reveal-delay`(0.08s 刻み)を加算して 4 本の線が順に引かれるようにする:

```css
.step::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  width: var(--space-8);
  border-top: 2px solid var(--color-accent);
  transform-origin: left center;
  transition: scale 0.5s var(--ease-draw) calc(var(--reveal-delay, 0s) + 0.2s);
}

.step[data-visible='false']::before {
  scale: 0 1;
}
```

### E. Company 会社概要の罫線スタガードロー(Company.module.css のみ)

上罫線(infoList)→ 8 行の下罫線が上から順に引かれる。**border は transparent 化して box を維持**し、疑似要素 1px 線を重ねる:

- `.infoList`: `border-top: 1px solid var(--color-line);` → `border-top: 1px solid transparent;` に変更し、`position: relative;` を追加
- `.infoRow`: `border-bottom: 1px solid var(--color-line);` → `border-bottom: 1px solid transparent;` に変更し、`position: relative;` を追加

追記する CSS:

```css
.infoList::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-line);
  transform-origin: left center;
  transition: scale 0.5s var(--ease-draw) 0.15s;
}

.infoRow::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-line);
  transform-origin: left center;
  transition: scale 0.5s var(--ease-draw);
}

.infoRow:nth-child(1)::after {
  transition-delay: 0.2s;
}

.infoRow:nth-child(2)::after {
  transition-delay: 0.26s;
}

.infoRow:nth-child(3)::after {
  transition-delay: 0.32s;
}

.infoRow:nth-child(4)::after {
  transition-delay: 0.38s;
}

.infoRow:nth-child(5)::after {
  transition-delay: 0.44s;
}

.infoRow:nth-child(6)::after {
  transition-delay: 0.5s;
}

.infoRow:nth-child(7)::after {
  transition-delay: 0.56s;
}

.infoRow:nth-child(8)::after {
  transition-delay: 0.62s;
}

:global(.reveal[data-visible='false']) .infoList::before,
:global(.reveal[data-visible='false']) .infoRow::after {
  scale: 0 1;
}
```

### F. Equipment 設備表の行スタガー(Equipment.module.css のみ)

部品表に上から行を記入していく手つき。**opacity のみ**でフェードする(`<tr>` への transform は table レイアウトと相性が悪いため禁止)。thead と表の枠線は Reveal 本体のフェードに任せる:

```css
.table tbody tr {
  transition: opacity 0.45s var(--ease-out);
}

.table tbody tr:nth-child(1) {
  transition-delay: 0.15s;
}

.table tbody tr:nth-child(2) {
  transition-delay: 0.22s;
}

.table tbody tr:nth-child(3) {
  transition-delay: 0.29s;
}

.table tbody tr:nth-child(4) {
  transition-delay: 0.36s;
}

.table tbody tr:nth-child(5) {
  transition-delay: 0.43s;
}

.table tbody tr:nth-child(6) {
  transition-delay: 0.5s;
}

:global(.reveal[data-visible='false']) .table tbody tr {
  opacity: 0;
}
```

### G. Services 材質リストの行スタガー(Services.module.css のみ)

```css
.materialRow {
  transition: opacity 0.45s var(--ease-out);
}

.materialRow:nth-child(1) {
  transition-delay: 0.1s;
}

.materialRow:nth-child(2) {
  transition-delay: 0.16s;
}

.materialRow:nth-child(3) {
  transition-delay: 0.22s;
}

.materialRow:nth-child(4) {
  transition-delay: 0.28s;
}

.materialRow:nth-child(5) {
  transition-delay: 0.34s;
}

.materialRow:nth-child(6) {
  transition-delay: 0.4s;
}

:global(.reveal[data-visible='false']) .materialRow {
  opacity: 0;
}
```

(`transition` は既存の `.materialRow` ブロックに追記してよい。点線罫は要素と共にフェードするので疑似要素化は不要)

### H. Works 表題欄の段差フェード(Works.module.css のみ)

PartDrawing の時間軸(外形線 0〜0.9s → 細部 0.3s〜 → ハッチング 0.55s〜 → 寸法 0.75s〜)の**後に**表題欄が記入される:

```css
.specRow {
  transition: opacity 0.45s var(--ease-out);
}

.specRow:nth-child(1) {
  transition-delay: 0.85s;
}

.specRow:nth-child(2) {
  transition-delay: 0.93s;
}

.specRow:nth-child(3) {
  transition-delay: 1.01s;
}

.specRow:nth-child(4) {
  transition-delay: 1.09s;
}

:global(.reveal[data-visible='false']) .specRow {
  opacity: 0;
}
```

(`transition` は既存の `.specRow` ブロックに追記してよい。`.specs` の border-top と `.specRow` の border-bottom は行と共にフェードするので疑似要素化は不要)

### I. MobileDrawer の入場アニメーション(MobileDrawer.module.css のみ)

`open=false` でアンマウントされるため**入場のみ**実装する(退場アニメは対象外 — TSX の変更を伴うため本タスクではやらない)。マウント時に animation が 1 回走る:

```css
@keyframes drawerFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes drawerSlideIn {
  from {
    translate: 100% 0;
  }

  to {
    translate: 0 0;
  }
}

.backdrop {
  animation: drawerFadeIn var(--dur-quick) var(--ease-out) both;
}

.panel {
  animation: drawerSlideIn var(--dur-slide) var(--ease-out) both;
}
```

(`animation` 行は既存の `.backdrop` / `.panel` ブロックへの追記でよい。A項の `.link` の置換も忘れないこと)

### J. CLAUDE.md のモーション規約更新 + SiteFooter テスト

#### CLAUDE.md(45 行目の 1 行のみ変更)

変更前:

```
- モーションは「製図の手つき」に限定: リビール(フェード+12px上昇)/ SVG線画(`pathLength={1}` + stroke-dashoffset)/ 罫線・下線の scaleX ドロー / 検印の押印。時間・イージングは `tokens.css` の `--dur-*` / `--ease-*` を使う。スクロール連動は `useReveal` 経由のみ。reduced-motion では duration と delay の両方が無効化されることを必ず確認
```

変更後:

```
- モーションは「製図の手つき」に限定: リビール(フェード+12px上昇)/ SVG線画(`pathLength={1}` + stroke-dashoffset。ロード時のロゴ線画を含む)/ 罫線・下線の scaleX ドロー / 行の段差フェード(nth-child 遅延)/ 検印の押印。機能的モーション(ドロワー開閉等)は `--dur-slide` を使う。時間・イージングは `tokens.css` の `--dur-*` / `--ease-*` を使う。スクロール連動は `useReveal` 経由のみ。reduced-motion では duration と delay の両方が無効化されることを必ず確認
```

#### src/test/SiteFooter.test.tsx(新規作成)

`src/test/useReveal.test.tsx` と同じ流儀(vitest + @testing-library/react + jest-dom)で 2 ケース:

```tsx
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from '../components/layout/SiteFooter'

describe('SiteFooter', () => {
  it('IntersectionObserver 非対応環境では即座に可視になる', () => {
    const { container } = render(<SiteFooter />)

    const inner = container.querySelector('[data-visible]')
    expect(inner).not.toBeNull()
    expect(inner).toHaveAttribute('data-visible', 'true')
  })

  it('ナビリンク6件と架空企業の注記を表示する', () => {
    render(<SiteFooter />)

    const nav = screen.getByRole('navigation', {
      name: 'フッターナビゲーション',
    })
    expect(within(nav).getAllByRole('link')).toHaveLength(6)
    expect(screen.getByText(/架空企業のコンセプトサイト/)).toBeInTheDocument()
  })
})
```

(jsdom には IntersectionObserver がないため `useReveal` は即 `isVisible=true` を返す。他テストが IO をモックした後でも `afterEach` で削除される設計になっているが、念のためこのテストは IO の存在に依存しない書き方を維持すること)

## Allowed files

以下**のみ**作成・変更してよい。これ以外の変更は一切禁止:

- `src/styles/tokens.css`
- `src/components/layout/SiteHeader.tsx`(LogoMark 関数内のみ)
- `src/components/layout/SiteHeader.module.css`
- `src/components/layout/SiteFooter.tsx`
- `src/components/layout/SiteFooter.module.css`
- `src/components/layout/MobileDrawer.module.css`
- `src/components/layout/SkipLink.module.css`
- `src/features/quote/QuoteForm.module.css`
- `src/components/sections/Quote.module.css`
- `src/components/sections/Company.module.css`
- `src/components/sections/Equipment.module.css`
- `src/components/sections/Services.module.css`
- `src/components/sections/Works.module.css`
- `CLAUDE.md`(45 行目の 1 行のみ)
- `src/test/SiteFooter.test.tsx`(新規)

## Restricted files

- `src/hooks/**`(useReveal / useFocusTrap を含む — 変更禁止)
- `src/components/ui/Reveal.tsx` / `src/components/ui/**`(PartDrawing / SectionHeading / LinkButton 含め ui 配下すべて)
- `src/components/sections/*.tsx`(Hero / Services / Equipment / Quality / Works / Company / Quote — TSX はすべて変更禁止)
- `src/components/layout/MobileDrawer.tsx` / `SkipLink.tsx`
- `src/features/quote/QuoteForm.tsx`
- `src/styles/global.css`
- `src/data/**`
- `package.json` / `package-lock.json` / `vite.config.ts` / `tsconfig*.json` / `.oxlintrc.json` 等の設定ファイル
- `docs/tasks/TASK-001.md`(既存仕様書)
- `index.html` / `public/**`
- **ファイル・ディレクトリの削除は一切禁止**

## Acceptance criteria

1. `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build` がすべて成功する(既存テスト含む)
2. 通常環境(dev または preview)で:
   - ロード時にロゴの十字→円が順に描かれる
   - フッターまでスクロールすると 社名 → ナビ → 注記 の順にリビールし、注記の上罫線が左から引かれる
   - Quote の 4 工程でアクセント線が順に左から伸びる
   - Company の罫線が上から順に引かれる(9 本: 上罫線 + 8 行)
   - Equipment の 6 行・Services の材質 6 行・Works のスペック 4 行が順に現れる(Works は線画の後)
   - モバイル幅でメニューを開くとドロワーが右からスライドし、背景が同時にフェードする
3. **アニメーション完了後の見た目が変更前と完全同一**(罫線位置の 1px ズレなし、フッターの行間・余白不変)
4. reduced-motion 環境では全演出が即最終状態(遅延表示もなし)
5. 360 / 375 / 768 / 1024 / 1440px で横スクロールが出ない
6. Allowed files 外の変更ゼロ、ファイル削除ゼロ

## Required tests

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

(ブラウザでの目視確認はレビュー担当が Playwright で別途実施する。Codex のサンドボックスでは不要)

## Risks

1. **border→疑似要素置換の 1px ズレ**(最重要): border は box サイズに含まれるため、削除すると要素が 1px 縮む。必ず `border-*-color: transparent` で box を維持し、疑似要素は `top: -1px` / `bottom: -1px` で透明 border 上に重ねること
2. nth-child 遅延はデータ行数(Company 8 / Equipment 6 / Services 6 / Works 4)前提。将来行が増えた場合も「遅延なしで即表示」に落ちるだけで壊れない(この安全性を変えない)
3. LogoMark の `strokeLinecap="round"` は `stroke-dashoffset: 1` の状態でもダッシュ起点に点が残ることがある。実装後に気になる場合も linecap は変更せず、そのまま報告すること(レビュー側で目視判断する)
4. CSS Modules で `:global(.reveal[data-visible='false'])` を祖先に置く書き方は PartDrawing.module.css に前例がある。`.step[data-visible='false']` のように**ローカルクラス自身に属性が付く場合は `:global()` 不要**
5. `.inner nav` のような要素セレクタは CSS Modules ではローカルクラスとの複合でのみ許される(単独の `nav {}` はグローバル汚染になるので書かない)
