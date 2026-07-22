export const categoryOptions = [
  { value: 'prototype', label: '試作(1〜9個)' },
  { value: 'small-lot', label: '小ロット(10〜99個)' },
  { value: 'production', label: '量産(100個〜)' },
  { value: 'other', label: 'その他・相談したい' },
] as const

export const materialOptions = [
  { value: 'aluminum', label: 'アルミニウム' },
  { value: 'stainless', label: 'ステンレス' },
  { value: 'steel', label: '鉄・鋼材' },
  { value: 'copper', label: '銅・真鍮' },
  { value: 'titanium', label: 'チタン' },
  { value: 'resin', label: '樹脂' },
  { value: 'unknown', label: 'その他・不明' },
] as const

export const quoteNotes = {
  file: '実際のお見積もりでは図面(PDF・DXF・STEP)を添付いただきますが、本サイトはコンセプトデモのため、ファイル送信を含む一切の送信は行われません。',
  deadline: 'ご希望納期は7日後から180日後までの範囲でご指定ください。',
}
