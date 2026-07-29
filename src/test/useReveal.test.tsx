import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useReveal } from '../hooks/useReveal'

function RevealProbe() {
  const { ref, isVisible } = useReveal<HTMLDivElement>()
  return <div ref={ref} data-visible={String(isVisible)} />
}

function matchMediaStub(matches: boolean) {
  return (query: string): MediaQueryList =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'IntersectionObserver')
})

describe('useReveal', () => {
  it('IntersectionObserver 非対応環境では即座に可視になる', () => {
    Reflect.deleteProperty(globalThis, 'IntersectionObserver')

    const { container } = render(<RevealProbe />)

    expect(container.firstElementChild).toHaveAttribute('data-visible', 'true')
  })

  it('reduced-motion 環境では即座に可視になる', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = matchMediaStub(true)

    try {
      const { container } = render(<RevealProbe />)

      expect(container.firstElementChild).toHaveAttribute('data-visible', 'true')
    } finally {
      window.matchMedia = originalMatchMedia
    }
  })

  it('IntersectionObserver 環境では交差するまで不可視で、交差後に監視を解除する', () => {
    let observerCallback: IntersectionObserverCallback | undefined

    class MockIntersectionObserver {
      static readonly observeMock = vi.fn()
      static readonly unobserveMock = vi.fn()

      readonly root = null
      readonly rootMargin = ''
      readonly thresholds = []
      readonly disconnect = vi.fn()
      readonly observe = MockIntersectionObserver.observeMock
      readonly takeRecords = vi.fn(() => [])
      readonly unobserve = MockIntersectionObserver.unobserveMock

      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
      }
    }

    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver

    const { container } = render(<RevealProbe />)
    const element = container.firstElementChild as HTMLDivElement

    expect(element).toHaveAttribute('data-visible', 'false')
    expect(MockIntersectionObserver.observeMock).toHaveBeenCalledWith(element)

    const callback = observerCallback as IntersectionObserverCallback
    act(() => {
      callback(
        [
          {
            isIntersecting: true,
            target: element,
          } as unknown as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      )
    })

    expect(element).toHaveAttribute('data-visible', 'true')
    expect(MockIntersectionObserver.unobserveMock).toHaveBeenCalledWith(element)
  })
})
