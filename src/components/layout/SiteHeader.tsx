import { useState } from 'react'
import { navItems, quoteCta } from '../../data/nav'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import { MobileDrawer } from './MobileDrawer'
import styles from './SiteHeader.module.css'

/** 毎レンダーの再購読を避けるためモジュールレベルで固定する */
const sectionIds = navItems.map((item) => item.href.slice(1))

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

/**
 * 固定ヘッダー。B2Bの定石どおり主要CTA(見積もり依頼)を右端に常設する。
 */
export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeId = useScrollSpy(sectionIds)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <a href="#top" className={styles.logo}>
            <LogoMark />
            <span className={styles.logoText}>
              常盤精工
              <span className={styles.logoTagline}>精密切削加工</span>
            </span>
          </a>

          <nav aria-label="メインナビゲーション" className={styles.nav}>
            <ul className={styles.navList}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={styles.navLink}
                    aria-current={
                      activeId !== null && item.href === `#${activeId}` ? 'location' : undefined
                    }
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actions}>
            <a href={quoteCta.href} className={styles.quoteButton}>
              {quoteCta.label}
            </a>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={drawerOpen}
              aria-controls="site-drawer"
              onClick={() => setDrawerOpen(true)}
            >
              <span className={styles.menuIcon} aria-hidden="true" />
              メニュー
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
