import styles from './PartDrawing.module.css'

type PartDrawingProps = {
  variant: 'housing' | 'shaft' | 'bracket'
  label: string
  className?: string
}

/*
 * 加工例の機械図面風イラスト(自作SVG)。
 * 線の太さの使い分けは実際の製図規格に倣う:
 * 外形線=太線 / 寸法線・引出線=細線 / 中心線=一点鎖線
 */

/** 寸法矢印マーカー(variantごとに一意のidを持たせる) */
function DimMarkers({ variant }: { variant: string }) {
  return (
    <defs>
      <marker
        id={`dim-s-${variant}`}
        markerWidth="8"
        markerHeight="8"
        refX="7"
        refY="4"
        orient="auto"
      >
        <path d="M8 4 L1 1.6 L1 6.4 Z" fill="var(--c-usuzumi)" />
      </marker>
      <marker
        id={`dim-e-${variant}`}
        markerWidth="8"
        markerHeight="8"
        refX="1"
        refY="4"
        orient="auto"
      >
        <path d="M0 4 L7 1.6 L7 6.4 Z" fill="var(--c-usuzumi)" />
      </marker>
    </defs>
  )
}

function Housing() {
  const dim = {
    stroke: 'var(--c-usuzumi)',
    strokeWidth: 1,
    markerStart: 'url(#dim-s-housing)',
    markerEnd: 'url(#dim-e-housing)',
  } as const
  return (
    <>
      <DimMarkers variant="housing" />
      <defs>
        <pattern
          id="hatch-housing"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--c-keisen)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* 正面図 */}
      <rect
        x="48"
        y="64"
        width="160"
        height="140"
        fill="var(--c-white)"
        stroke="var(--c-sumi)"
        strokeWidth="2"
        className={styles.draw}
        pathLength={1}
      />
      <circle
        cx="128"
        cy="134"
        r="32"
        fill="none"
        stroke="var(--c-sumi)"
        strokeWidth="2"
        className={styles.draw}
        pathLength={1}
      />
      {/* 中心線(一点鎖線) */}
      <g
        stroke="var(--c-usuzumi)"
        strokeWidth="1"
        strokeDasharray="14 3 3 3"
        className={styles.fade}
      >
        <line x1="80" y1="134" x2="176" y2="134" />
        <line x1="128" y1="86" x2="128" y2="182" />
      </g>
      {/* 四隅の取付穴 */}
      <g fill="none" stroke="var(--c-sumi)" strokeWidth="1.5">
        <circle cx="68" cy="84" r="6" className={styles.drawLate} pathLength={1} />
        <circle cx="188" cy="84" r="6" className={styles.drawLate} pathLength={1} />
        <circle cx="68" cy="184" r="6" className={styles.drawLate} pathLength={1} />
        <circle cx="188" cy="184" r="6" className={styles.drawLate} pathLength={1} />
      </g>

      {/* 側面図(断面ハッチング) */}
      <rect
        x="252"
        y="64"
        width="56"
        height="140"
        fill="url(#hatch-housing)"
        stroke="var(--c-sumi)"
        strokeWidth="2"
        className={`${styles.draw} ${styles.hatch}`}
        pathLength={1}
      />
      <rect
        x="252"
        y="110"
        width="34"
        height="48"
        fill="var(--c-white)"
        stroke="var(--c-sumi)"
        strokeWidth="1.5"
        className={styles.drawLate}
        pathLength={1}
      />

      {/* 寸法: 幅120 */}
      <g stroke="var(--c-usuzumi)" strokeWidth="1" className={styles.fade}>
        <line x1="48" y1="210" x2="48" y2="238" />
        <line x1="208" y1="210" x2="208" y2="238" />
      </g>
      <line x1="48" y1="232" x2="208" y2="232" {...dim} className={styles.fade} />
      <text
        x="128"
        y="226"
        textAnchor="middle"
        className={`${styles.dimText} ${styles.fade}`}
      >
        120
      </text>

      {/* 寸法: 奥行42 */}
      <g stroke="var(--c-usuzumi)" strokeWidth="1" className={styles.fade}>
        <line x1="252" y1="210" x2="252" y2="238" />
        <line x1="308" y1="210" x2="308" y2="238" />
      </g>
      <line
        x1="252"
        y1="232"
        x2="308"
        y2="232"
        {...dim}
        className={styles.fade}
      />
      <text
        x="280"
        y="226"
        textAnchor="middle"
        className={`${styles.dimText} ${styles.fade}`}
      >
        42
      </text>

      {/* 公差付き径の引出線 */}
      <line
        x1="151"
        y1="111"
        x2="196"
        y2="46"
        stroke="var(--c-tokiwa)"
        strokeWidth="1"
        className={styles.fade}
      />
      <text
        x="200"
        y="42"
        className={`${styles.dimTextAccent} ${styles.fade}`}
      >
        φ64 ±0.02
      </text>
    </>
  )
}

function Shaft() {
  const dim = {
    stroke: 'var(--c-usuzumi)',
    strokeWidth: 1,
    markerStart: 'url(#dim-s-shaft)',
    markerEnd: 'url(#dim-e-shaft)',
  } as const
  return (
    <>
      <DimMarkers variant="shaft" />
      {/* 段付きシャフトの外形(面取りC1付き) */}
      <path
        d="M56 128 L108 128 L108 106 L116 98 L196 98 L204 106 L204 118 L268 118 L276 126 L276 154 L268 162 L204 162 L204 174 L196 182 L116 182 L108 174 L108 152 L56 152 Z"
        fill="var(--c-white)"
        stroke="var(--c-sumi)"
        strokeWidth="2"
        className={styles.draw}
        pathLength={1}
      />
      {/* 段の境界線 */}
      <g stroke="var(--c-sumi)" strokeWidth="1">
        <line
          x1="108"
          y1="128"
          x2="108"
          y2="152"
          className={styles.drawLate}
          pathLength={1}
        />
        <line
          x1="204"
          y1="118"
          x2="204"
          y2="162"
          className={styles.drawLate}
          pathLength={1}
        />
      </g>
      {/* 中心線 */}
      <line
        x1="40"
        y1="140"
        x2="292"
        y2="140"
        stroke="var(--c-usuzumi)"
        strokeWidth="1"
        strokeDasharray="14 3 3 3"
        className={styles.fade}
      />

      {/* 寸法: 全長236 */}
      <g stroke="var(--c-usuzumi)" strokeWidth="1" className={styles.fade}>
        <line x1="56" y1="188" x2="56" y2="226" />
        <line x1="276" y1="188" x2="276" y2="226" />
      </g>
      <line x1="56" y1="220" x2="276" y2="220" {...dim} className={styles.fade} />
      <text
        x="166"
        y="214"
        textAnchor="middle"
        className={`${styles.dimText} ${styles.fade}`}
      >
        236
      </text>

      {/* 公差付き軸径の引出線 */}
      <g stroke="var(--c-usuzumi)" strokeWidth="1" className={styles.fade}>
        <line x1="88" y1="128" x2="88" y2="66" />
        <line x1="88" y1="152" x2="88" y2="160" />
      </g>
      <text
        x="94"
        y="62"
        className={`${styles.dimTextAccent} ${styles.fade}`}
      >
        φ24 0/-0.01
      </text>
      <line
        x1="88"
        y1="70"
        x2="88"
        y2="126"
        stroke="var(--c-tokiwa)"
        strokeWidth="1"
        className={styles.fade}
      />

      {/* 面取り注記 */}
      <line
        x1="270"
        y1="122"
        x2="296"
        y2="92"
        stroke="var(--c-usuzumi)"
        strokeWidth="1"
        className={styles.fade}
      />
      <text x="270" y="86" className={`${styles.dimText} ${styles.fade}`}>
        C1
      </text>
    </>
  )
}

function Bracket() {
  const dim = {
    stroke: 'var(--c-usuzumi)',
    strokeWidth: 1,
    markerStart: 'url(#dim-s-bracket)',
    markerEnd: 'url(#dim-e-bracket)',
  } as const
  return (
    <>
      <DimMarkers variant="bracket" />
      {/* L字外形 */}
      <path
        d="M72 56 L148 56 L148 156 L268 156 L268 216 L72 216 Z"
        fill="var(--c-white)"
        stroke="var(--c-sumi)"
        strokeWidth="2"
        className={styles.draw}
        pathLength={1}
      />
      {/* 肉抜き穴と長穴 */}
      <circle
        cx="110"
        cy="96"
        r="12"
        fill="none"
        stroke="var(--c-sumi)"
        strokeWidth="1.5"
        className={styles.drawLate}
        pathLength={1}
      />
      <rect
        x="180"
        y="178"
        width="56"
        height="18"
        rx="9"
        fill="none"
        stroke="var(--c-sumi)"
        strokeWidth="1.5"
        className={styles.drawLate}
        pathLength={1}
      />
      {/* 中心線 */}
      <g
        stroke="var(--c-usuzumi)"
        strokeWidth="1"
        strokeDasharray="10 3 3 3"
        className={styles.fade}
      >
        <line x1="110" y1="76" x2="110" y2="116" />
        <line x1="90" y1="96" x2="130" y2="96" />
        <line x1="172" y1="187" x2="244" y2="187" />
      </g>

      {/* 寸法: 全高160 */}
      <g stroke="var(--c-usuzumi)" strokeWidth="1" className={styles.fade}>
        <line x1="66" y1="56" x2="40" y2="56" />
        <line x1="66" y1="216" x2="40" y2="216" />
      </g>
      <line x1="46" y1="56" x2="46" y2="216" {...dim} className={styles.fade} />
      <text
        x="40"
        y="140"
        textAnchor="middle"
        className={`${styles.dimTextV} ${styles.fade}`}
      >
        160
      </text>

      {/* 寸法: 全幅196 */}
      <g stroke="var(--c-usuzumi)" strokeWidth="1" className={styles.fade}>
        <line x1="72" y1="222" x2="72" y2="250" />
        <line x1="268" y1="222" x2="268" y2="250" />
      </g>
      <line x1="72" y1="244" x2="268" y2="244" {...dim} className={styles.fade} />
      <text
        x="170"
        y="238"
        textAnchor="middle"
        className={`${styles.dimText} ${styles.fade}`}
      >
        196
      </text>

      {/* 公差注記 */}
      <line
        x1="122"
        y1="96"
        x2="196"
        y2="60"
        stroke="var(--c-tokiwa)"
        strokeWidth="1"
        className={styles.fade}
      />
      <text
        x="200"
        y="56"
        className={`${styles.dimTextAccent} ${styles.fade}`}
      >
        φ24 ±0.05
      </text>
    </>
  )
}

const variants = {
  housing: Housing,
  shaft: Shaft,
  bracket: Bracket,
} as const

export function PartDrawing({ variant, label, className }: PartDrawingProps) {
  const Variant = variants[variant]
  return (
    <svg
      viewBox="0 0 340 260"
      role="img"
      aria-label={label}
      className={className ? `${styles.svg} ${className}` : styles.svg}
    >
      <Variant />
    </svg>
  )
}
