type LoaderProps = {
  message?: string
}

export function Loader({ message = 'Consultando API da Câmara...' }: LoaderProps) {
  return (
    <div className="loader">
      <div className="loader-ring" />
      <div className="loader-text">{message}</div>
    </div>
  )
}
