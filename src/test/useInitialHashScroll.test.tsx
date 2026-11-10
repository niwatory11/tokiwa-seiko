import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App'
import { findHashTarget } from '../hooks/useInitialHashScroll'

type ScrollCall = {
  element: Element
  options: boolean | ScrollIntoViewOptions | undefined
}

let calls: ScrollCall[] = []

/** 開いたときの URL を「いまのパス + hash」にする */
function openWith(hash: string) {
  window.history.replaceState(null, '', `${window.location.pathname}${hash}`)
}

beforeEach(() => {
  calls = []
  // jsdom は scrollIntoView を実装していないため、呼び出しを記録するスタブを置く
  Element.prototype.scrollIntoView = function (
    this: Element,
    options?: boolean | ScrollIntoViewOptions,
  ) {
    calls.push({ element: this, options })
  }
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  openWith('')
})

describe('URL に #章のid を付けて開いたとき', () => {
  it('その章(設備)まで、なめらかに動かさず即座に移動する', () => {
    openWith('#equipment')
    render(<App />)

    expect(calls).toHaveLength(1)
    expect(calls[0].element).toBe(document.getElementById('equipment'))
    expect(calls[0].element.tagName).toBe('SECTION')
    // html の scroll-behavior: smooth に引きずられないよう instant を明示する
    expect(calls[0].options).toEqual({ behavior: 'instant', block: 'start' })
  })

  it('移動は最初の描画のあと一度だけで、再描画では繰り返さない', () => {
    openWith('#equipment')
    const { rerender } = render(<App />)
    rerender(<App />)

    expect(calls).toHaveLength(1)
  })

  it('hash がなければ動かさない', () => {
    render(<App />)

    expect(calls).toHaveLength(0)
  })

  it.each(['#', '#no-such-id', '#%E0%A4%A', '#%'])(
    '存在しない id・不正な hash(%s)でもエラーにならず、動かさない',
    (hash) => {
      openWith(hash)

      expect(() => render(<App />)).not.toThrow()
      expect(calls).toHaveLength(0)
    },
  )

  it.each(['reload', 'back_forward'] as const)(
    '再読み込み・戻る/進む(%s)で、ブラウザが読んでいた位置を復元済みなら動かさない',
    (type) => {
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        { type } as PerformanceNavigationTiming,
      ])
      vi.stubGlobal('scrollY', 1200)
      openWith('#equipment')
      render(<App />)

      expect(calls).toHaveLength(0)
    },
  )

  it('再読み込みでも、位置が復元されず先頭のままなら章まで移動する', () => {
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
      { type: 'reload' } as PerformanceNavigationTiming,
    ])
    openWith('#equipment')
    render(<App />)

    expect(calls).toHaveLength(1)
    expect(calls[0].element).toBe(document.getElementById('equipment'))
  })
})

describe('findHashTarget', () => {
  it('パーセントエンコードされた id も、そのままの id も探せる', () => {
    const element = document.createElement('div')
    element.id = '設備'
    document.body.append(element)

    try {
      expect(findHashTarget('#%E8%A8%AD%E5%82%99')).toBe(element)
      expect(findHashTarget('#設備')).toBe(element)
    } finally {
      element.remove()
    }
  })

  it('デコードできない文字列でも、その形の id があれば見つける', () => {
    const element = document.createElement('div')
    element.id = '100%'
    document.body.append(element)

    try {
      expect(findHashTarget('#100%')).toBe(element)
    } finally {
      element.remove()
    }
  })
})
