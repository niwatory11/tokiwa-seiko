import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from '../components/layout/SiteFooter'

describe('SiteFooter', () => {
  it('IntersectionObserver 非対応環境では即座に可視になる', () => {
    const { container } = render(<SiteFooter />)

    const inner = container.querySelector('[data-visible]')
    expect(inner).not.toBeNull()
    expect(inner).toHaveAttribute('data-visible', 'true')
  })

  it('ナビリンク6件と架空企業の注記を表示する', () => {
    render(<SiteFooter />)

    const nav = screen.getByRole('navigation', {
      name: 'フッターナビゲーション',
    })
    expect(within(nav).getAllByRole('link')).toHaveLength(6)
    expect(screen.getByText(/架空企業のコンセプトサイト/)).toBeInTheDocument()
  })
})
