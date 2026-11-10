/** ヒーロー直下の事実の帯: ページ内の設備・加工内容で裏付けられる能力値のみ載せる */
export const facts = [
  { value: '±0.01', unit: 'mm', label: '標準加工精度' },
  { value: '1', unit: '個〜', label: '最小ロット' },
  { value: '5', unit: '軸', label: '同時制御加工' },
  { value: '2', unit: '営業日', label: '見積もり回答' },
] as const

export type Service = {
  id: string
  name: string
  spec: string
  body: string
}

export const services: Service[] = [
  {
    id: 'milling',
    name: 'マシニング切削',
    spec: '3軸・5軸 / 最大 1,000×500×500mm',
    body: '立形3軸と5軸同時制御機による切削加工。複雑形状や多面加工も、段取り替えを最小にして精度を保ちます。',
  },
  {
    id: 'turning',
    name: 'NC旋盤',
    spec: '最大 φ300×600mm',
    body: 'シャフト・ブッシュなどの丸物加工。ミーリング機能付き複合旋盤で、二次加工までを一台で完結します。',
  },
  {
    id: 'wire',
    name: 'ワイヤー放電加工',
    spec: '最大 550×350×220mm',
    body: '焼入れ材や難削材の輪郭加工。切削で歪みが出やすい薄物・微細形状はワイヤーで仕上げます。',
  },
  {
    id: 'finish',
    name: '表面処理・熱処理',
    spec: '協力工場と連携',
    body: 'アルマイト・無電解ニッケル・硬質クロム・焼入れは、長年組んできた協力工場へ。処理後の寸法保証まで当社が窓口になります。',
  },
]

export type Material = {
  category: string
  grades: string
}

export const materials: Material[] = [
  { category: 'アルミニウム', grades: 'A2017 / A5052 / A6063 / A7075' },
  { category: 'ステンレス', grades: 'SUS303 / SUS304 / SUS316L / SUS440C' },
  { category: '鉄・鋼材', grades: 'SS400 / S45C / SKD11 / SCM435' },
  { category: '銅・真鍮', grades: 'C1100 / C2801 / C3604' },
  { category: 'チタン', grades: '純チタン2種 / Ti-6Al-4V(64チタン)' },
  { category: '樹脂', grades: 'POM / MCナイロン / PEEK / PTFE' },
]

export const materialsNote =
  '上記以外の材質もご相談ください。材料手配からミルシート(材料証明書)の添付まで対応します。'

/** ヒーローの図面の表題欄(図面右下)。架空注記も図面様式で組み込む */
export const heroTitleBlock = [
  { label: '品名', value: '精密部品の切削加工', mono: false },
  { label: '材質', value: 'アルミ / ステンレス / チタン ほか', mono: false },
  { label: '図番', value: 'TKW-0001', mono: true },
  { label: '注記', value: '本サイトは架空企業のコンセプトサイトです', mono: false },
] as const

/** ヒーローの図面(フランジの図示例)の読み上げ用説明 */
export const heroDrawingLabel =
  'フランジの図面の例。正面図と断面図に、外径φ120、内径φ48 H7、ボルト穴6か所(P.C.D. φ90)、直角度0.01の指示が描かれている'
