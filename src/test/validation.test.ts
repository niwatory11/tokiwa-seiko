import { describe, expect, it } from 'vitest'
import { emptyQuoteValues } from '../features/quote/types'
import type { QuoteValues } from '../features/quote/types'
import {
  MAX_AHEAD_DAYS,
  MIN_LEAD_DAYS,
  maxDateString,
  minDateString,
  validateAll,
  validateField,
} from '../features/quote/validation'

/** テスト基準日: 2026-07-20(月)。日付境界を決定的に検証する */
const TODAY = new Date(2026, 6, 20)

function valid(overrides: Partial<QuoteValues> = {}): QuoteValues {
  return {
    ...emptyQuoteValues,
    company: '株式会社サンプル製作所',
    department: '開発部',
    name: '山田 太郎',
    email: 'taro.yamada@example.co.jp',
    phone: '03-1234-5678',
    category: 'prototype',
    material: 'aluminum',
    deadline: '2026-08-20',
    details: 'アルミ製ブラケットの試作を2個お願いしたいです。',
    ...overrides,
  }
}

describe('validateField: 必須と文字数', () => {
  it('会社名・担当者名・依頼内容が空ならエラーになる', () => {
    const values = valid({ company: '', name: '', details: '' })
    expect(validateField('company', values, TODAY)).toMatch('会社名')
    expect(validateField('name', values, TODAY)).toMatch('ご担当者名')
    expect(validateField('details', values, TODAY)).toMatch('ご依頼内容')
  })

  it('空白だけの入力は未入力として扱う', () => {
    const values = valid({ company: '   ' })
    expect(validateField('company', values, TODAY)).not.toBeNull()
  })

  it('部署名は任意(空でもエラーにならない)', () => {
    const values = valid({ department: '' })
    expect(validateField('department', values, TODAY)).toBeNull()
  })

  it('文字数上限を超えるとエラーになる', () => {
    expect(
      validateField('company', valid({ company: 'あ'.repeat(61) }), TODAY),
    ).toMatch('60文字')
    expect(
      validateField('details', valid({ details: 'あ'.repeat(601) }), TODAY),
    ).toMatch('600文字')
  })
})

describe('validateField: メールアドレスと電話番号', () => {
  it('メール形式が不正ならエラーになる', () => {
    for (const email of ['taro', 'taro@', 'taro@example', '@example.com']) {
      expect(validateField('email', valid({ email }), TODAY)).not.toBeNull()
    }
    expect(
      validateField('email', valid({ email: 'a@b.co' }), TODAY),
    ).toBeNull()
  })

  it('電話番号はハイフン許容の10〜11桁', () => {
    expect(validateField('phone', valid({ phone: '0312345678' }), TODAY)).toBeNull()
    expect(
      validateField('phone', valid({ phone: '090-1234-5678' }), TODAY),
    ).toBeNull()
    expect(validateField('phone', valid({ phone: '123-4567' }), TODAY)).not.toBeNull()
    expect(
      validateField('phone', valid({ phone: '03-1234-56789012' }), TODAY),
    ).not.toBeNull()
  })
})

describe('validateField: 希望納期の境界', () => {
  it('7日後(最短)は受け付け、6日後は拒否する', () => {
    // TODAY=7/20 → 最短は 7/27
    expect(
      validateField('deadline', valid({ deadline: '2026-07-27' }), TODAY),
    ).toBeNull()
    expect(
      validateField('deadline', valid({ deadline: '2026-07-26' }), TODAY),
    ).toMatch(`${MIN_LEAD_DAYS}日後`)
  })

  it('180日後(上限)は受け付け、181日後は拒否する', () => {
    // TODAY=7/20 → 上限は 2027-01-16
    expect(
      validateField('deadline', valid({ deadline: '2027-01-16' }), TODAY),
    ).toBeNull()
    expect(
      validateField('deadline', valid({ deadline: '2027-01-17' }), TODAY),
    ).toMatch(`${MAX_AHEAD_DAYS}日後`)
  })

  it('存在しない日付は形式エラーになる', () => {
    expect(
      validateField('deadline', valid({ deadline: '2026-02-30' }), TODAY),
    ).toMatch('形式')
  })

  it('min/max 属性用の文字列が境界と一致する', () => {
    expect(minDateString(TODAY)).toBe('2026-07-27')
    expect(maxDateString(TODAY)).toBe('2027-01-16')
  })
})

describe('validateAll', () => {
  it('すべて正しければ空オブジェクトを返す', () => {
    expect(validateAll(valid(), TODAY)).toEqual({})
  })

  it('不正な項目だけを列挙する', () => {
    const errors = validateAll(valid({ email: 'broken', category: '' }), TODAY)
    expect(Object.keys(errors).sort()).toEqual(['category', 'email'])
  })

  it('空フォームでは任意項目(部署名)以外がエラーになる', () => {
    const errors = validateAll(emptyQuoteValues, TODAY)
    expect(errors.department).toBeUndefined()
    expect(Object.keys(errors)).toHaveLength(8)
  })
})
