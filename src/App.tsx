import './App.css'
import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './components/pages/LandingPage'
import { StateSelectionPage } from './components/pages/StateSelectionPage'
import { DeputiesListPage } from './components/pages/DeputiesListPage'
import { DeputyDetailPage } from './components/pages/DeputyDetailPage'

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
        path="/federal-por-estado"
        element={
          <AppLayout showStepsNav={true}>
            <StateSelectionPage />
          </AppLayout>
        }
      />
      <Route
        path="/federal-por-estado/:uf/deputados"
        element={
          <AppLayout showStepsNav={true}>
            <DeputiesListPage />
          </AppLayout>
        }
      />
      <Route
        path="/federal-por-estado/:uf/deputados/:deputyId"
        element={
          <AppLayout showStepsNav={true}>
            <DeputyDetailPage />
          </AppLayout>
        }
      />
    </Routes>
  )
}

export default App