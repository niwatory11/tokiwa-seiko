# TASK-007: MobileDrawer 退場アニメーション「製図の手つき・第四稿B」

## Context

- スタック: Vite + React 19 + TypeScript(strict)+ CSS Modules。アニメーションライブラリなし(新規 npm 依存は**禁止**)
- ドロワー(`src/components/layout/MobileDrawer.tsx`)には**入場**アニメーションのみ実装済み: `.backdrop` = `drawerFadeIn`(`--dur-quick`)、`.panel` = `drawerSlideIn`(`--dur-slide`、右から)。いずれも keyframes + `both`
- 閉じるときは `if (!open) return null` で**即座にアンマウント**され、面が瞬間消滅する。機能的モーション(`--dur-slide`)の規約に沿って、入場と対称の退場(パネルは右へ、幕はフェード)を追加する
- 並列で別タスクが `src/features/quote/QuoteForm.module.css` を変更中。**Allowed files 以外に絶対に触れないこと**

## Objective

- A. `MobileDrawer.tsx`: 内部状態 `presence: 'closed' | 'open' | 'exiting'` を導入し、`open` が false になっても退場アニメーションの間だけ描画を続け、`animationend`(+保険タイマー)でアンマウントする
- B. `MobileDrawer.module.css`: 退場 keyframes(`drawerFadeOut` / `drawerSlideOut`)と `data-exiting` 時の適用ルールを追加
- C. `src/test/MobileDrawer.test.tsx`: 退場フェーズのテストを4件追加(既存4件は**変更不要で通る**ことを確認する)

## Current behavior

- `MobileDrawer.tsx`: 27行目 `if (!open) return null`。`useFocusTrap(panelRef, { active: open, onEscape: onClose })` がフォーカス循環と Escape、解除時のフォーカス返却を担う。スクロールロックは `useEffect([open])`
- `MobileDrawer.module.css`: 先頭に `drawerFadeIn` / `drawerSlideIn`。`.overlay`(fixed, z-60)> `.backdrop` + `.panel` の構造
- `src/test/MobileDrawer.test.tsx`: 4件。閉じた後は `expect(screen.queryByRole('dialog')).not.toBeInTheDocument()` を即時 assert している(※本タスク後は「DOMには残るが aria-hidden で a11y ツリーから即除外」となり、`queryByRole` は null を返すため**既存 assert はそのまま通る**)
- jsdom は CSS アニメーションを実行しないため `animationend` は自然発火しない(テストでは `fireEvent.animationEnd` で明示発火するか、保険タイマーを進める)

## Existing behavior to preserve

- 開くとき: 入場アニメーション・最初のフォーカス移動・Tab循環・Escape・背面スクロールロックのすべてを変えない
- **フォーカス返却は閉じた瞬間に行う**(退場アニメ完了を待たない): `useFocusTrap` の `active` は `open` のまま変更しない。これにより既存テスト「Escape で閉じ、フォーカスがメニューボタンへ戻る」が成立し続ける
- スクロールロック解除も `open=false` の瞬間(退場中はページ操作可能でよい)
- DOM 構造・role・aria-modal・id="site-drawer" を変えない(退場中の属性追加のみ)
- 色・時間・イージングは既存トークンのみ。`--dur-slide`(パネル)と `--dur-quick`(幕)で入場と対称にする
- 新規 npm パッケージ禁止(package.json 変更禁止)

## Detailed implementation requirements

以下の完成形コードをそのまま適用してよい(コメント含む)。

### A. src/components/layout/MobileDrawer.tsx(全体を置き換え)

```tsx
import { useEffect, useRef, useState } from 'react'
import type { AnimationEvent } from 'react'
import { navItems, quoteCta } from '../../data/nav'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import styles from './MobileDrawer.module.css'

type MobileDrawerProps = {
  open: boolean
  onClose: () => void
}

/** 退場の描画状態。open=false でも 'exiting' の間はアンマウントしない */
type Presence = 'closed' | 'open' | 'exiting'

/** animationend が発火しない環境(jsdom等)向けの保険(--dur-slide 0.3s より長く) */
const EXIT_FALLBACK_MS = 400

/** モバイル用ナビゲーションドロワー(フォーカストラップ付き) */
export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [presence, setPresence] = useState<Presence>(open ? 'open' : 'closed')

  // フォーカス返却は退場アニメを待たず、open=false の瞬間に行う(active は presence にしない)
  useFocusTrap(panelRef, { active: open, onEscape: onClose })

  useEffect(() => {
    if (open) {
      setPresence('open')
      return
    }
    // 開いていた場合のみ退場フェーズへ(初回マウント時は closed のまま)
    setPresence((prev) => (prev === 'open' ? 'exiting' : prev))
  }, [open])

  // 保険タイマー: animationend が来なくても確実にアンマウントする
  useEffect(() => {
    if (presence !== 'exiting') return
    const timer = window.setTimeout(() => setPresence('closed'), EXIT_FALLBACK_MS)
    return () => window.clearTimeout(timer)
  }, [presence])

  // 開いている間は背面のスクロールを止める
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (presence === 'closed') return null

  const exiting = presence === 'exiting'

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    // 入場アニメや幕(backdrop)の animationend を拾わないよう、退場中のパネル自身に限定する
    if (exiting && event.target === panelRef.current) setPresence('closed')
  }

  return (
    <div
      className={styles.overlay}
      data-exiting={exiting || undefined}
      aria-hidden={exiting || undefined}
      inert={exiting || undefined}
      onAnimationEnd={handleAnimationEnd}
    >
      <button
        type="button"
        className={styles.backdrop}
        aria-label="メニューを閉じる"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        id="site-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="メニュー"
        className={styles.panel}
      >
        <button type="button" className={styles.close} onClick={onClose}>
          閉じる
        </button>
        <nav aria-label="モバイルナビゲーション">
          <ul className={styles.list}>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.link} onClick={onClose}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={quoteCta.href}
                className={`${styles.link} ${styles.quote}`}
                onClick={onClose}
              >
                {quoteCta.label}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
```

設計意図(変更しないこと):

- **`aria-hidden` + `inert`(React 19 の boolean 属性)**: 退場中の 300ms、消えかけのドロワーへ Tab・クリック・スクリーンリーダーが到達しないようにする。`aria-hidden` により Testing Library の `queryByRole('dialog')` は退場開始と同時に null を返す(=既存テストが変更不要で通る根拠)
- **`event.target === panelRef.current` ガード**: これがないと入場 `drawerSlideIn` の animationend(や幕の `drawerFadeOut` 0.2s)で誤ってアンマウントし、「開いた直後に消える」バグになる
- **再オープン対応**: 退場中に `open=true` が来たら effect が `presence='open'` に戻し、`data-exiting` が外れて即復帰する
- **reduced-motion**: global.css により退場アニメも 0.01ms で完了 → animationend が即発火し、実質即時アンマウント。JS 側での分岐(`usePrefersReducedMotion`)は不要

### B. src/components/layout/MobileDrawer.module.css(末尾に追加)

```css
/* ==========================================================================
   退場: 入場と対称(パネルは右へ、幕はフェード)
   退場 keyframes は例外的に to が隠し状態でよい: 直後に必ずアンマウントし、
   reduced-motion では 0.01ms で完了して即アンマウントされるため
   ========================================================================== */

@keyframes drawerFadeOut {
  to {
    opacity: 0;
  }
}

@keyframes drawerSlideOut {
  to {
    translate: 100% 0;
  }
}

/* 退場中は操作を受け付けない(消えかけの幕・リンクへの誤クリック防止) */
.overlay[data-exiting='true'] {
  pointer-events: none;
}

.overlay[data-exiting='true'] .backdrop {
  animation: drawerFadeOut var(--dur-quick) var(--ease-out) both;
}

.overlay[data-exiting='true'] .panel {
  animation: drawerSlideOut var(--dur-slide) var(--ease-out) both;
}
```

`from` を書かないのは意図的(開始値=その時点の算出スタイル。入場完了状態から自然に戻る)。

### C. src/test/MobileDrawer.test.tsx

既存4テストは**一切変更しない**(aria-hidden により `queryByRole('dialog')` が退場開始と同時に null になるため、既存 assert はそのまま通る)。同ファイルの describe 内に以下4件を追加する。import に `fireEvent` / `act`(@testing-library/react)と `afterEach, vi`(vitest)を追加してよい。

1. **閉じると退場状態になり、アクセシビリティツリーから即座に消える**
   - メニューを開く → 「閉じる」をクリック
   - `screen.queryByRole('dialog')` が null、**かつ** `document.getElementById('site-drawer')` は非 null(DOM にはまだ居る)
   - overlay(`document.getElementById('site-drawer')!.parentElement`)が `data-exiting="true"` と `aria-hidden="true"` を持つ
2. **パネルの animationend で完全にアンマウントされる**
   - 退場状態にした後、`fireEvent.animationEnd(document.getElementById('site-drawer')!)`
   - `document.getElementById('site-drawer')` が null になる
3. **退場中に開き直すと即復帰する**
   - 閉じた直後(退場中)にメニューボタンを再クリック
   - `screen.getByRole('dialog', { name: 'メニュー' })` が取得でき、overlay に `data-exiting` が無い
4. **animationend が来なくても保険タイマーでアンマウントされる**
   - `vi.useFakeTimers()` を使う(このテストのみ。`afterEach` ではなくテスト内 try/finally か、テスト末尾で `vi.useRealTimers()` を確実に呼ぶ)
   - userEvent は fake timers と相性が悪いため、このテストだけ `fireEvent.click` で開閉する
   - 閉じた後 `act(() => { vi.advanceTimersByTime(400) })` → `document.getElementById('site-drawer')` が null

## Allowed files

- `src/components/layout/MobileDrawer.tsx`
- `src/components/layout/MobileDrawer.module.css`
- `src/test/MobileDrawer.test.tsx`

## Restricted files

- 上記以外の**すべて**。特に: `src/hooks/useFocusTrap.ts` / `src/hooks/usePrefersReducedMotion.ts` / `src/components/layout/SiteHeader.*` / `src/features/quote/**`(並列タスクが変更中)/ `src/styles/**` / `src/data/**` / `src/test/setup.ts` / 他の既存テスト / `CLAUDE.md` / `package.json`

## Acceptance criteria

1. 「閉じる」・幕クリック・Escape・ナビリンク選択のいずれでも、パネルが右へスライドアウト(0.3s)+幕がフェードアウト(0.2s)してから消える
2. 退場中はドロワーへの操作(クリック・Tab)が効かず、`aria-hidden` で支援技術からも除外される
3. 閉じた瞬間にフォーカスがメニューボタンへ戻る(退場完了を待たない)
4. 退場中にメニューボタンを押すと即座に開いた状態へ復帰する
5. reduced-motion では実質即時にアンマウントされる(退場で画面に残留しない)
6. 既存4テストが**無変更**で通り、新規4テストも通る(計8件)
7. 検証コマンド(このタスクで実行してよいのは以下**のみ**。`npm run build` / `npm run dev` / 全体 `npm run test` は実行しない — 並列タスクとの干渉回避):
   - `npm run lint`
   - `npx vitest run src/test/MobileDrawer.test.tsx`
   - `npx tsc --noEmit -p tsconfig.app.json`(`tsc -b` は .tsbuildinfo を書くため使わない)
8. Allowed files 以外の変更がゼロ

## Risks

1. **入場 animationend の誤検知**: `exiting` ガードと `event.target === panelRef.current` の両方が必須。どちらか欠けると「開いた直後に消える」
2. **useFocusTrap の active を presence にしない**: `exiting` まで active にするとフォーカス返却が退場後になり、既存テストが落ちる。`active: open` のまま
3. **`inert` の型**: React 19 では `inert?: boolean`。文字列 `inert=""` を渡す旧ハックは使わない
4. **保険タイマーのリーク**: effect cleanup で必ず `clearTimeout`(退場中のアンマウント・再オープンでも安全)
5. **既存テストを書き換えたくなったら設計の誤り**: `queryByRole('dialog')` が退場中に null にならない場合は `aria-hidden` の付与漏れ。テスト側ではなく実装側を直す
6. **退場 keyframes の `to`=隠し状態は本タスク限りの例外**(直後にアンマウントするため安全)。装飾アニメには適用しない
