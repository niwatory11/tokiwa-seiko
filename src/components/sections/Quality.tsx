import { inspectionStamp, qualityItems, qualityLede, sampleReport } from '../../data/quality'
import { useReveal } from '../../hooks/useReveal'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Quality.module.css'

/** 検印スタンプ(サイト内で朱色を使う唯一の意匠)。成績書の行が埋まったあとに押す */
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

/** 検査成績書の記入例: ヒーローの図面の指示寸法を、測定値と判定で受ける */
function SampleReport() {
  return (
    <Reveal delay={0.1} className={styles.reportWrap}>
      <figure className={styles.report}>
        <figcaption className={styles.reportHead}>
          <span className={styles.reportTitle}>{sampleReport.title}</span>
          <span className={styles.reportExample}>{sampleReport.example}</span>
          <span className={styles.reportMeta}>
            <span>{sampleReport.partName}</span>
            <span className={styles.mono}>{sampleReport.drawingNo}</span>
          </span>
        </figcaption>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                {sampleReport.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleReport.rows.map((row) => (
                <tr key={row.no}>
                  <td className={styles.mono}>{row.no}</td>
                  <td>{row.item}</td>
                  <td className={styles.mono}>{row.spec}</td>
                  <td className={`${styles.mono} ${styles.value}`}>{row.value}</td>
                  <td className={styles.result}>{row.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.reportEnv}>{sampleReport.environment}</p>
        <Stamp />
      </figure>
      <p className={styles.reportNote}>{sampleReport.note}</p>
    </Reveal>
  )
}

/**
 * 品質保証: 測って、書いて、渡す。
 * ページで唯一の墨の地。白い成績書が浮かび、行が埋まってから朱の検印が押される。
 */
export function Quality() {
  return (
    <section
      id="quality"
      aria-labelledby="quality-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading
          id="quality-heading"
          no="03"
          title="品質保証"
          lede={qualityLede}
          tone="inverse"
        />

        <div className={styles.layout}>
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

          <SampleReport />
        </div>
      </div>
    </section>
  )
}
