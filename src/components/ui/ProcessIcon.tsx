import type { JSX } from 'react'
import type { ServiceId } from '../../data/services'
import styles from './ProcessIcon.module.css'

type ProcessIconProps = {
  variant: ServiceId
  className?: string
}

/*
 * 加工方法の略図(自作SVG)。図面と同じ線の使い分けで描く:
 * ワーク(削られる側)=墨の太線 / 工具・皮膜=常盤色 / 補助線=薄墨の細線 / 中心線=一点鎖線
 * 表示されたときに、製図の手つきで線を引く(pathLength=1 + stroke-dashoffset)。
 */

/** マシニング切削: 段付きのワークを、エンドミルが横へ削り進む */
function Milling() {
  return (
    <>
      <path className={`${styles.outline} ${styles.draw}`} pathLength={1} d="M8 62H64V48H38V38H8Z" />
      <path className={`${styles.accent} ${styles.draw}`} pathLength={1} d="M44 6h14v12H44zM47 18h8v30h-8z" />
      <path className={`${styles.accentThin} ${styles.draw}`} pathLength={1} d="M47 27l8-5M47 35l8-5M47 43l8-5" />
      <path className={`${styles.thin} ${styles.draw}`} pathLength={1} d="M42 30H28M32 27l-4 3 4 3" />
    </>
  )
}

/** NC旋盤: チャックでつかんだ丸棒を回し、バイトを当てる */
function Turning() {
  return (
    <>
      <path className={`${styles.outline} ${styles.draw}`} pathLength={1} d="M6 16h12v40H6z" />
      <path className={`${styles.thin} ${styles.draw}`} pathLength={1} d="M18 24h4v24h-4" />
      <path className={`${styles.outline} ${styles.draw}`} pathLength={1} d="M22 26h22v20H22zM44 30h16v12H44z" />
      <path className={`${styles.center} ${styles.fade}`} d="M2 36H70" />
      <path className={`${styles.accent} ${styles.draw}`} pathLength={1} d="M52 42l5 11H47zM47 53h10v11H47z" />
    </>
  )
}

/** ワイヤー放電加工: 上下のガイドに張ったワイヤーが、板を放電で切り進む */
function Wire() {
  return (
    <>
      <path className={`${styles.outline} ${styles.draw}`} pathLength={1} d="M8 30h56v14H8z" />
      <path className={`${styles.outline} ${styles.draw}`} pathLength={1} d="M30 8h12v8H30zM30 56h12v8H30z" />
      <path className={`${styles.accent} ${styles.draw}`} pathLength={1} d="M36 16v40" />
      <path className={`${styles.thin} ${styles.draw}`} pathLength={1} d="M12 37h20" />
      <path className={`${styles.accentThin} ${styles.draw}`} pathLength={1} d="M40 26l4-3M41 37h5M40 48l4 3" />
    </>
  )
}

/** 表面処理・熱処理: 部品の断面と、外側をおおう皮膜。右上は熱 */
function Finish() {
  return (
    <>
      <path className={`${styles.outline} ${styles.draw}`} pathLength={1} d="M14 22h18v22h24v14H14z" />
      <path className={`${styles.thin} ${styles.draw}`} pathLength={1} d="M17 36l12-12M17 46l13-13M19 55l11-11M31 55l8-8M43 55l8-8" />
      <path className={`${styles.accent} ${styles.draw}`} pathLength={1} d="M10 18h26v22h24v22H10z" />
      <path className={`${styles.accentThin} ${styles.draw}`} pathLength={1} d="M45 30q3-4 0-8t0-8M54 30q3-4 0-8t0-8" />
    </>
  )
}

const drawings = {
  milling: Milling,
  turning: Turning,
  wire: Wire,
  finish: Finish,
} satisfies Record<ServiceId, () => JSX.Element>

/** 装飾の略図。加工名は隣の見出しが持つため、読み上げからは外す */
export function ProcessIcon({ variant, className }: ProcessIconProps) {
  const Drawing = drawings[variant]
  return (
    <svg
      className={className ? `${styles.icon} ${className}` : styles.icon}
      viewBox="0 0 72 72"
      aria-hidden="true"
      focusable="false"
    >
      <Drawing />
    </svg>
  )
}
