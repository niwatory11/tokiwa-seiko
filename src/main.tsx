import { StrictMode } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

// セルフホストフォント(unicode-rangeスライス配信)
import '@fontsource/ibm-plex-sans-jp/400.css'
import '@fontsource/ibm-plex-sans-jp/500.css'
import '@fontsource/ibm-plex-sans-jp/700.css'
// 等幅書体は英数字・記号にだけ使うため、不要なキリル文字等は配信しない
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-600.css'

import './styles/global.css'
import App from './App.tsx'

const root = createRoot(document.getElementById('root')!)

// 最初の描画は、このスクリプトの実行中に同期で DOM へ入れる(flushSync)。
//
// React は既定では描画を次のタスクへ回すため、その前に load イベントが済んでしまう。
// load の後、章がまだ無い(高さの無い)文書でレイアウトが走ると、ブラウザは
// 再読み込み・「戻る/進む」で戻すはずの位置を 0 に切り詰め、以後やり直さない
// (読んでいた位置ではなく先頭になる)。
// このスクリプトは遅延実行(type="module")で、load は必ずその実行のあとに来る。
// 実行中に描画を終えておけば load の時点で章が揃い、素の HTML と同じく
// ブラウザ本来の位置の復元がそのまま働く。
flushSync(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
