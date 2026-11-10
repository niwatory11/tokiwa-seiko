import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Equipment } from '../components/sections/Equipment'
import { Services } from '../components/sections/Services'
import { envelopes, equipmentList } from '../data/equipment'
import { services } from '../data/services'

describe('加工範囲の比較図', () => {
  it('図に描く設備は、設備一覧にある設備で、寸法も一覧の主要仕様と食い違わない', () => {
    for (const envelope of envelopes) {
      const name = envelope.nameParts.join('')
      const listed = equipmentList.find((equipment) => equipment.name === name)
      expect(listed, `${name} が設備一覧にない`).toBeDefined()

      // 一覧の「φ600×400mm」「1,000×500×500mm」から数字を取り出し、図の幅と高さが含まれることを確かめる
      const numbers = (listed?.spec.match(/[\d,]+/g) ?? []).map((value) =>
        Number(value.replaceAll(',', '')),
      )
      expect(numbers).toContain(envelope.width)
      expect(numbers).toContain(envelope.height)
    }
  })

  it('各設備の名前と寸法が文字で読め、図そのものは読み上げから外れている', () => {
    render(<Equipment />)

    const chart = screen
      .getByRole('heading', { level: 3, name: '加工範囲の比較' })
      .closest('figure')
    expect(chart).not.toBeNull()

    const items = within(chart as HTMLElement).getAllByRole('listitem')
    expect(items).toHaveLength(envelopes.length)

    for (const [index, envelope] of envelopes.entries()) {
      const item = items[index]
      expect(
        within(item).getByRole('heading', {
          level: 4,
          name: envelope.nameParts.join(''),
        }),
      ).toBeInTheDocument()
      for (const part of envelope.dims) {
        expect(item).toHaveTextContent(part)
      }
      expect(item.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull()
    }
  })

  it('いちばん広い設備の図が列幅いっぱいになり、ほかは幅の比で小さくなる(同じ縮尺)', () => {
    render(<Equipment />)
    const widest = Math.max(...envelopes.map((envelope) => envelope.width))
    const shapes = [
      ...document.querySelectorAll<SVGSVGElement>('figure li svg'),
    ]
    expect(shapes).toHaveLength(envelopes.length)
    for (const [index, envelope] of envelopes.entries()) {
      expect(shapes[index].style.width).toBe(
        `${(envelope.width / widest) * 100}%`,
      )
    }
  })
})

describe('対応加工の略図', () => {
  it('加工ごとに略図が一つ付き、装飾として読み上げから外れている', () => {
    render(<Services />)
    const list = screen.getByRole('heading', { level: 2, name: '対応加工' })
      .parentElement?.parentElement
    const icons = [...(list?.querySelectorAll('li svg') ?? [])]
    expect(icons).toHaveLength(services.length)
    for (const icon of icons) {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    }
  })
})
