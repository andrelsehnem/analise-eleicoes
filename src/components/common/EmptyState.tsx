type EmptyStateProps = {
  icon: string
  message: string
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      {message}
    </div>
  )
}
