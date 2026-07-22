export type Work = {
  id: 'housing' | 'shaft' | 'bracket'
  drawingNo: string
  name: string
  material: string
  process: string
  tolerance: string
  lot: string
  body: string
  /** 図面SVGの代替テキスト */
  artAlt: string
}

/** 加工例はコンセプト提示用の架空事例(実在の取引・製品ではない) */
export const works: Work[] = [
  {
    id: 'housing',
    drawingNo: 'TKW-2041',
    name: 'センサーハウジング',
    material: 'A5052',
    process: '5軸マシニング',
    tolerance: '±0.02mm',
    lot: '50個',
    body: '五面の窓抜きと斜め穴を持つ筐体部品。5軸同時制御で段取りを一回にまとめ、面ごとの位置ずれを抑えました。',
    artAlt: 'センサーハウジングの二面図。正面図と側面図に寸法線と公差が記入された機械図面',
  },
  {
    id: 'shaft',
    drawingNo: 'TKW-1873',
    name: '精密シャフト',
    material: 'SUS304',
    process: 'NC旋盤',
    tolerance: '軸径 0/-0.01mm',
    lot: '10個',
    body: '嵌め合い部を持つ段付きシャフト。マイナス公差のみ許される軸径を、加工後の経時変化まで見込んで仕上げました。',
    artAlt: '精密シャフトの正面図。段付き軸の各径に寸法線とはめあい公差が記入された機械図面',
  },
  {
    id: 'bracket',
    drawingNo: 'TKW-2210',
    name: '計測器ブラケット',
    material: 'Ti-6Al-4V',
    process: '3軸マシニング+ワイヤー',
    tolerance: '±0.05mm',
    lot: '試作1個',
    body: 'チタン合金の軽量ブラケット。反りが出やすい薄肉リブを、切削とワイヤー放電の使い分けで歪みなく仕上げました。',
    artAlt: '計測器ブラケットの正面図。L字形状に肉抜き穴と寸法線が記入された機械図面',
  },
]

export const worksNote =
  '加工例は本コンセプトサイトのために作成した架空の事例です。実在の取引・製品を示すものではありません。'
