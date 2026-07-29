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
        <div className={styles.brand}>
          <p className={styles.name}>{companyInfo.name}</p>
          <p className={styles.tagline}>精密切削加工 — 試作1個から量産まで</p>
        </div>

        <nav aria-label="フッターナビゲーション">
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.navLink}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#quote" className={styles.navLink}>
                見積もり依頼
              </a>
            </li>
          </ul>
        </nav>

        <p className={styles.concept}>
          本サイトは、フロントエンド制作実績のために作成した架空企業のコンセプトサイトです(Concept
          Project)。「常盤精工株式会社」は実在せず、掲載している住所・電話番号・設備・加工例はすべて架空の設定です。フォームから送信された内容は保存・送信されません。
        </p>
      </div>
    </footer>
  )
}
