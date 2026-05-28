type FavoriteStarButtonProps = {
  isActive: boolean
  canFavorite: boolean
  disabled?: boolean
  onToggle: () => void
}

export function FavoriteStarButton({ isActive, canFavorite, disabled = false, onToggle }: FavoriteStarButtonProps) {
  const isDisabled = !canFavorite || disabled

  return (
    <button
      aria-disabled={isDisabled}
      aria-label={isActive ? 'Desfavoritar político' : 'Favoritar político'}
      className={`favorite-star ${isActive ? 'active' : ''} ${!canFavorite ? 'disabled' : ''}`}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()

        if (isDisabled) {
          return
        }

        onToggle()
      }}
      title={canFavorite ? 'Favoritar político' : 'Faça login para favoritar'}
      type="button"
    >
      {isActive ? '★' : '☆'}
    </button>
  )
}
