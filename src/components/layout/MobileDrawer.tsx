import { useEffect, useRef, useState } from 'react'
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

  // 退場中か。effect からも参照するため早期 return より前で求める。
  // 閉じた最初の描画から退場属性を当てる(presence の更新待ちで1フレーム遅れない)
  const exiting = !open && presence !== 'closed'

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

  // 退場アニメーションの完了でアンマウントする。
  // React の onAnimationEnd は使わない: ベンダープレフィックス検出により
  // AnimationEvent 未実装環境(jsdom)では 'webkitAnimationEnd' を購読してしまうため、
  // 素の 'animationend' を直接購読する
  useEffect(() => {
    if (!exiting) return
    const panel = panelRef.current
    if (!panel) return
    // 幕(backdrop)や子要素のアニメーション終了では閉じない
    const handleExitEnd = (event: AnimationEvent) => {
      if (event.target === panel) setPresence('closed')
    }
    panel.addEventListener('animationend', handleExitEnd)
    return () => panel.removeEventListener('animationend', handleExitEnd)
  }, [exiting])

  // 保険タイマー: animationend が来なくても確実にアンマウントする
  useEffect(() => {
    if (!exiting) return
    const timer = window.setTimeout(() => setPresence('closed'), EXIT_FALLBACK_MS)
    return () => window.clearTimeout(timer)
  }, [exiting])

  // 開いている間は背面のスクロールを止める
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // open=true の描画で必ずパネルを DOM へ出す(effect の presence 更新を待つと
  // useFocusTrap が panelRef.current=null を見て初期フォーカス・Escape を張れない)
  if (!open && presence === 'closed') return null

  return (
    <div
      className={styles.overlay}
      data-exiting={exiting || undefined}
      aria-hidden={exiting || undefined}
      inert={exiting || undefined}
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
