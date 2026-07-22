import type { QuoteErrors, QuoteField, QuoteValues } from './types'

/** 希望納期は最短7日後(見積回答2営業日+加工リードタイム) */
export const MIN_LEAD_DAYS = 7
/** 希望納期の上限は180日後 */
export const MAX_AHEAD_DAYS = 180

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** ローカル日付のまま YYYY-MM-DD に変換する(UTCずれを避ける) */
function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  next.setDate(next.getDate() + days)
  return next
}

/** input[type=date] の min 属性用 */
export function minDateString(today: Date): string {
  return toDateString(addDays(today, MIN_LEAD_DAYS))
}

/** input[type=date] の max 属性用 */
export function maxDateString(today: Date): string {
  return toDateString(addDays(today, MAX_AHEAD_DAYS))
}

/** YYYY-MM-DD をローカル日付として解釈する(new Date(string) のUTC解釈を避ける) */
function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

/**
 * 単一フィールドの検証。エラーメッセージ、問題なければ null を返す。
 * `today` を注入することで日付境界のテストを決定的にする。
 */
export function validateField(
  field: QuoteField,
  values: QuoteValues,
  today: Date,
): string | null {
  const value = values[field]

  switch (field) {
    case 'company': {
      if (value.trim() === '') return '会社名を入力してください'
      if (value.length > 60) return '会社名は60文字以内で入力してください'
      return null
    }
    case 'department': {
      if (value.length > 60) return '部署名は60文字以内で入力してください'
      return null
    }
    case 'name': {
      if (value.trim() === '') return 'ご担当者名を入力してください'
      if (value.length > 30) return 'ご担当者名は30文字以内で入力してください'
      return null
    }
    case 'email': {
      if (value.trim() === '') return 'メールアドレスを入力してください'
      if (!EMAIL_PATTERN.test(value)) {
        return 'メールアドレスの形式が正しくありません'
      }
      return null
    }
    case 'phone': {
      if (value.trim() === '') return '電話番号を入力してください'
      const digits = value.replace(/[-\s]/g, '')
      if (!/^0\d{9,10}$/.test(digits)) {
        return '電話番号は0から始まる10〜11桁で入力してください'
      }
      return null
    }
    case 'category': {
      if (value === '') return 'ご相談の区分を選択してください'
      return null
    }
    case 'material': {
      if (value === '') return '材質を選択してください(不明の場合は「その他・不明」)'
      return null
    }
    case 'deadline': {
      if (value === '') return 'ご希望納期を入力してください'
      const date = parseLocalDate(value)
      if (!date) return 'ご希望納期の形式が正しくありません'
      const min = addDays(today, MIN_LEAD_DAYS)
      const max = addDays(today, MAX_AHEAD_DAYS)
      if (date.getTime() < min.getTime()) {
        return `ご希望納期は${MIN_LEAD_DAYS}日後(${toDateString(min)})以降でご指定ください`
      }
      if (date.getTime() > max.getTime()) {
        return `ご希望納期は${MAX_AHEAD_DAYS}日後(${toDateString(max)})まででご指定ください`
      }
      return null
    }
    case 'details': {
      if (value.trim() === '') return 'ご依頼内容を入力してください'
      if (value.length > 600) return 'ご依頼内容は600文字以内で入力してください'
      return null
    }
  }
}

/** 全フィールドを検証し、エラーのあるフィールドだけを持つオブジェクトを返す */
export function validateAll(values: QuoteValues, today: Date): QuoteErrors {
  const errors: QuoteErrors = {}
  for (const field of Object.keys(values) as QuoteField[]) {
    const message = validateField(field, values, today)
    if (message) errors[field] = message
  }
  return errors
}
