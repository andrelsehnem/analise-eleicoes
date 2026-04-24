import './App.css'
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Loader } from './components/common/Loader'

const LandingPage = lazy(async () => ({
  default: (await import('./components/pages/LandingPage')).LandingPage,
}))
const StateSelectionPage = lazy(async () => ({
  default: (await import('./components/pages/StateSelectionPage')).StateSelectionPage,
}))
const DeputiesListPage = lazy(async () => ({
  default: (await import('./components/pages/DeputiesListPage')).DeputiesListPage,
}))
const SenatorsListPage = lazy(async () => ({
  default: (await import('./components/pages/SenatorsListPage')).SenatorsListPage,
}))
const DeputyDetailPage = lazy(async () => ({
  default: (await import('./components/pages/DeputyDetailPage')).DeputyDetailPage,
}))
const SenatorDetailPage = lazy(async () => ({
  default: (await import('./components/pages/SenatorDetailPage')).SenatorDetailPage,
}))
const PresidentsListPage = lazy(async () => ({
  default: (await import('./components/pages/PresidentsListPage')).PresidentsListPage,
}))
const PresidentDetailPage = lazy(async () => ({
  default: (await import('./components/pages/PresidentDetailPage')).PresidentDetailPage,
}))
const SobrePage = lazy(async () => ({
  default: (await import('./components/pages/SobrePage')).SobrePage,
}))
const SugestoesPage = lazy(async () => ({
  default: (await import('./components/pages/SugestoesPage')).SugestoesPage,
}))
const NotFoundPage = lazy(async () => ({
  default: (await import('./components/pages/NotFoundPage')).NotFoundPage,
}))

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout showStepsNav={false}>
            <Suspense fallback={<Loader />}>
              <LandingPage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/por-estado"
        element={
          <AppLayout showStepsNav={true}>
            <Suspense fallback={<Loader />}>
              <StateSelectionPage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/por-estado/:uf/deputado-federal"
        element={
          <AppLayout showStepsNav={true}>
            <Suspense fallback={<Loader />}>
              <DeputiesListPage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/senadores/:uf"
        element={
          <AppLayout showStepsNav={true}>
            <Suspense fallback={<Loader />}>
              <SenatorsListPage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/por-estado/:uf/deputado-federal/:deputyId"
        element={
          <AppLayout showStepsNav={true}>
            <Suspense fallback={<Loader />}>
              <DeputyDetailPage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/senador/:senatorId"
        element={
          <AppLayout showStepsNav={true}>
            <Suspense fallback={<Loader />}>
              <SenatorDetailPage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/presidente"
        element={
          <AppLayout showStepsNav={false}>
            <Suspense fallback={<Loader />}>
              <PresidentsListPage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/presidente/:presidentId"
        element={
          <AppLayout showStepsNav={false}>
            <Suspense fallback={<Loader />}>
              <PresidentDetailPage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/sobre"
        element={
          <AppLayout showStepsNav={false}>
            <Suspense fallback={<Loader />}>
              <SobrePage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="/sugestoes"
        element={
          <AppLayout showStepsNav={false}>
            <Suspense fallback={<Loader />}>
              <SugestoesPage />
            </Suspense>
          </AppLayout>
        }
      />
      <Route
        path="*"
        element={
          <AppLayout showStepsNav={false}>
            <Suspense fallback={<Loader />}>
              <NotFoundPage />
            </Suspense>
          </AppLayout>
        }
      />
    </Routes>
  )
}

export default App