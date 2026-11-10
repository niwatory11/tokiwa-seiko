import { flowRepeatNote, flowSteps, quoteLede } from '../../data/company'
import { QuoteForm } from '../../features/quote/QuoteForm'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Quote.module.css'

/**
 * 工程図: 工程の箱を矢印でつなぐ。各箱に「誰が」と「受け渡すもの」を書き、
 * 量産からは初品の工程へ戻る破線(リピートは同じ工程で再現)を引く(1024px以上)。
 * 矢印は罫線と同じく、表示されたときに定規で引くように伸びる。
 */
function FlowChart() {
  return (
    <div className={styles.flowWrap}>
      <ol className={styles.flow}>
        {flowSteps.map((step, index) => (
          <Reveal as="li" key={step.no} delay={index * 0.12} className={styles.step}>
            <div className={styles.box}>
              <p className={styles.boxHead}>
                <span className={styles.stepNo} aria-hidden="true">
                  P-{step.no}
                </span>
                <span className={step.actor === 'お客様' ? styles.actorClient : styles.actor}>
                  {step.actor}
                </span>
              </p>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
              <p className={styles.output}>
                <span className={styles.outputLabel}>受け渡し</span>
                {step.output}
              </p>
            </div>
            {index < flowSteps.length - 1 && <span className={styles.arrow} aria-hidden="true" />}
          </Reveal>
        ))}
      </ol>
      <Reveal className={styles.repeat}>
        <span className={styles.repeatLine} aria-hidden="true" />
        <p className={styles.repeatNote}>{flowRepeatNote}</p>
      </Reveal>
    </div>
  )
}

/** 見積もり依頼: 流れを理解した直後にフォームを置く */
export function Quote() {
  return (
    <section
      id="quote"
      aria-labelledby="quote-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading id="quote-heading" no="06" title="見積もり依頼" lede={quoteLede} />

        <FlowChart />

        <Reveal className={styles.formWrap}>
          <h3 className={styles.formTitle}>見積もり依頼フォーム</h3>
          <QuoteForm />
        </Reveal>
      </div>
    </section>
  )
}
