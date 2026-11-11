import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * 入口(main.tsx)の最初の描画が、スクリプトの実行中に同期で DOM へ入ることを確かめる。
 *
 * 再読み込み・「戻る/進む」で読んでいた位置へ戻すのはブラウザの仕事で、
 * そのためには load イベントの時点で章(ページの高さ)が揃っている必要がある。
 * load は main.tsx の実行のあとに来るので、「実行が終わった時点で章がある」ことが
 * その条件になる。React 既定の描画(次のタスクへ回す)に戻すと、このテストが落ちる。
 */
describe('main(最初の描画)', () => {
  let root: HTMLDivElement

  beforeEach(() => {
    // index.html の <div id="root"></div> と同じ空の入れ物を置く
    root = document.createElement('div')
    root.id = 'root'
    document.body.append(root)
  })

  afterEach(() => {
    root.remove()
  })

  // main.tsx とその先(全コンポーネント・フォントの CSS)の読み込みがテストの中で起きるため、
  // 混んでいる環境では既定の 5 秒を超えることがある。待ち時間だけを延ばす
  it(
    'スクリプトの実行が終わった時点で、章がすでに DOM にある',
    { timeout: 30_000 },
    async () => {
      expect(root.childElementCount).toBe(0)

      await import('../main')

      // import の完了を待っただけで、タイマーや次のタスクは一度も挟んでいない
      expect(root.childElementCount).toBeGreaterThan(0)
      expect(document.getElementById('main')?.tagName).toBe('MAIN')
      expect(document.getElementById('equipment')?.tagName).toBe('SECTION')
    },
  )
})
