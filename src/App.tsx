import './App.css'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './components/pages/LandingPage'
import { StateSelectionPage } from './components/pages/StateSelectionPage'
import { DeputiesListPage } from './components/pages/DeputiesListPage'
import { DeputyDetailPage } from './components/pages/DeputyDetailPage'
import { PresidentsListPage } from './components/pages/PresidentsListPage'
import { PresidentDetailPage } from './components/pages/PresidentDetailPage'
import { SobrePage } from './components/pages/SobrePage'
import { NotFoundPage } from './components/pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout showStepsNav={false}>
            <LandingPage />
          </AppLayout>
        }
      />
      <Route
        path="/por-estado"
        element={
          <AppLayout showStepsNav={true}>
            <StateSelectionPage />
          </AppLayout>
        }
      />
      <Route
        path="/por-estado/:uf/deputado-federal"
        element={
          <AppLayout showStepsNav={true}>
            <DeputiesListPage />
          </AppLayout>
        }
      />
      <Route
        path="/por-estado/:uf/deputado-federal/:deputyId"
        element={
          <AppLayout showStepsNav={true}>
            <DeputyDetailPage />
          </AppLayout>
        }
      />
      <Route
        path="/presidente"
        element={
          <AppLayout showStepsNav={false}>
            <PresidentsListPage />
          </AppLayout>
        }
      />
      <Route
        path="/presidente/:presidentId"
        element={
          <AppLayout showStepsNav={false}>
            <PresidentDetailPage />
          </AppLayout>
        }
      />
      <Route
        path="/sobre"
        element={
          <AppLayout showStepsNav={false}>
            <SobrePage />
          </AppLayout>
        }
      />
      <Route
        path="*"
        element={
          <AppLayout showStepsNav={false}>
            <NotFoundPage />
          </AppLayout>
        }
      />
    </Routes>
  )
}

export default App