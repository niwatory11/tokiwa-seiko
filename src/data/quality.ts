export type QualityItem = {
  title: string
  body: string
}

export const qualityItems: QualityItem[] = [
  {
    title: '恒温検査室での測定',
    body: '20±1℃に管理した検査室で三次元測定機による検査を行います。温度による寸法変化を排除し、図面公差に対する測定値をそのまま保証します。',
  },
  {
    title: '検査成績書の標準添付',
    body: '重要寸法の測定値を記載した検査成績書を、初品・量産を問わず標準で添付します。ミルシート(材料証明書)の添付にも対応します。',
  },
  {
    title: '図面と工程の版数管理',
    body: '受領図面・加工プログラム・工程表を版数で紐付けて保管します。リピート発注時は前回と同一の工程で再現し、改版時は差分を確認してから着手します。',
  },
  {
    title: '不適合の即時報告',
    body: '公差を外れた場合は手直しや黙認をせず、その日のうちに測定値を添えてご報告します。判断はお客様の図面が基準です。',
  },
]

/** 検印スタンプの文字(朱色を使う唯一の意匠) */
export const inspectionStamp = { label: '検', description: '検査済み印' }

export const qualityLede =
  '「削れました」ではなく「測りました」で納品します。精度は主張ではなく、測定値で渡すものだと考えています。'

/**
 * 検査成績書の記入例(架空)。ヒーローの図面(図番 TKW-0001・フランジ)の指示寸法と揃えてある。
 * 測定値はすべて例示で、実在の製品・測定結果ではない。
 */
export const sampleReport = {
  title: '検査成績書',
  example: '記入例',
  drawingNo: 'TKW-0001',
  partName: 'フランジ(図示例)',
  environment: '測定 20.1℃ / 三次元測定機',
  columns: ['No.', '項目', '図面指示', '測定値', '判定'],
  rows: [
    { no: '1', item: '内径', spec: 'φ48 H7(+0.025/0)', value: '48.012', result: '合' },
    { no: '2', item: '外径', spec: 'φ120 ±0.05', value: '119.98', result: '合' },
    { no: '3', item: 'P.C.D.', spec: 'φ90 ±0.02', value: '90.006', result: '合' },
    { no: '4', item: '直角度', spec: '0.01(データム A)', value: '0.006', result: '合' },
  ],
  note: '記入例です。実在の製品・測定値ではありません。',
} as const
