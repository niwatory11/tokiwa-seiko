import { StrictMode } from 'react'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
