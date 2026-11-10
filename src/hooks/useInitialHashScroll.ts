import { useLayoutEffect } from 'react'

/**
 * location.hash が指す要素を探す。
 * ブラウザ本来の順序と同じく、まず hash をそのまま id として探し、
 * 見つからなければパーセントデコードした id で探す。
 * 空の hash・存在しない id・不正なエンコード('#%E0%A4%A' など)は null を返す。
 */
export function findHashTarget(hash: string): HTMLElement | null {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash
  if (fragment === '') return null

  const asIs = document.getElementById(fragment)
  if (asIs) return asIs

  try {
    return document.getElementById(decodeURIComponent(fragment))
  } catch {
    return null
  }
}

/**
 * 再読み込み・「戻る/進む」で、ブラウザが読んでいた位置をすでに復元したか。
 * 復元できているなら、その位置を #id で上書きしない
 * (素の HTML でも、再読み込みでは #id ではなく読んでいた位置に戻る)。
 * 復元されず先頭のままなら false を返し、通常どおり #id へ移動させる。
 */
function hasRestoredScrollPosition(): boolean {
  const entry = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined
  const isHistoryNavigation =
    entry?.type === 'reload' || entry?.type === 'back_forward'

  // scrollY を読むとレイアウトが確定し、ブラウザは保留していた位置の復元をここで行う
  return isHistoryNavigation && window.scrollY > 0
}

/**
 * URL に「#章のid」を付けて開いたとき、その章まで移動する。
 *
 * ブラウザは HTML を読み終えた時点で #id の要素を探すが、このサイトの章は
 * React が後から描くため、その時点ではまだ存在せず、移動が起きない。
 * そこで最初の描画が DOM に入った直後(画面に出る前)に一度だけ、同じ移動を行う。
 *
 * - 位置: 固定ヘッダーぶんの余白は global.css の `[id] { scroll-margin-top }` が受け持つ
 * - 動き: 開いた直後の移動は演出ではないため、`html { scroll-behavior: smooth }` に
 *   かかわらず即座に行う(reduced-motion でも同じ)。ナビをクリックしたときの移動は変えない
 */
export function useInitialHashScroll(): void {
  useLayoutEffect(() => {
    const target = findHashTarget(window.location.hash)
    if (!target || hasRestoredScrollPosition()) return

    target.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])
}
