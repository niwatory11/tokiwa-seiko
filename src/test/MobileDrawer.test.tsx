import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SiteHeader } from '../components/layout/SiteHeader'

describe('SiteHeader / MobileDrawer', () => {
  it('メニューボタンでドロワーが開閉し、aria-expanded が切り替わる', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    const menuButton = screen.getByRole('button', { name: 'メニュー' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'メニュー' })).toBeInTheDocument()
  })

  it('Escape で閉じ、フォーカスがメニューボタンへ戻る', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    const menuButton = screen.getByRole('button', { name: 'メニュー' })
    await user.click(menuButton)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('開いたとき最初のフォーカス可能要素(閉じる)にフォーカスし、Tab が循環する', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    await user.click(screen.getByRole('button', { name: 'メニュー' }))
    const dialog = screen.getByRole('dialog')
    const closeButton = within(dialog).getByRole('button', { name: '閉じる' })
    expect(closeButton).toHaveFocus()

    // Shift+Tab で先頭から末尾(見積もり依頼リンク)へ循環する
    await user.tab({ shift: true })
    expect(
      within(dialog).getByRole('link', { name: '見積もり依頼' }),
    ).toHaveFocus()

    // Tab で末尾から先頭へ戻る
    await user.tab()
    expect(closeButton).toHaveFocus()
  })

  it('ナビリンクを選ぶとドロワーが閉じる', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    await user.click(screen.getByRole('button', { name: 'メニュー' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('link', { name: '設備' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('閉じると退場状態になり、アクセシビリティツリーから即座に消える', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    await user.click(screen.getByRole('button', { name: 'メニュー' }))
    await user.click(screen.getByRole('button', { name: '閉じる' }))

    // a11y ツリーからは即除外され、DOM にはまだ残っている
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const panel = document.getElementById('site-drawer')
    expect(panel).not.toBeNull()

    const overlay = panel!.parentElement
    expect(overlay).toHaveAttribute('data-exiting', 'true')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })

  it('パネルの animationend で完全にアンマウントされる', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    await user.click(screen.getByRole('button', { name: 'メニュー' }))
    await user.click(screen.getByRole('button', { name: '閉じる' }))

    const panel = document.getElementById('site-drawer')
    expect(panel).not.toBeNull()

    fireEvent.animationEnd(panel!)
    expect(document.getElementById('site-drawer')).toBeNull()
  })

  it('退場中に開き直すと即復帰する', async () => {
    const user = userEvent.setup()
    render(<SiteHeader />)

    const menuButton = screen.getByRole('button', { name: 'メニュー' })
    await user.click(menuButton)
    await user.click(screen.getByRole('button', { name: '閉じる' }))
    expect(document.getElementById('site-drawer')).not.toBeNull()

    // 退場アニメーションの途中で再オープン
    await user.click(menuButton)
    const dialog = screen.getByRole('dialog', { name: 'メニュー' })
    expect(dialog).toBeInTheDocument()
    expect(dialog.parentElement).not.toHaveAttribute('data-exiting')
  })

  it('animationend が来なくても保険タイマーでアンマウントされる', () => {
    vi.useFakeTimers()
    try {
      render(<SiteHeader />)

      // fake timers と userEvent は相性が悪いため、このテストのみ fireEvent を使う
      fireEvent.click(screen.getByRole('button', { name: 'メニュー' }))
      expect(document.getElementById('site-drawer')).not.toBeNull()

      fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
      expect(document.getElementById('site-drawer')).not.toBeNull()

      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(document.getElementById('site-drawer')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})
