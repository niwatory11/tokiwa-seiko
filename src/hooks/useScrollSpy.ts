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
