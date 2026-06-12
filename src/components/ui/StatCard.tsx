// A small labelled stat block (e.g. "80%" / "of world trade carried by ships"). Quiet by
// design — these set the stakes in Act 1, they aren't the punchline.
interface StatCardProps {
  value: string
  label: string
  note?: string
}

export default function StatCard({ value, label, note }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {note && <div className="stat-card__note">{note}</div>}
    </div>
  )
}
