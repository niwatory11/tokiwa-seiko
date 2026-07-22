import { facts } from '../../data/services'
import { LinkButton } from '../ui/LinkButton'
import styles from './Hero.module.css'

/** 図面の表題欄(タイトルブロック)。架空注記も図面様式で組み込む */
function TitleBlock() {
  return (
    <dl className={styles.titleBlock}>
      <div className={styles.tbRow}>
        <dt className={styles.tbLabel}>品名</dt>
        <dd className={styles.tbValue}>精密部品の切削加工</dd>
      </div>
      <div className={styles.tbRow}>
        <dt className={styles.tbLabel}>材質</dt>
        <dd className={styles.tbValue}>アルミ / ステンレス / チタン ほか</dd>
      </div>
      <div className={styles.tbRow}>
        <dt className={styles.tbLabel}>図番</dt>
        <dd className={`${styles.tbValue} ${styles.tbMono}`}>TKW-0001</dd>
      </div>
      <div className={styles.tbRow}>
        <dt className={styles.tbLabel}>注記</dt>
        <dd className={styles.tbValue}>本サイトは架空企業のコンセプトサイトです</dd>
      </div>
    </dl>
  )
}

/** ファーストビュー: 白図面の方眼の上で、事業と精度を断定する */
export function Hero() {
  return (
    <section id="top" aria-label="常盤精工 — 精密切削加工" className={styles.hero}>
      <div className={`container ${styles.inner}`}>
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
