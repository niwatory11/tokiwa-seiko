import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuoteForm } from '../features/quote/QuoteForm'

/** jsdom 実行時の「今日」から相対で有効な納期(YYYY-MM-DD)を作る */
function validDeadline(daysAhead = 30): string {
  const date = new Date()
  date.setDate(date.getDate() + daysAhead)
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/会社名/), '株式会社サンプル製作所')
  await user.type(screen.getByLabelText(/ご担当者名/), '山田 太郎')
  await user.type(
    screen.getByLabelText(/メールアドレス/),
    'taro.yamada@example.co.jp',
  )
  await user.type(screen.getByLabelText(/電話番号/), '03-1234-5678')
  await user.selectOptions(screen.getByLabelText(/ご相談の区分/), 'prototype')
  await user.selectOptions(screen.getByLabelText(/材質/), 'aluminum')
  // type=date は fireEvent 相当の直接入力が確実
  const deadline = screen.getByLabelText(/ご希望納期/)
  await user.clear(deadline)
  await user.type(deadline, validDeadline())
  await user.type(
    screen.getByLabelText(/ご依頼内容/),
    'アルミ製ブラケットの試作を2個お願いします。',
  )
}

describe('QuoteForm', () => {
  it('必須項目に required とアクセシブルな注記が付いている', () => {
    render(<QuoteForm />)
    for (const label of [
      /会社名/,
      /ご担当者名/,
      /メールアドレス/,
      /電話番号/,
      /ご相談の区分/,
      /材質/,
      /ご希望納期/,
      /ご依頼内容/,
    ]) {
      expect(screen.getByLabelText(label)).toBeRequired()
    }
    expect(screen.getByLabelText(/部署名/)).not.toBeRequired()
  })

  it('空のまま送信するとエラーサマリーが出て最初の項目へフォーカスする', async () => {
    const user = userEvent.setup()
    render(<QuoteForm />)

    await user.click(screen.getByRole('button', { name: '入力内容を確認する' }))

    const summary = screen.getByRole('alert')
    expect(summary).toHaveTextContent('8件の不備')
    expect(screen.getByLabelText(/会社名/)).toHaveFocus()
    expect(screen.getByLabelText(/会社名/)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('サマリーのリンクで該当フィールドへフォーカスが移る', async () => {
    const user = userEvent.setup()
    render(<QuoteForm />)

    await user.click(screen.getByRole('button', { name: '入力内容を確認する' }))
    const summary = screen.getByRole('alert')
    await user.click(
      within(summary).getByRole('link', { name: /メールアドレス/ }),
    )
    expect(screen.getByLabelText(/メールアドレス/)).toHaveFocus()
  })

  it('blur 時に単項目のエラーが表示され、修正すると消える', async () => {
    const user = userEvent.setup()
    render(<QuoteForm />)

    const email = screen.getByLabelText(/メールアドレス/)
    await user.type(email, 'broken')
    await user.tab()
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(
      screen.getByText('メールアドレスの形式が正しくありません'),
    ).toBeInTheDocument()

    await user.clear(email)
    await user.type(email, 'taro@example.co.jp')
    expect(email).toHaveAttribute('aria-invalid', 'false')
  })

  it('すべて正しく入力して送信するとデモ完了メッセージに置き換わる', async () => {
    const user = userEvent.setup()
    render(<QuoteForm />)

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: '入力内容を確認する' }))

    const done = screen.getByRole('status')
    expect(done).toHaveTextContent('見積もりフォームのデモが完了しました')
    expect(done).toHaveTextContent('保存・送信されていません')
    expect(
      screen.queryByRole('button', { name: '入力内容を確認する' }),
    ).not.toBeInTheDocument()
  })
})
