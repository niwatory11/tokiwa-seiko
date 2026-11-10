import { Reveal } from './Reveal'
import styles from './SectionHeading.module.css'

type SectionHeadingProps = {
  id: string
  /** 図番風の通し番号(例: '02') */
  no: string
  title: string
  lede?: string
  /** 墨の地(品質保証)の上で使うとき 'inverse' */
  tone?: 'default' | 'inverse'
}

/** 図面の図番のように、等幅数号+見出し+罫線で組むセクション見出し */
export function SectionHeading({ id, no, title, lede, tone = 'default' }: SectionHeadingProps) {
  return (
    <Reveal className={tone === 'inverse' ? `${styles.wrap} ${styles.inverse}` : styles.wrap}>
      <p className={styles.no} aria-hidden="true">
        {no}
      </p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {lede && <p className={styles.lede}>{lede}</p>}
    </Reveal>
  )
}
