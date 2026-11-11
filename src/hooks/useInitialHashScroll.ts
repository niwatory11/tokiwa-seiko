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
 * 再読み込み・「戻る/進む」で開いたか。
 * このときはブラウザが読んでいた位置を復元するので、#id では動かさない
 * (素の HTML でも、再読み込みでは #id ではなく読んでいた位置に戻る)。
 *
 * 先頭で読んでいたなら、戻る先も先頭になる。ブラウザは load が済むまで
 * 覚えている位置を当て直すため、ここで #id へ動かしても load の時点で先頭へ戻され、
 * 章が一瞬見えて跳ぶだけになる。位置が 0 でも「復元されなかった」とは扱わない。
 * (復元が確実に働くのは、main.tsx が最初の描画を load より前に終えているため)
 */
function isPositionRestoredByBrowser(): boolean {
  const entry = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined
  const isHistoryNavigation =
    entry?.type === 'reload' || entry?.type === 'back_forward'
  if (!isHistoryNavigation) return false

  // scrollY を読むとレイアウトが確定し、ブラウザは保留していた位置の復元をここで行う。
  // 復元を先に済ませておけば、ブラウザ自身が #id へ(なめらかに)動かすこともない
  void window.scrollY
  return true
}

/**
 * URL に「#章のid」を付けて開いたとき、その章まで移動する。
 *
 * 章は React が描くので、最初の描画が DOM に入った直後(画面に出る前)に一度だけ移動する。
 * main.tsx が最初の描画を同期で終えるため、ブラウザ自身も HTML を読み終えた時点で
 * #id の章を見つけて動かすが、そちらは `html { scroll-behavior: smooth }` に従って
 * 先頭からなめらかに流れる。先にここで章へ着いておくので、その動きは起きない。
 *
 * - 位置: 固定ヘッダーぶんの余白は global.css の `[id] { scroll-margin-top }` が受け持つ
 * - 動き: 開いた直後の移動は演出ではないため、`html { scroll-behavior: smooth }` に
 *   かかわらず即座に行う(reduced-motion でも同じ)。ナビをクリックしたときの移動は変えない
 */
export function useInitialHashScroll(): void {
  useLayoutEffect(() => {
    const target = findHashTarget(window.location.hash)
    if (!target || isPositionRestoredByBrowser()) return

    target.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [])
}
