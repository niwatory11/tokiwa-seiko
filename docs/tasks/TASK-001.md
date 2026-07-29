# TASK-001: モーションデザイン「製図の手つき」の実装

## Context

架空のB2B精密加工会社「常盤精工」の単体商業サイト(React 19 + Vite + TypeScript + CSS Modules)。
デザインコンセプトは「図面のように、話す」。現状のスクロール演出は
`useReveal`(IntersectionObserver)+ `.reveal`(フェード+12px上昇)のみに制限されている。

本タスクでこの制限を意図的に拡張し、**製図の作業手順をメタファーにしたモーション語彙**を追加する:

1. 外形線を引く(SVG線画アニメーション)
2. ハッチングを載せる(塗りのフェード)
3. 寸法を記入する(寸法線・注記のフェード)
4. 検印を押す(スタンプの押印アニメーション)
5. 定規で線を引く(見出し罫線・ナビ下線の scaleX ドロー)

**新規 npm 依存の追加は禁止**(GSAP等は使わない)。すべて既存の
`useReveal` + CSS transition / animation で実装する。

## Objective

以下の6項目を実装する。

- A. モーショントークンの追加と既存値のトークン化
- B. Hero の入場ステージング(CSSのみ)
- C. SectionHeading の図番罫線ドロー
- D. PartDrawing の線画アニメーション(本タスクの主役)
- E. 検印スタンプの押印アニメーション
- F. ヘッダーナビの下線ドロー
- G. reduced-motion 対策の強化(遅延の無効化)
- H. CLAUDE.md のモーション規約の更新
- I. `useReveal` のユニットテスト追加

## Current behavior

- `src/hooks/useReveal.ts`: IntersectionObserver で可視判定。reduced-motion / IO 非対応環境では即座に可視。**このファイルは変更しない。**
- `src/components/ui/Reveal.tsx`: `.reveal` クラスと `data-visible` 属性を付けた汎用ラッパー。`--reveal-delay` で段差。**このファイルは変更しない。**
- `src/styles/global.css`: `.reveal` は `opacity 0.6s` + `translate 0.6s`。`prefers-reduced-motion: reduce` で全 animation/transition の duration を 0.01ms に強制する包括ルールがある(ただし **delay は無効化されていない** — 本タスクで修正)。
- `src/components/ui/PartDrawing.tsx`: 加工例3種(housing / shaft / bracket)の図面風SVG。線は静的表示。
- `src/components/sections/Quality.tsx`: `Stamp`(検印SVG、朱色)は静的表示。
- `src/components/layout/SiteHeader.module.css`: `.navLink` は `border-bottom: 2px solid transparent` を hover で着色。
- `src/components/sections/Hero.tsx`: 入場アニメーションなし。

## Existing behavior to preserve

- **DOM構造・セマンティクス・アクセシビリティを変えない**(見出しレベル、`aria-*`、`dl/dt/dd` の構造。例外: E項で Stamp の外側に `div` ラッパーを1つ追加することのみ許可)
- `useReveal` / `usePrefersReducedMotion` / `Reveal.tsx` の実装・シグネチャは変更しない
- 各要素の**最終静止状態**(アニメーション完了後の見た目)は現状と完全に同一にする。例外: F項のナビ下線は「border-bottom の着色」から「::after の scaleX ドロー」に置き換わる(最終状態の見た目は同等: リンク下に2pxのアクセント色の線)
- 配色ルール: 朱色は検印とエラーのみ。色値の直書き禁止(tokens.css のカスタムプロパティを使う)
- 角丸なし(`--radius: 0`)
- レスポンシブ: 360 / 375 / 768 / 1024 / 1440px で横スクロールを出さない
- reduced-motion 環境ではすべての動きが実質即座に完了し、**コンテンツが遅延なく表示される**こと
- 新規 npm パッケージを追加しない(package.json / package-lock.json は変更禁止)
- 既存テスト(`src/test/*.test.*`)をすべてパスさせる

## Detailed implementation requirements

### A. モーショントークン(`src/styles/tokens.css`)

`:root` の「--- その他 ---」ブロックに追加:

```css
--dur-quick: 0.2s; /* マイクロインタラクション(hover等) */
--dur-reveal: 0.6s; /* リビール(フェード+上昇) */
--dur-draw: 0.9s; /* 線描画 */
--ease-draw: cubic-bezier(0.65, 0, 0.35, 1); /* 定規で線を引く手つき */
```

あわせて既存のハードコードされた duration をトークンに置き換える(挙動は不変):

- `src/styles/global.css` の `.reveal` の `0.6s` → `var(--dur-reveal)`
- `src/components/ui/LinkButton.module.css` の `0.2s`(3箇所) → `var(--dur-quick)`
- `src/components/layout/SiteHeader.module.css` の `.navLink` / `.quoteButton` の `0.2s` → `var(--dur-quick)`

### B. Hero 入場ステージング(`src/components/sections/Hero.module.css` のみ。Hero.tsx は変更しない)

ページ読込時に、製図の記入順で要素が現れる。CSS keyframes のみで実装する:

```css
@keyframes heroRise {
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

以下の既存クラスに `animation: heroRise var(--dur-reveal) var(--ease-out) both;` を付与し、
`animation-delay` で段差を付ける:

| クラス | delay |
| --- | --- |
| `.eyebrow` | 0s |
| `.heading` | 0.08s |
| `.subcopy` | 0.16s |
| `.ctas` | 0.24s |
| `.titleBlock` | 0.32s |
| `.fact:nth-child(1)〜(4)` | 0.44s / 0.50s / 0.56s / 0.62s |

`.fact` は4要素想定。`nth-child(n+5)` が現れた場合に無指定で埋もれないよう、`.fact` 自体に基準の delay(0.44s)を置き、nth-child で上書きする形にする。

### C. SectionHeading の図番罫線ドロー(`src/components/ui/SectionHeading.module.css`)

`.no::after`(図番の横の罫線)を、リビール時に左から引く:

- `.no::after` に `transform-origin: left center;` と
  `transition: scale 0.5s var(--ease-draw) 0.2s;` を追加
- `.wrap[data-visible='false'] .no::after { scale: 0 1; }` を追加
  (デフォルト状態は「引き終わった線」= scale 指定なし。**未リビール時だけ** 0 にする安全側の書き方)

`.wrap` は `Reveal` のルート要素なので `data-visible` 属性を常に持つ。SectionHeading.tsx は変更しない。

### D. PartDrawing 線画アニメーション(`src/components/ui/PartDrawing.tsx` + `PartDrawing.module.css`)

Works セクションのカード(`Reveal` ラッパー、`article.reveal[data-visible]`)がリビールした時、
図面が「描かれていく」。3段階の時間構成:

1. **外形線が引かれる**(stroke-dashoffset ドロー、即時開始)
2. **内形・細部が引かれる**(同ドロー、0.3s 遅れ)
3. **ハッチングと寸法が記入される**(opacity / fill-opacity フェード、0.55s〜0.75s 遅れ)

#### TSX 側: クラス付与ルール(機械的に適用すること)

各 SVG 図形要素を次の**決定的ルール**で分類し、className と `pathLength={1}` を付与する:

- **`styles.draw`**(外形線): `stroke="var(--c-sumi)"` かつ `strokeWidth="2"` の図形要素
  (`rect` / `circle` / `path`)。`pathLength={1}` を付ける。
  該当: Housing の正面図 rect・中央 circle・側面図 rect(ハッチング付き rect 含む)、
  Shaft の外形 path、Bracket の L字 path。
- **`styles.drawLate`**(内形・細部): `stroke="var(--c-sumi)"` かつ strokeWidth が 2 未満
  (1.5 / 1)の図形要素。`pathLength={1}` を付ける。
  該当: Housing の四隅の取付穴 circle ×4・側面図の内側 rect、Shaft の段の境界線 line ×2、
  Bracket の肉抜き穴 circle・長穴 rect。
  ※ 親の `<g>` に stroke 指定がある場合、className と pathLength は**子要素それぞれ**に付ける
  (`<g>` 自体は変更しない)。
- **`styles.hatch`**(ハッチングの塗り): Housing の側面図 rect(`fill="url(#hatch-housing)"`)に
  `styles.draw` と**併記**する(`className={`${styles.draw} ${styles.hatch}`}`)。
- **`styles.fade`**(中心線・寸法・注記): 上記以外のすべての描画要素。すなわち
  `stroke-dasharray` 付きの中心線、marker 付きの寸法線、寸法補助線・引出線
  (`var(--c-usuzumi)` / `var(--c-tokiwa)` の細線)、およびすべての `text` 要素。
  text には既存の `styles.dimText` 等と併記する。`pathLength` は不要。
  ※ `<g>` でまとまっている寸法補助線・中心線グループは、`<g>` に `styles.fade` を
  付けてよい(opacity は継承されるため)。
- **変更しないもの**: `<defs>` / `<marker>` / `<pattern>` の内部、ルート `<svg>` の構造。

#### CSS 側(`PartDrawing.module.css` に追加)

```css
.draw,
.drawLate {
  stroke-dasharray: 1;
  transition: stroke-dashoffset var(--dur-draw) var(--ease-draw);
}

.drawLate {
  transition-delay: 0.3s;
}

.hatch {
  transition:
    stroke-dashoffset var(--dur-draw) var(--ease-draw),
    fill-opacity 0.45s var(--ease-out) 0.55s;
}

.fade {
  transition: opacity 0.45s var(--ease-out) 0.75s;
}

/* 未リビール時のみ「まだ描かれていない」状態にする(安全側の書き方) */
:global(.reveal[data-visible='false']) .draw,
:global(.reveal[data-visible='false']) .drawLate {
  stroke-dashoffset: 1;
}

:global(.reveal[data-visible='false']) .hatch {
  fill-opacity: 0;
}

:global(.reveal[data-visible='false']) .fade {
  opacity: 0;
}
```

`pathLength={1}` により全要素のパス長が 1 に正規化されるため、`stroke-dasharray: 1` +
`stroke-dashoffset: 1` が「未描画」、`stroke-dashoffset: 0`(初期値)が「描画済み」になる。
`.reveal` の外で PartDrawing が使われた場合は常に描画済みで表示される(安全)。

### E. 検印スタンプの押印(`src/components/sections/Quality.tsx` + `Quality.module.css`)

`Stamp` コンポーネントを次のように変更する(唯一の DOM 変更許可箇所):

```tsx
function Stamp() {
  const { ref, isVisible } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} data-visible={isVisible} className={styles.stampWrap}>
      <svg viewBox="0 0 80 80" className={styles.stamp} aria-hidden="true">
        {/* 既存の circle / text をそのまま維持 */}
      </svg>
    </div>
  )
}
```

`useReveal` は `src/hooks/useReveal.ts` から import する(`Quality.tsx` には既に `Reveal` の
import があるが、Stamp では `Reveal` ではなく `useReveal` を直接使う。`.reveal` の
フェード+上昇と押印演出が二重にかかるのを避けるため)。

CSS(`Quality.module.css`):

```css
@keyframes stampPress {
  0% {
    opacity: 0;
    scale: 1.5;
  }
  55% {
    opacity: 1;
    scale: 0.95;
  }
  100% {
    opacity: 1;
    scale: 1;
  }
}

.stampWrap[data-visible='false'] .stamp {
  opacity: 0;
}

.stampWrap[data-visible='true'] .stamp {
  animation: stampPress 0.4s var(--ease-out) 0.3s both;
}
```

既存の `.stamp` のレイアウト指定(サイズ・配置)は維持する。`.stampWrap` には
レイアウトへ影響を与えない範囲で必要なら `display: contents` ではなく通常の div として
既存レイアウト(`.headRow` 内での配置)を壊さないスタイルを与える(必要に応じて既存の
`.stamp` の配置指定を `.stampWrap` へ移してよい。最終見た目は現状維持)。

### F. ヘッダーナビの下線ドロー(`src/components/layout/SiteHeader.module.css`)

`.navLink` の `border-bottom` 方式を `::after` の scaleX ドローに置き換える:

- `.navLink` から `border-bottom: 2px solid transparent;` と transition 内の
  `border-color` を削除し、`position: relative;` を追加(`color` の transition は残す)
- 追加:

```css
.navLink::after {
  content: '';
  position: absolute;
  inset: auto var(--space-3) 8px;
  height: 2px;
  background: var(--color-accent);
  scale: 0 1;
  transform-origin: left center;
  transition: scale var(--dur-quick) var(--ease-out);
}

.navLink:hover::after {
  scale: 1 1;
}
```

- `.navLink:hover` の `color` 変更は現状維持。

### G. reduced-motion 強化(`src/styles/global.css`)

既存の包括ルールは duration のみ 0.01ms にしており、**delay が残るとコンテンツが
遅延表示されてしまう**(特に B の Hero ステージングと D/E の遅延)。包括ルールに追加:

```css
animation-delay: 0s !important;
transition-delay: 0s !important;
```

(既存の `animation-duration` / `transition-duration` / `animation-iteration-count` の
指定はそのまま維持)

### H. CLAUDE.md のモーション規約更新

「実装規約」セクションの次の1行:

```
- スクロール演出は `useReveal` + `.reveal` の「フェード+12px上昇」のみ。reduced-motion での無効化を必ず確認
```

を次に置き換える:

```
- モーションは「製図の手つき」に限定: リビール(フェード+12px上昇)/ SVG線画(`pathLength={1}` + stroke-dashoffset)/ 罫線・下線の scaleX ドロー / 検印の押印。時間・イージングは `tokens.css` の `--dur-*` / `--ease-*` を使う。スクロール連動は `useReveal` 経由のみ。reduced-motion では duration と delay の両方が無効化されることを必ず確認
```

他の行は一切変更しない。

### I. `useReveal` のユニットテスト(新規 `src/test/useReveal.test.tsx`)

`@testing-library/react` の `render` を使い、`useReveal` を呼ぶ小さなテスト用
コンポーネント(`<div ref={ref} data-visible={String(isVisible)} />` 相当)で検証する:

1. **IntersectionObserver 非対応環境(jsdom デフォルト)では即座に可視になる**
   — render 後、`data-visible="true"` になること。
2. **reduced-motion 環境では即座に可視になる**
   — `window.matchMedia` を `matches: true` を返すスタブに差し替えて render し、
   `data-visible="true"` になること(テスト後は元に戻す)。
3. **IntersectionObserver がある環境では、交差するまで不可視**
   — コールバックを捕捉するモック IO クラスを `globalThis.IntersectionObserver` に設定し、
   render 直後は `data-visible="false"`、`act()` 内でコールバックに
   `[{ isIntersecting: true, target: el }]` を渡すと `"true"` になること。
   `once: true`(既定)で `unobserve` が呼ばれることも検証する。テスト後は必ず
   `globalThis.IntersectionObserver` を削除して他テストへ影響させない。

既存の `src/test/setup.ts` は変更しない。

## Allowed files

Codex が作成・変更してよいファイル(これ以外は変更禁止):

- `src/styles/tokens.css`
- `src/styles/global.css`
- `src/components/sections/Hero.module.css`
- `src/components/ui/SectionHeading.module.css`
- `src/components/ui/PartDrawing.tsx`
- `src/components/ui/PartDrawing.module.css`
- `src/components/ui/LinkButton.module.css`
- `src/components/layout/SiteHeader.module.css`
- `src/components/sections/Quality.tsx`
- `src/components/sections/Quality.module.css`
- `src/test/useReveal.test.tsx`(新規)
- `CLAUDE.md`(H項の1行のみ)

## Restricted files

- `src/hooks/**`(useReveal / usePrefersReducedMotion / useFocusTrap — 変更禁止)
- `src/components/ui/Reveal.tsx`
- `src/components/sections/Hero.tsx`(B項はCSSのみで実現する)
- `src/data/**`、`src/features/**`、`src/test/setup.ts`、既存テストファイル
- `package.json` / `package-lock.json` / 設定ファイル類(vite / tsconfig / oxlint)
- `index.html`、`README.md`、`docs/**`(本仕様書含む)
- ファイル・ディレクトリの削除は一切禁止

## Acceptance criteria

1. `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build` がすべて成功する
2. 通常環境(モーション有効)で:
   - 初回表示時、Hero の要素が指定順に段差で立ち上がる
   - スクロールで Works カードが現れると、図面の線 → 細部 → ハッチング・寸法の順に描かれる
   - 品質保証セクションで検印が「押される」
   - セクション見出しの図番罫線が左から引かれる
   - デスクトップ幅(1024px以上)でナビリンク hover 時に下線が左から伸びる
3. reduced-motion 環境で: すべてのコンテンツが**遅延なく最終状態で**表示される(Hero が
   0.6秒待たされる等がないこと。G項の delay 無効化で保証)
4. アニメーション完了後の見た目が、変更前のサイトと視覚的に同一(F項の下線を除く)
5. `data-visible` を持たない文脈(仮に PartDrawing を単独で使った場合)でも図面が
   欠けずに表示される(D項の「安全側の書き方」による)
6. 色値の直書きなし・新規依存なし・DOM構造の変更は E項のラッパー div 1つのみ

## Required tests

実行コマンド(すべて リポジトリルートで実行):

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

- `npm run test` には新規の `src/test/useReveal.test.tsx`(I項の3ケース)が含まれ、
  既存テスト(App / MobileDrawer / QuoteForm / validation)もすべてパスすること。

## Risks

- **閉じたパスのダッシュ起点の切れ目**: `stroke-dasharray: 1` を残すと、閉図形の
  始点にヘアライン状の切れ目が見える場合がある。`stroke-linecap` は指定せず、
  描画済み状態(`stroke-dashoffset: 0`)ではダッシュ1周期がパス全長と一致するため
  実用上は視認されない想定。目視確認で問題があれば報告すること(修正はレビュー側で判断)。
- **`pathLength` の対応範囲**: SVG2 のジオメトリ要素(`rect` / `circle` / `line` / `path`)は
  モダンブラウザで対応済み。jsdom はレンダリングしないためテストには影響しない。
- **CSS Modules の `:global()`**: D項の `.reveal` 祖先セレクタに必須。クラス名の
  ハッシュ化対象から `.reveal` を外すために必ず `:global(...)` を使うこと。
- **`.fact` の nth-child 依存**: facts データが5件以上になった場合、5件目以降は
  基準 delay(0.44s)で一斉に現れる(B項の安全側設計)。
- **Stamp のラッパー div**: `.headRow` のレイアウト(flex 配置)に影響しないよう、
  変更後に 360〜1440px の各幅で崩れがないか確認すること。
