import { equipmentList, equipmentNote } from '../../data/equipment'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import styles from './Equipment.module.css'

/** 設備一覧: 能力の裏付けをスペック表で示す(検証可能な具体) */
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

        <Reveal>
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
