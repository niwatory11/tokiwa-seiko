import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SiteHeader } from '../components/layout/SiteHeader'
import { useScrollSpy } from '../hooks/useScrollSpy'

const sectionIds = ['services', 'equipment', 'quality', 'works', 'company'] as const

type MockObserverInstance = {
  callback: IntersectionObserverCallback
  observe: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
}

/** IntersectionObserver をこのファイル内だけでモックし、生成されたインスタンス列を返す */
function installIntersectionObserverMock(): MockObserverInstance[] {
  const instances: MockObserverInstance[] = []

  class MockIntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds = []
    readonly observe = vi.fn()
    readonly unobserve = vi.fn()
    readonly disconnect = vi.fn()
    readonly takeRecords = vi.fn(() => [])

    constructor(callback: IntersectionObserverCallback) {
      instances.push({ callback, observe: this.observe, disconnect: this.disconnect })
    }
  }

  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver

  return instances
}

/** id と交差状態の組から IO エントリを組み立ててコールバックを発火する */
function emit(instance: MockObserverInstance, entries: readonly [string, boolean][]) {
  act(() => {
    instance.callback(
      entries.map(
        ([id, isIntersecting]) =>
          ({
            isIntersecting,
            target: document.getElementById(id) as Element,
          }) as unknown as IntersectionObserverEntry,
      ),
      {} as IntersectionObserver,
    )
  })
}

/** フック単体の観測用。判定対象の空セクションを同時にレンダーする */
function ScrollSpyProbe({ ids = sectionIds }: { ids?: readonly string[] }) {
  const activeId = useScrollSpy(ids)

  return (
    <>
      <p data-testid="active">{activeId ?? 'none'}</p>
      {ids.map((id) => (
        <div key={id} id={id} />
      ))}
    </>
  )
}

function activeText() {
  return screen.getByTestId('active').textContent
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'IntersectionObserver')
})

describe('useScrollSpy', () => {
  it('IntersectionObserver 非対応環境では常に null を返す', () => {
    Reflect.deleteProperty(globalThis, 'IntersectionObserver')

    render(<ScrollSpyProbe />)

    expect(activeText()).toBe('none')
  })

  it('交差エントリで activeId が切り替わる', () => {
    const instances = installIntersectionObserverMock()

    render(<ScrollSpyProbe />)
    const observer = instances[0]
    expect(observer.observe).toHaveBeenCalledTimes(sectionIds.length)

    emit(observer, [['services', true]])
    expect(activeText()).toBe('services')

    // 離脱と進入が同一バッチで届くケース
    emit(observer, [
      ['services', false],
      ['equipment', true],
    ])
    expect(activeText()).toBe('equipment')
  })

  it('どのセクションも交差していなければ null に戻る', () => {
    const instances = installIntersectionObserverMock()

    render(<ScrollSpyProbe />)
    const observer = instances[0]

    emit(observer, [['services', true]])
    expect(activeText()).toBe('services')

    emit(observer, [['services', false]])
    expect(activeText()).toBe('none')
  })

  it('複数セクションが同時に交差する場合は文書順で後のものを優先する', () => {
    const instances = installIntersectionObserverMock()

    render(<ScrollSpyProbe />)
    const observer = instances[0]

    // エントリの順序に依存せず、sectionIds の並び(文書順)で後の equipment が勝つ
    emit(observer, [
      ['equipment', true],
      ['services', true],
    ])
    expect(activeText()).toBe('equipment')
  })

  it('unmount で observer を disconnect する', () => {
    const instances = installIntersectionObserverMock()

    const { unmount } = render(<ScrollSpyProbe />)
    const observer = instances[0]
    expect(observer.disconnect).not.toHaveBeenCalled()

    unmount()

    expect(observer.disconnect).toHaveBeenCalledTimes(1)
  })
})

describe('SiteHeader の scroll-spy 表示', () => {
  it('閲覧中セクションのナビリンクだけに aria-current="location" が付く', () => {
    const instances = installIntersectionObserverMock()

    render(
      <>
        <SiteHeader />
        {sectionIds.map((id) => (
          <div key={id} id={id} />
        ))}
      </>,
    )

    emit(instances[0], [['services', true]])

    expect(screen.getByRole('link', { name: '対応加工' })).toHaveAttribute(
      'aria-current',
      'location',
    )
    for (const label of ['設備', '品質保証', '加工例', '会社概要']) {
      expect(screen.getByRole('link', { name: label })).not.toHaveAttribute('aria-current')
    }
  })
})
