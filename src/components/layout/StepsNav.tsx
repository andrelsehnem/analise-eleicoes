import { AppButton } from '../common/AppButton'
import type { Panel, StateItem } from '../../types/camara'

type StepsNavProps = {
  panel: Panel
  selectedState: StateItem | null
  selectedDeputyName: string | null
  loadingDetail: boolean
  onGoToStates: () => void
  onGoToDeputies: () => void
}

export function StepsNav({
  panel,
  selectedState,
  selectedDeputyName,
  loadingDetail,
  onGoToStates,
  onGoToDeputies,
}: StepsNavProps) {
  const step1Class = panel === 'states' ? 'step active' : 'step done'
  const step2Class = panel === 'deputies' ? 'step active' : selectedDeputyName ? 'step done' : 'step'
  const step3Class = panel === 'detail' ? 'step active' : 'step'

  return (
    <div className="steps-nav">
      <AppButton className={step1Class} id="step1" type="button" onClick={onGoToStates}>
        <div className="step-num">1</div>
        <div className="step-info">
          <div className="step-label">Selecione</div>
          <div className="step-val">{selectedState?.uf || 'Estado'}</div>
        </div>
      </AppButton>

      <AppButton
        className={step2Class}
        id="step2"
        type="button"
        onClick={onGoToDeputies}
        disabled={!selectedState}
      >
        <div className="step-num">2</div>
        <div className="step-info">
          <div className="step-label">Escolha</div>
          <div className="step-val">
            {selectedDeputyName
              ? selectedDeputyName.split(' ').slice(0, 2).join(' ')
              : 'Deputado'}
          </div>
        </div>
      </AppButton>

      <div className={step3Class} id="step3">
        <div className="step-num">3</div>
        <div className="step-info">
          <div className="step-label">Analise</div>
          <div className="step-val">
            {panel === 'detail' && loadingDetail ? 'Carregando...' : 'Mandato'}
          </div>
        </div>
      </div>
    </div>
  )
}
