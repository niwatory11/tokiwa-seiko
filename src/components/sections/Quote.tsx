import { flowSteps } from '../../data/company'
import { QuoteForm } from '../../features/quote/QuoteForm'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Quote.module.css'

/** 見積もり依頼: 流れを理解した直後にフォームを置く */
export function Quote() {
  return (
    <section
      id="quote"
      aria-labelledby="quote-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading
          id="quote-heading"
          no="06"
          title="見積もり依頼"
          lede="図面一枚から始まります。2営業日以内に、単価・納期・工程の内訳をお返しします。"
        />

        <ol className={styles.flow}>
          {flowSteps.map((step, index) => (
            <Reveal
              as="li"
              key={step.no}
              delay={index * 0.08}
              className={styles.step}
            >
              <span className={styles.stepNo} aria-hidden="true">
                {step.no}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className={styles.formWrap}>
          <h3 className={styles.formTitle}>見積もり依頼フォーム</h3>
          <QuoteForm />
        </Reveal>
      </div>
    </section>
  )
}
