import { facts, heroDrawingLabel, heroTitleBlock } from '../../data/services'
import { HeroDrawing } from '../ui/HeroDrawing'
import { LinkButton } from '../ui/LinkButton'
import styles from './Hero.module.css'

/** 図面の表題欄(タイトルブロック)。図面枠の右下に収まる。架空注記も図面様式で組み込む */
function TitleBlock() {
  return (
    <dl className={styles.titleBlock}>
      {heroTitleBlock.map((row) => (
        <div key={row.label} className={styles.tbRow}>
          <dt className={styles.tbLabel}>{row.label}</dt>
          <dd className={row.mono ? `${styles.tbValue} ${styles.tbMono}` : styles.tbValue}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** 図面枠の区域記号(上下にA〜D、左右に1〜2)。装飾のため読み上げない */
function SheetZones() {
  return (
    <div className={styles.zones} aria-hidden="true">
      {['A', 'B', 'C', 'D'].map((zone) => (
        <span key={`t-${zone}`} className={`${styles.zone} ${styles.zoneTop}`}>
          {zone}
        </span>
      ))}
      {['A', 'B', 'C', 'D'].map((zone) => (
        <span key={`b-${zone}`} className={`${styles.zone} ${styles.zoneBottom}`}>
          {zone}
        </span>
      ))}
      {['1', '2'].map((zone) => (
        <span key={`l-${zone}`} className={`${styles.zone} ${styles.zoneLeft}`}>
          {zone}
        </span>
      ))}
      {['1', '2'].map((zone) => (
        <span key={`r-${zone}`} className={`${styles.zone} ${styles.zoneRight}`}>
          {zone}
        </span>
      ))}
    </div>
  )
}

/**
 * ファーストビュー: 画面そのものを図面一枚に見立てる。
 * 図面枠(二重枠と区域記号)の中に、左は事業と精度の断定、右はフランジの図面が
 * 製図の順序で描かれ、表題欄は図面枠の右下に収まる。
 */
export function Hero() {
  return (
    <section id="top" aria-label="常盤精工 — 精密切削加工" className={styles.hero}>
      <div className={`container ${styles.sheet}`}>
        <SheetZones />

        <div className={styles.main}>
          <p className={styles.eyebrow}>精密切削加工 — 東京・大田区の町工場</p>
          <h1 className={styles.heading}>
            <span className={styles.num}>0.01mm</span>を、
            <br />
            あたりまえに。
          </h1>
          <p className={styles.subcopy}>
            アルミ・ステンレス・チタンの精密部品加工。
            <br />
            試作1個から小ロット量産まで、図面一枚でお見積もりします。
          </p>
          <div className={styles.ctas}>
            <LinkButton href="#quote">図面から見積もりを依頼する</LinkButton>
            <LinkButton href="#equipment" variant="ghost">
              設備一覧を見る
            </LinkButton>
          </div>
        </div>

        <div className={styles.drawing}>
          <HeroDrawing label={heroDrawingLabel} />
        </div>

        <TitleBlock />
      </div>

      {/* 価値提案の直後に置く事実の帯(設備・加工内容で裏付けられる能力値のみ) */}
      <div className={styles.factsBand}>
        <dl className={`container ${styles.facts}`}>
          {facts.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt className={styles.factLabel}>{fact.label}</dt>
              <dd className={styles.factValue}>
                {fact.value}
                <span className={styles.factUnit}>{fact.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
