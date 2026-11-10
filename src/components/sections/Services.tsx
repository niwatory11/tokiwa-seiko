import { materials, materialsNote, services } from '../../data/services'
import { ProcessIcon } from '../ui/ProcessIcon'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Services.module.css'

/** 対応加工と材質(サービス内容の中核) */
export function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className={`section ${styles.section}`}
    >
      <div className="container">
        <SectionHeading
          id="services-heading"
          no="01"
          title="対応加工"
          lede="切削を軸に、丸物・角物・難削材まで社内で完結します。工程をまたぐ部品も、窓口はひとつです。"
        />

        <ul className={styles.list}>
          {services.map((service, index) => (
            <Reveal
              as="li"
              key={service.id}
              delay={index * 0.08}
              className={styles.item}
            >
              <div className={styles.itemHead}>
                <ProcessIcon variant={service.id} />
                <div className={styles.itemTitle}>
                  <h3 className={styles.itemName}>{service.name}</h3>
                  <p className={styles.itemSpec}>{service.spec}</p>
                </div>
              </div>
              <p className={styles.itemBody}>{service.body}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal className={styles.materials}>
          <h3 className={styles.materialsTitle}>対応材質</h3>
          <dl className={styles.materialsList}>
            {materials.map((material) => (
              <div key={material.category} className={styles.materialRow}>
                <dt className={styles.materialCategory}>{material.category}</dt>
                <dd className={styles.materialGrades}>{material.grades}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.note}>{materialsNote}</p>
        </Reveal>
      </div>
    </section>
  )
}
