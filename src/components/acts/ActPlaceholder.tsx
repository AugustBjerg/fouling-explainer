// Temporary stand-in for Acts 1 and 3 while August decides their content. Renders NO copy
// and NO scrim — just a small corner tag — so the hull section behind is fully visible.
// The real copy still lives in Act1Problem.tsx / Act3Implications.tsx for when we return.
interface ActPlaceholderProps {
  label: string
}

export default function ActPlaceholder({ label }: ActPlaceholderProps) {
  return (
    <div className="act-placeholder">
      <span className="act-placeholder__tag">{label} — placeholder (content TBD)</span>
    </div>
  )
}
