// App entry point: applies the design tokens as CSS variables, mounts <App/> into #root,
// and loads the global dark theme.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './styles/global.css'
import { applyThemeVars } from './theme'
import App from './App'

applyThemeVars() // write --color-*, --space-*, … onto :root before first paint

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Vercel Web Analytics: cookieless, first-party visit/referrer stats (no-op off Vercel).
        A deliberate, approved exception to the "no live analytics" guardrail — see docs/memory.md. */}
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
