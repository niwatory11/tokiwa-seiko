export type Equipment = {
  name: string
  count: number
  spec: string
  specLabel: string
}

/** 実在メーカー名は出さず、汎用の機種名と仕様で構成する */
export const equipmentList: Equipment[] = [
  {
    name: '5軸制御マシニングセンタ',
    count: 1,
    spec: 'φ600×400mm',
    specLabel: '加工範囲',
  },
  {
    name: '立形マシニングセンタ(3軸)',
    count: 4,
    spec: '1,000×500×500mm',
    specLabel: '加工範囲',
  },
  {
    name: 'ミーリング付きNC旋盤',
    count: 3,
    spec: 'φ300×600mm',
    specLabel: '加工径×長さ',
  },
  {
    name: 'ワイヤー放電加工機',
    count: 1,
    spec: '550×350×220mm',
    specLabel: '加工範囲',
  },
  {
    name: '三次元測定機(恒温室設置)',
    count: 1,
    spec: '(1.9+3L/1000)μm',
    specLabel: '測定精度',
  },
  {
    name: '画像寸法測定器・表面粗さ計',
    count: 2,
    spec: '小径・薄物の全数検査用',
    specLabel: '用途',
  },
]

export const equipmentTableTitle = '設備一覧'

/**
 * 加工範囲(正面から見た幅と高さ、mm)。同じ縮尺で並べて描くための値で、
 * equipmentList の主要仕様と同じ数字を使う。
 */
export type Envelope = {
  /** 設備名を、途中で折り返してよい区切りで分けたもの(つなげると equipmentList の名前になる) */
  nameParts: string[]
  width: number
  height: number
  /** 円筒の加工範囲だけ、回転の軸の向きを持つ(縦=回転テーブル / 横=主軸) */
  axis?: 'vertical' | 'horizontal'
  /** 寸法の内訳。「×」でつないで表示し、内訳の途中では折り返さない */
  dims: string[]
}

export const envelopes: Envelope[] = [
  {
    nameParts: ['立形', 'マシニングセンタ', '(3軸)'],
    width: 1000,
    height: 500,
    dims: ['幅1,000', '奥行500', '高さ500'],
  },
  {
    nameParts: ['5軸制御', 'マシニングセンタ'],
    width: 600,
    height: 400,
    axis: 'vertical',
    dims: ['直径600', '高さ400'],
  },
  {
    nameParts: ['ミーリング付き', 'NC旋盤'],
    width: 600,
    height: 300,
    axis: 'horizontal',
    dims: ['直径300', '長さ600'],
  },
  {
    nameParts: ['ワイヤー', '放電加工機'],
    width: 550,
    height: 220,
    dims: ['幅550', '奥行350', '高さ220'],
  },
]

export const envelopeCopy = {
  title: '加工範囲の比較',
  lede: '四台の加工機に載る大きさを、同じ縮尺で正面から描きました。お手元の部品が載るかどうかの目安にしてください。',
  /** 大きさの手がかりに重ねる用紙 */
  reference: { label: 'A4用紙(297×210mm)', width: 297, height: 210 },
  unit: 'mm',
}

export const equipmentNote =
  '夜間の無人運転(自動パレット交換)により、小ロットでも納期を圧縮します。'
