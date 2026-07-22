import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// セルフホストフォント(unicode-rangeスライス配信)
import '@fontsource/ibm-plex-sans-jp/400.css'
import '@fontsource/ibm-plex-sans-jp/500.css'
import '@fontsource/ibm-plex-sans-jp/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/600.css'

import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
