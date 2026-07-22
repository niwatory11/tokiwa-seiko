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

export const equipmentNote =
  '夜間の無人運転(自動パレット交換)により、小ロットでも納期を圧縮します。'
