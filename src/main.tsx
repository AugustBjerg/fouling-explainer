// App entry point: applies the design tokens as CSS variables, mounts <App/> into #root,
// and loads the global dark theme.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { applyThemeVars } from './theme'
import App from './App'

applyThemeVars() // write --color-*, --space-*, … onto :root before first paint

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
