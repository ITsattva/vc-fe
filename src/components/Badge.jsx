// Small color-coded label for task status / priority enums.
// The CSS class is derived from the value, e.g. status DONE -> "badge status-DONE".
export default function Badge({ kind, value }) {
  if (!value) return <span className="muted">—</span>
  return (
    <span className={`badge ${kind}-${value}`}>{value.replace('_', ' ')}</span>
  )
}
