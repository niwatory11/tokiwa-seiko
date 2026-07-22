export type NavItem = {
  href: string
  label: string
}

export const navItems: NavItem[] = [
  { href: '#services', label: '対応加工' },
  { href: '#equipment', label: '設備' },
  { href: '#quality', label: '品質保証' },
  { href: '#works', label: '加工例' },
  { href: '#company', label: '会社概要' },
]

/** ヘッダー右端に常設する主要CTA(B2Bは固定配置が定石) */
export const quoteCta = { href: '#quote', label: '見積もり依頼' }
