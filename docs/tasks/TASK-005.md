# TASK-005: スクロール連動ナビ(scroll-spy)「製図の手つき・第三稿C」

## Context

- スタック: Vite + React 19 + TypeScript + CSS Modules。アニメーションライブラリなし(新規 npm 依存は**禁止**)
- 1ページ SPA(App.tsx: SkipLink → SiteHeader → main 7セクション → SiteFooter)。ナビはハッシュ内リンク(`src/data/nav.ts` の navItems 5件: #services 対応加工 / #equipment 設備 / #quality 品質保証 / #works 加工例 / #company 会社概要)
- ヘッダーは `position: fixed`(高さ `--header-h: 4rem`)。ナビリンクには hover 下線ドロー(`.navLink::after` scale 0→1)が既存
- 現在、**閲覧中セクションの表示(scroll-spy)が存在しない**。図面の「現在参照している欄」を示す手つきとして、閲覧中セクションのリンクに下線+濃常盤色を常時表示する
- 並列で別タスクが `src/components/sections/*.module.css` を変更中。**Allowed files 以外に絶対に触れないこと**

## Objective

- A. 新規フック `useScrollSpy`: IntersectionObserver で閲覧中セクション id を返す(src/hooks/useScrollSpy.ts)
- B. SiteHeader: アクティブなナビリンクに `aria-current="location"` を付与(SiteHeader.tsx)
- C. CSS: アクティブリンクの下線常時表示+濃常盤色。あわせて同ファイル内の細部 hover を補完(`.navLink:focus-visible` 下線 / `.menuButton:hover` / ロゴ hover)(SiteHeader.module.css)
- D. 新規テスト `src/test/useScrollSpy.test.tsx`(フック単体+SiteHeader 統合)

## Current behavior

- `src/hooks/` には useReveal / usePrefersReducedMotion / useFocusTrap のみ。useReveal は「IO 非対応・reduced-motion では即 `isVisible=true`」のガードを持つ
- `SiteHeader.tsx`: `navItems.map` で `<a href={item.href} className={styles.navLink}>` を出力。アクティブ表示なし
- `SiteHeader.module.css`: `.navLink::after`(下線、`scale: 0 1`、`transform-origin: left center`、`transition: scale var(--dur-quick) var(--ease-out)`)は `:hover` でのみ `scale: 1 1`。`:focus-visible` では出ない(フッターは TASK-002 で focus-visible 対応済みなので不統一)。`.menuButton` は `:active { scale: 0.97 }` のみで hover なし。`.logoMark`(SVG、`color: var(--color-accent)`)も hover なし
- テスト: `src/test/` に6ファイル19件。`useReveal.test.tsx` に IO モックの確立された流儀がある(callback 捕捉 + `afterEach` で `Reflect.deleteProperty(globalThis, 'IntersectionObserver')`)。`setup.ts` が jsdom に matchMedia スタブ(`matches: false`)を提供済み。**jsdom に IntersectionObserver は無い**

## Existing behavior to preserve

- DOM 構造・セマンティクスを変えない(変更は `<a>` への `aria-current` 条件付与のみ)
- ロゴ線画(`.logoCircle` / `.logoCross` の keyframes)・既存 hover 下線・quoteButton の挙動を変えない
- **reduced-motion でも scroll-spy は動作を維持する**(装飾ではなく機能的表示のため。`usePrefersReducedMotion` を参照しない — useReveal との意図的な違いとしてフックのコメントに明記する)。下線遷移の即時化は global.css の包括ルールに任せる
- IO 非対応環境(jsdom 等)では**常に null**(スパイ無効の安全側)。既存テスト(App.test.tsx 等)が `aria-current` なしで通る前提を崩さない
- ヘッダーへのスクロール時 shadow・背景変化は**追加しない**(常設の border-bottom 罫線があり、影は図面の意匠に反する)
- 色は既存トークンのみ。新規 npm パッケージ禁止(package.json 変更禁止)

## Detailed implementation requirements

以下の完成形コードをそのまま適用してよい(コメントも含めて)。

### A. src/hooks/useScrollSpy.ts(新規)

```ts
import { useEffect, useState } from 'react'

type UseScrollSpyOptions = {
  /** 交差判定の帯。既定はビューポート中央の10%帯(fixedヘッダー高に依存しない) */
  rootMargin?: string
}

/**
 * ページ内セクションのうち、いま読まれているものの id を返す。
 * どのセクションも帯に交差していなければ null(Hero・フッター閲覧中など)。
 * IntersectionObserver 非対応環境(jsdom等)では常に null。
 * reduced-motion でも動作を維持する(機能的表示のため。useReveal とは意図的に異なる)。
 */
export function useScrollSpy(
  sectionIds: readonly string[],
  { rootMargin = '-45% 0px -45% 0px' }: UseScrollSpyOptions = {},
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null)
  const idsKey = sectionIds.join(',')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const ids = idsKey.split(',').filter(Boolean)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return

    // 離脱と進入が別コールバックで届いても揺れないよう、交差状態を保持して全体を再計算する
    const intersecting = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          intersecting.set(entry.target.id, entry.isIntersecting)
        }
        // 境界通過中の二重交差は文書順で後のセクションを優先する
        let next: string | null = null
        for (const id of ids) {
          if (intersecting.get(id)) next = id
        }
        setActiveId(next)
      },
      { rootMargin, threshold: 0 },
    )
    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [idsKey, rootMargin])

  return activeId
}
```

設計意図(変更しないこと):
- **rootMargin `'-45% 0px -45% 0px'`** = ビューポート中央の10%帯で判定。fixed ヘッダー高(64px)の補正が不要で、`scroll-margin-top` によるアンカー着地位置とも整合する
- `idsKey = join(',')` を effect 依存にすることで、呼び出し側が毎レンダー新しい配列を渡しても再購読ループしない

### B. src/components/layout/SiteHeader.tsx(変更3箇所のみ)

1. import 追加: `import { useScrollSpy } from '../../hooks/useScrollSpy'`
2. モジュールレベル定数(コンポーネント外): `const sectionIds = navItems.map((item) => item.href.slice(1))`
3. `SiteHeader` 内で `const activeId = useScrollSpy(sectionIds)` を呼び、navItems.map 内の `<a>` を:

```tsx
<a
  href={item.href}
  className={styles.navLink}
  aria-current={activeId !== null && item.href === `#${activeId}` ? 'location' : undefined}
>
  {item.label}
</a>
```

`aria-current="location"` を使う(`page` は「複数ページ集合の現在ページ」用で1ページ SPA の節には不適。`true` より `location` が正確)。付与されるのは常に高々1リンク。

### C. src/components/layout/SiteHeader.module.css(追記)

`.navLink:hover::after` ブロックの直後に追加:

```css
/* scroll-spy: 現在地の下線は hover 下線と同じ ::after を常時表示する(図面の「参照中の欄」) */
.navLink:focus-visible::after,
.navLink[aria-current='location']::after {
  scale: 1 1;
}

.navLink[aria-current='location'] {
  color: var(--color-accent-strong);
}
```

`.logoMark` の既存ブロックに transition を追記し、hover を新設:

```css
.logoMark {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--color-accent);
  flex: none;
  transition: color var(--dur-quick) var(--ease-out);
}

.logo:hover .logoMark,
.logo:focus-visible .logoMark {
  color: var(--color-accent-strong);
}
```

`.menuButton` の既存ブロックに transition を追記し、hover を新設(`:active` は変更しない):

```css
.menuButton {
  /* 既存宣言はそのまま */
  transition:
    border-color var(--dur-quick) var(--ease-out),
    color var(--dur-quick) var(--ease-out);
}

.menuButton:hover {
  border-color: var(--color-accent);
  color: var(--color-accent-strong);
}
```

### D. src/test/useScrollSpy.test.tsx(新規)

`useReveal.test.tsx` の流儀(IO モック callback 捕捉、`afterEach` で `Reflect.deleteProperty(globalThis, 'IntersectionObserver')`、`act()` でコールバック発火)に従う。probe はテスト JSX 内に `<div id="services" />` 等を同時レンダーして `document.getElementById` を成立させる。

必須ケース:

1. **IO 非対応環境では null を返す**(フック単体)
2. **交差エントリで activeId が切り替わる**: services 交差 → `'services'`、バッチ [services false, equipment true] → `'equipment'`
3. **どのセクションも交差していなければ null に戻る**
4. **複数同時交差は文書順で後を優先**(services と equipment が両方 true → `'equipment'`)
5. **unmount で disconnect が呼ばれる**
6. **SiteHeader 統合**: 5セクション分の空 div(id 付き)+ `<SiteHeader />` をレンダー → IO コールバックで services を交差させる → `screen.getByRole('link', { name: '対応加工' })` が `aria-current="location"` を持ち、他のナビリンクは `aria-current` を持たないことを assert

## Allowed files

- `src/hooks/useScrollSpy.ts`(新規)
- `src/components/layout/SiteHeader.tsx`
- `src/components/layout/SiteHeader.module.css`
- `src/test/useScrollSpy.test.tsx`(新規)

## Restricted files

- 上記以外の**すべて**。特に: `src/hooks/useReveal.ts` / `src/hooks/usePrefersReducedMotion.ts` / `src/data/nav.ts` / `src/components/sections/**`(並列タスクが変更中)/ `src/styles/**` / `src/test/setup.ts` / 既存テストファイル / `CLAUDE.md` / `package.json` / `vite.config.ts`

## Acceptance criteria

1. スクロールすると閲覧中セクションのナビリンクに下線+濃常盤色が付く。Hero・#quote・フッター閲覧中は全リンク非アクティブ
2. `aria-current="location"` が付くのは常に高々1リンク
3. ナビリンクを Tab で辿ると focus-visible でも下線が出る(フッターとの平仄)
4. `.menuButton` / ロゴに hover で色変化(`--dur-quick`)
5. アンカークリックでのジャンプ後、着地セクションのリンクがアクティブになる
6. reduced-motion でも aria-current の機能は維持される(遷移だけ即時)
7. 検証コマンド(このタスクで実行してよいのは以下**のみ**。`npm run build` / `npm run dev` / 全体 `npm run test` は実行しない — 並列タスクとの干渉回避):
   - `npm run lint`
   - `npx vitest run src/test/useScrollSpy.test.tsx`
   - `npx tsc --noEmit -p tsconfig.app.json`(`tsc -b` は .tsbuildinfo を書くため使わない)
8. Allowed files 以外の変更がゼロ

## Required tests

上記 D 項の6ケース。既存テスト(App.test.tsx / MobileDrawer.test.tsx 等)は jsdom に IO が無いため `aria-current` なしのまま通る(=変更不要)ことが前提。もし既存テストへの変更が必要になった場合は設計の誤りなので、変更せずに報告すること。

## Risks

1. **rootMargin の % はビューポート基準**。`0px` 系に変えると fixed ヘッダー下に隠れた領域まで「見えている」扱いになり誤判定する。既定値を変えない
2. **IO コールバックのバッチ分割**: 離脱(false)と進入(true)が別コールバックで届き得る。Map 保持+全体再計算方式を崩すと null フリッカーが起きる
3. **aria-current の値**: `'location'` 固定。`'true'` / `'page'` にしない
4. **配列 identity**: `sectionIds` をコンポーネント内で生成すると毎レンダー再購読になりかねない。モジュールレベル定数+`idsKey` の二重の安全策を守る
5. **既存テストの破壊**: setup.ts や既存テストに IO のグローバルスタブを足すと useReveal のテスト前提が崩れる。IO モックは新規テストファイル内に閉じる
