import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App(スモークテスト)', () => {
  it('h1 がひとつだけあり、主要セクションの見出しが揃っている', () => {
    render(<App />)

    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent('0.01mmを、あたりまえに。')

    for (const name of [
      '対応加工',
      '設備',
      '品質保証',
      '加工例',
      '会社概要',
      '見積もり依頼',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name }),
      ).toBeInTheDocument()
    }
  })

  it('スキップリンクと main ランドマークがある', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: '本文へスキップ' })).toHaveAttribute(
      'href',
      '#main',
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('架空企業である旨の注記がヒーロー(表題欄)とフッターの両方にある', () => {
    render(<App />)
    const notes = screen.getAllByText(/架空企業のコンセプトサイト/)
    expect(notes.length).toBeGreaterThanOrEqual(2)
  })
})
