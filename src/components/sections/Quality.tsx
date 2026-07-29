import { inspectionStamp, qualityItems } from '../../data/quality'
import { useReveal } from '../../hooks/useReveal'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Quality.module.css'

/** 検印スタンプ(サイト内で朱色を使う唯一の意匠) */
function Stamp() {
  const { ref, isVisible } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} data-visible={isVisible} className={styles.stampWrap}>
      <svg viewBox="0 0 80 80" className={styles.stamp} aria-hidden="true">
        <circle cx="40" cy="40" r="36" fill="none" stroke="var(--c-shu)" strokeWidth="3" />
        <text
          x="40"
          y="54"
          textAnchor="middle"
          fontSize="40"
          fontWeight="700"
          fill="var(--c-shu)"
        >
          {inspectionStamp.label}
        </text>
      </svg>
    </div>
  )
}

/** 品質保証: 測って、書いて、渡す */
export function Quality() {
  return (
    <section
      id="quality"
      aria-labelledby="quality-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <div className={styles.headRow}>
          <SectionHeading
            id="quality-heading"
            no="03"
            title="品質保証"
            lede="「削れました」ではなく「測りました」で納品します。精度は主張ではなく、測定値で渡すものだと考えています。"
          />
          <Stamp />
        </div>

        <ul className={styles.list}>
          {qualityItems.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 0.08}
              className={styles.item}
            >
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemBody}>{item.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
