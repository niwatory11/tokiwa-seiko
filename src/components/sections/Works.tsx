import type { Work } from '../../data/works'
import { works, worksNote } from '../../data/works'
import { PartDrawing } from '../ui/PartDrawing'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Works.module.css'

const specFields = [
  ['材質', 'material'],
  ['加工', 'process'],
  ['公差', 'tolerance'],
  ['ロット', 'lot'],
] as const

function WorkCard({
  work,
  featured = false,
  delay = 0,
}: {
  work: Work
  featured?: boolean
  delay?: number
}) {
  return (
    <Reveal
      as="article"
      delay={delay}
      className={featured ? `${styles.card} ${styles.cardFeatured}` : styles.card}
    >
      <div className={styles.artWrap}>
        <PartDrawing variant={work.id} label={work.artAlt} />
      </div>
      <div>
        <p className={styles.drawingNo}>{work.drawingNo}</p>
        <h3 className={styles.name}>{work.name}</h3>
        <dl className={styles.specs}>
          {specFields.map(([label, key]) => (
            <div key={key} className={styles.specRow}>
              <dt className={styles.specLabel}>{label}</dt>
              <dd className={styles.specValue}>{work[key]}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.desc}>{work.body}</p>
      </div>
    </Reveal>
  )
}

/** 加工例: 写真の代わりに「図面」で語る(架空事例であることを明記) */
export function Works() {
  const [featured, ...rest] = works
  return (
    <section
      id="works"
      aria-labelledby="works-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading
          id="works-heading"
          no="04"
          title="加工例"
          lede="当社の仕事は図面で語るのがいちばん正確です。代表的な加工例を、図面の様式でご紹介します。"
        />

        <div className={styles.grid}>
          <WorkCard work={featured} featured />
          {rest.map((work, index) => (
            <WorkCard key={work.id} work={work} delay={index * 0.1} />
          ))}
        </div>

        <p className={styles.note}>{worksNote}</p>
      </div>
    </section>
  )
}
