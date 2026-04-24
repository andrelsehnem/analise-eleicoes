import { NotFoundPanel } from '../panels/NotFoundPanel/NotFoundPanel'
import { SeoHead } from '../common/SeoHead'

export function NotFoundPage() {
  return (
    <>
      <SeoHead
        title="Página não encontrada"
        description="A página solicitada não foi encontrada. Volte ao início para continuar a consulta de representantes."
        robots="noindex,nofollow"
      />
      <NotFoundPanel />
    </>
  )
}
