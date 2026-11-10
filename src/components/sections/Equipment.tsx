import {
  envelopeCopy,
  envelopes,
  equipmentList,
  equipmentNote,
  equipmentTableTitle,
} from '../../data/equipment'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Equipment.module.css'

/** 桁区切り付きの寸法値(ロケールに依存させない) */
const formatMm = (value: number) => value.toLocaleString('en-US')

/**
 * 加工範囲の比較図: 四台の加工機に載る大きさを、同じ縮尺で正面から描く。
 * 各図の幅は「いちばん広い機械の幅に対する割合」で決めるので、列幅が変わっても縮尺は揃う。
 * 図は装飾で、寸法は下の文字が持つ。
 */
function EnvelopeChart() {
  const widest = Math.max(...envelopes.map((item) => item.width))
  const tallest = Math.max(...envelopes.map((item) => item.height))
  const { reference } = envelopeCopy

  return (
    <figure className={styles.envelopes}>
      <figcaption className={styles.envelopesHead}>
        <h3 className={styles.blockTitle}>{envelopeCopy.title}</h3>
        <p className={styles.envelopesLede}>{envelopeCopy.lede}</p>
        <p className={styles.legend}>
          <span className={styles.legendMark} aria-hidden="true" />
          {reference.label}
        </p>
      </figcaption>

      <ul className={styles.envelopeList}>
        {envelopes.map((item, index) => {
          const share = `${(item.width / widest) * 100}%`
          const name = item.nameParts.join('')
          return (
            <Reveal
              as="li"
              key={name}
              delay={index * 0.08}
              className={styles.envelope}
            >
              {/* 舞台の縦横比を全台で同じにし、下端をそろえて床に置いたように見せる */}
              <div
                className={styles.stage}
                style={{ aspectRatio: `${widest} / ${tallest}` }}
                aria-hidden="true"
              >
                <svg
                  className={styles.shape}
                  style={{ width: share }}
                  viewBox={`0 0 ${item.width} ${item.height}`}
                  focusable="false"
                >
                  <rect
                    className={styles.shapeBody}
                    width={item.width}
                    height={item.height}
                  />
                  {item.axis === 'vertical' && (
                    <line
                      className={styles.shapeAxis}
                      x1={item.width / 2}
                      y1={-40}
                      x2={item.width / 2}
                      y2={item.height + 40}
                    />
                  )}
                  {item.axis === 'horizontal' && (
                    <line
                      className={styles.shapeAxis}
                      x1={-40}
                      y1={item.height / 2}
                      x2={item.width + 40}
                      y2={item.height / 2}
                    />
                  )}
                  <rect
                    className={styles.shapeRef}
                    y={item.height - reference.height}
                    width={reference.width}
                    height={reference.height}
                  />
                </svg>
              </div>
              <p className={styles.dim} style={{ width: share }} aria-hidden="true">
                <span>{formatMm(item.width)}</span>
              </p>
              <h4 className={styles.envelopeName}>
                {item.nameParts.map((part) => (
                  <span key={part} className={styles.nameChunk}>
                    {part}
                  </span>
                ))}
              </h4>
              <p className={styles.envelopeDims}>
                {item.dims.map((part, partIndex) => (
                  <span key={part} className={styles.dimChunk}>
                    {partIndex < item.dims.length - 1
                      ? `${part} ×`
                      : `${part} ${envelopeCopy.unit}`}
                  </span>
                ))}
              </p>
            </Reveal>
          )
        })}
      </ul>
    </figure>
  )
}

/** 設備: 加工範囲の比較図と、スペック表(検証可能な具体) */
export function Equipment() {
  return (
    <section
      id="equipment"
      aria-labelledby="equipment-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading
          id="equipment-heading"
          no="02"
          title="設備"
          lede="加工機と測定機の両方に投資するのが当社の方針です。削る力と、削れたことを証明する力は別物だからです。"
        />

        <EnvelopeChart />

        <Reveal className={styles.tableBlock}>
          <h3 className={styles.blockTitle}>{equipmentTableTitle}</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">設備</th>
                <th scope="col" className={styles.thCount}>
                  台数
                </th>
                <th scope="col">主要仕様</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map((equipment) => (
                <tr key={equipment.name}>
                  <th scope="row" className={styles.tdName}>
                    {equipment.name}
                  </th>
                  <td className={styles.tdCount}>{equipment.count}</td>
                  <td>
                    <span className={styles.specLabel}>{equipment.specLabel}</span>
                    <span className={styles.specValue}>{equipment.spec}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.note}>{equipmentNote}</p>
        </Reveal>
      </div>
    </section>
  )
}
