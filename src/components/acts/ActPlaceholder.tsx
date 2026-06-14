// Temporary stand-in for Act 3 while August decides its content. Renders NO copy and NO scrim
// — just a small corner tag — so the hull section behind is fully visible. With the bottom
// control bar gone, it carries a single "Back" CTA so the visitor can still return to Act 2.
// The real copy still lives in Act3Implications.tsx for when we return.
interface ActPlaceholderProps {
  label: string
  /** Step back to the previous act (each act carries its own nav now). */
  onBack?: () => void
}

export default function ActPlaceholder({ label, onBack }: ActPlaceholderProps) {
  return (
    <div className="act-placeholder">
      <span className="act-placeholder__tag">{label} — placeholder (content TBD)</span>
      {onBack && (
        <button type="button" className="cta-link cta-link--ghost act-placeholder__back" onClick={onBack}>
          ← Back
        </button>
      )}
    </div>
  )
}
