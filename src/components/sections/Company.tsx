import { companyInfo, companyStatement } from '../../data/company'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Company.module.css'

const infoRows = [
  ['社名', `${companyInfo.name}(${companyInfo.reading})`],
  ['創業', companyInfo.founded],
  ['代表', companyInfo.representative],
  ['所在地', companyInfo.address],
  ['従業員', companyInfo.employees],
  ['事業内容', companyInfo.business],
  ['電話', companyInfo.tel],
  ['受付時間', companyInfo.hours],
] as const

/** 会社概要: 社名の由来を「変わらない品質」の宣言として語る */
export function Company() {
  return (
    <section
      id="company"
      aria-labelledby="company-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading id="company-heading" no="05" title="会社概要" />

        <div className={styles.layout}>
          <Reveal className={styles.statement}>
            <h3 className={styles.statementTitle}>{companyStatement.title}</h3>
            <p className={styles.statementBody}>{companyStatement.body}</p>
          </Reveal>

          <Reveal delay={0.12} className={styles.infoWrap}>
            <dl className={styles.infoList}>
              {infoRows.map(([label, value]) => (
                <div key={label} className={styles.infoRow}>
                  <dt className={styles.infoLabel}>{label}</dt>
                  <dd className={styles.infoValue}>{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
