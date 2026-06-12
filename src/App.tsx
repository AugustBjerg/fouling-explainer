// Root component. Will hold the tiny app state (currentAct, daysSinceCleaning,
// prefersReducedMotion — see docs/structure.md) and render the active act plus the
// persistent hull. For now it renders a near-empty placeholder so the scaffold runs.
// TODO: build the three acts + persistent hull (see docs/structure.md).
export default function App() {
  return (
    <main className="app-shell">
      <h1>Fouling Explainer</h1>
      <p>Scaffold is live. The three-act experience gets built here.</p>
    </main>
  )
}
