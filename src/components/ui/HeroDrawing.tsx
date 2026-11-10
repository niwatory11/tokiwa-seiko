import type { CSSProperties } from 'react'
import styles from './HeroDrawing.module.css'

/*
 * ヒーローの図面: フランジの正面図と断面図(自作SVG)。
 * 製図の順序どおりに描かれていく: 中心線 → 外形 → 穴 → 断面のハッチング → 寸法 → 精度の指示。
 * 線画は pathLength={1} + stroke-dashoffset、補助線と文字はフェード(ロード時の keyframes)。
 * 寸法・指示の値は品質保証の「検査成績書(記入例)」と揃えてある(φ48 H7 / φ120 / P.C.D. φ90 / 直角度 0.01)。
 *
 * 座標の目安: 1mm = 約1.83px。正面図の中心 (150,190)、外径 r110、内径 r44、ボス r58.7、
 * P.C.D. r82.5。断面図はフランジ板 x330–359(厚さ16)、ボス x359–403(全長40)。
 */

const CX = 150
const CY = 190
const PCD_R = 82.5
const BOLT_R = 8.25
const BOLT_ANGLES = [90, 30, 330, 270, 210, 150]

/** 描き始めの遅れ(秒)をCSS変数で渡す */
const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties

const boltHoles = BOLT_ANGLES.map((deg) => {
  const rad = (deg * Math.PI) / 180
  return { x: CX + PCD_R * Math.cos(rad), y: CY - PCD_R * Math.sin(rad) }
})

/* 断面図の切り口(上半分・下半分)。中央の空白は内径φ48の穴 */
const SECTION_TOP = 'M330 80 H359 V131.3 H403 V146 H330 Z'
const SECTION_BOTTOM = 'M330 234 H403 V248.7 H359 V300 H330 Z'

export function HeroDrawing({ label }: { label: string }) {
  const outline = { fill: 'none', stroke: 'var(--c-sumi)', strokeWidth: 2 } as const
  const thin = { stroke: 'var(--c-usuzumi)', strokeWidth: 1, fill: 'none' } as const
  const center = { ...thin, strokeDasharray: '14 3 3 3' } as const
  const dim = {
    ...thin,
    markerStart: 'url(#hd-arrow-s)',
    markerEnd: 'url(#hd-arrow-e)',
  } as const

  return (
    <svg viewBox="0 0 520 380" role="img" aria-label={label} className={styles.svg}>
      <defs>
        <marker id="hd-arrow-s" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M8 4 L1 1.6 L1 6.4 Z" fill="var(--c-usuzumi)" />
        </marker>
        <marker id="hd-arrow-e" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto">
          <path d="M0 4 L7 1.6 L7 6.4 Z" fill="var(--c-usuzumi)" />
        </marker>
        {/* 引出線の矢: 線の終点で、線の進む向きに先端を向ける */}
        <marker id="hd-leader" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M8 4 L1 1.6 L1 6.4 Z" fill="var(--c-tokiwa)" />
        </marker>
        <pattern
          id="hd-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--c-usuzumi)" strokeWidth="0.8" />
        </pattern>
      </defs>

      {/* 1. 中心線(一点鎖線)を最初に引く */}
      <g className={styles.fade} style={delay(0)}>
        <line x1="24" y1={CY} x2="276" y2={CY} {...center} />
        <line x1={CX} y1="64" x2={CX} y2="316" {...center} />
        <line x1="318" y1={CY} x2="418" y2={CY} {...center} />
        <line x1="322" y1="107.5" x2="368" y2="107.5" {...center} />
        <line x1="322" y1="272.5" x2="368" y2="272.5" {...center} />
        <circle cx={CX} cy={CY} r={PCD_R} {...center} />
      </g>

      {/* 2. 正面図の外形・ボス・内径 */}
      <circle cx={CX} cy={CY} r="110" {...outline} className={styles.draw} style={delay(0.2)} pathLength={1} />
      <circle
        cx={CX}
        cy={CY}
        r="58.7"
        {...outline}
        strokeWidth={1.5}
        className={styles.draw}
        style={delay(0.45)}
        pathLength={1}
      />
      <circle cx={CX} cy={CY} r="44" {...outline} className={styles.draw} style={delay(0.6)} pathLength={1} />

      {/* 3. ボルト穴 6か所 */}
      {boltHoles.map((hole, i) => (
        <circle
          key={BOLT_ANGLES[i]}
          cx={hole.x}
          cy={hole.y}
          r={BOLT_R}
          {...outline}
          strokeWidth={1.5}
          className={styles.draw}
          style={delay(0.8 + i * 0.07)}
          pathLength={1}
        />
      ))}

      {/* 4. 断面図: ハッチング(フェード)の上に外形を引く。ボルト穴の位置は白で抜く */}
      <g className={styles.fade} style={delay(1.35)}>
        <path d={SECTION_TOP} fill="url(#hd-hatch)" />
        <path d={SECTION_BOTTOM} fill="url(#hd-hatch)" />
        <rect x="330" y="99.25" width="29" height="16.5" fill="var(--c-white)" />
        <rect x="330" y="264.25" width="29" height="16.5" fill="var(--c-white)" />
      </g>
      <path d={SECTION_TOP} {...outline} className={styles.draw} style={delay(0.95)} pathLength={1} />
      <path d={SECTION_BOTTOM} {...outline} className={styles.draw} style={delay(1.05)} pathLength={1} />
      <g {...outline} strokeWidth={1.5}>
        <line x1="330" y1="99.25" x2="359" y2="99.25" className={styles.draw} style={delay(1.2)} pathLength={1} />
        <line x1="330" y1="115.75" x2="359" y2="115.75" className={styles.draw} style={delay(1.2)} pathLength={1} />
        <line x1="330" y1="264.25" x2="359" y2="264.25" className={styles.draw} style={delay(1.25)} pathLength={1} />
        <line x1="330" y1="280.75" x2="359" y2="280.75" className={styles.draw} style={delay(1.25)} pathLength={1} />
      </g>

      {/* 5. 寸法 */}
      <g className={styles.fade} style={delay(1.6)}>
        {/* φ120(外径) */}
        <line x1="40" y1="200" x2="40" y2="358" {...thin} />
        <line x1="260" y1="200" x2="260" y2="358" {...thin} />
        <line x1="40" y1="350" x2="260" y2="350" {...dim} />
        <text x={CX} y="343" textAnchor="middle" className={styles.text}>
          φ120
        </text>

        {/* P.C.D. φ90 */}
        <line x1="91.7" y1="131.7" x2="70" y2="58" {...thin} />
        <line x1="70" y1="58" x2="150" y2="58" {...thin} />
        <text x="74" y="52" className={styles.text}>
          P.C.D. φ90
        </text>

        {/* 6×φ9 キリ(ボルト穴) */}
        <line x1="227.3" y1="237" x2="262" y2="322" {...thin} />
        <line x1="262" y1="322" x2="324" y2="322" {...thin} />
        <text x="265" y="316" className={styles.text}>
          6×φ9 キリ
        </text>

        {/* 断面図: 厚さ16・全長40・ボスφ64 */}
        <line x1="330" y1="76" x2="330" y2="30" {...thin} />
        <line x1="359" y1="76" x2="359" y2="56" {...thin} />
        <line x1="403" y1="127" x2="403" y2="30" {...thin} />
        <line x1="330" y1="64" x2="359" y2="64" {...dim} />
        <text x="344.5" y="57" textAnchor="middle" className={styles.text}>
          16
        </text>
        <line x1="330" y1="38" x2="403" y2="38" {...dim} />
        <text x="366.5" y="31" textAnchor="middle" className={styles.text}>
          40
        </text>
        <line x1="407" y1="131.3" x2="438" y2="131.3" {...thin} />
        <line x1="407" y1="248.7" x2="438" y2="248.7" {...thin} />
        <line x1="430" y1="131.3" x2="430" y2="248.7" {...dim} />
        <text x="444" y={CY} textAnchor="middle" className={`${styles.text} ${styles.textV}`}>
          φ64
        </text>

        {/* データム A(フランジの左端面) */}
        <path d="M330 283 L330 297 L322 290 Z" fill="var(--c-sumi)" />
        <line x1="322" y1="290" x2="306" y2="290" {...thin} />
        <rect x="286" y="280" width="20" height="20" {...thin} />
        <text x="296" y="295" textAnchor="middle" className={styles.text}>
          A
        </text>
      </g>

      {/* 6. 精度の指示(常盤色): 内径 φ48 H7 と 直角度 0.01 */}
      <g className={styles.fade} style={delay(1.95)}>
        <line
          x1="240"
          y1="100"
          x2="183"
          y2="157"
          stroke="var(--c-tokiwa)"
          strokeWidth="1.2"
          markerEnd="url(#hd-leader)"
        />
        <line x1="240" y1="100" x2="304" y2="100" stroke="var(--c-tokiwa)" strokeWidth="1.2" />
        <text x="244" y="93" className={styles.textAccent}>
          φ48 H7
        </text>

        <line
          x1="418"
          y1="300"
          x2="405"
          y2="252"
          stroke="var(--c-tokiwa)"
          strokeWidth="1.2"
          markerEnd="url(#hd-leader)"
        />
        <g fill="var(--c-white)" stroke="var(--c-tokiwa)" strokeWidth="1.2">
          <rect x="410" y="300" width="98" height="24" />
          <line x1="434" y1="300" x2="434" y2="324" />
          <line x1="484" y1="300" x2="484" y2="324" />
        </g>
        <text x="422" y="317" textAnchor="middle" className={styles.textAccent}>
          ⊥
        </text>
        <text x="459" y="317" textAnchor="middle" className={styles.textAccent}>
          0.01
        </text>
        <text x="496" y="317" textAnchor="middle" className={styles.textAccent}>
          A
        </text>
      </g>
    </svg>
  )
}
