import { Suspense, lazy } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router'
import { RouteErrorBoundary } from './components/RouteErrorBoundary.tsx'

const HomePage = lazy(() => import('./pages/HomePage.tsx').then((m) => ({ default: m.HomePage })))
const CamerasPage = lazy(() =>
  import('./pages/CamerasPage.tsx').then((m) => ({ default: m.CamerasPage })),
)
const PerformancePage = lazy(() =>
  import('./pages/PerformancePage.tsx').then((m) => ({ default: m.PerformancePage })),
)
const DisplayPage = lazy(() =>
  import('./pages/DisplayPage.tsx').then((m) => ({ default: m.DisplayPage })),
)
const SoftwarePage = lazy(() =>
  import('./pages/SoftwarePage.tsx').then((m) => ({ default: m.SoftwarePage })),
)
const SpecificationsPage = lazy(() =>
  import('./pages/SpecificationsPage.tsx').then((m) => ({ default: m.SpecificationsPage })),
)

/** Root application shell with lazy routes and per-route error boundaries. */
export function App() {
  return (
    <BrowserRouter>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <header>
        <nav aria-label="Primary">
          <Link to="/">Aether One X v2</Link>
        </nav>
      </header>
      <main id="main">
        <Suspense fallback={<p role="status">Loading…</p>}>
          <Routes>
            <Route
              path="/"
              element={
                <RouteErrorBoundary routeName="Home">
                  <HomePage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/cameras"
              element={
                <RouteErrorBoundary routeName="Cameras">
                  <CamerasPage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/performance"
              element={
                <RouteErrorBoundary routeName="Performance">
                  <PerformancePage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/display"
              element={
                <RouteErrorBoundary routeName="Display">
                  <DisplayPage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/software"
              element={
                <RouteErrorBoundary routeName="Software">
                  <SoftwarePage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/specifications"
              element={
                <RouteErrorBoundary routeName="Specifications">
                  <SpecificationsPage />
                </RouteErrorBoundary>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <footer>
        <p>
          Aether One X is a fictional concept product. All specifications, benchmarks, and prices
          shown are illustrative demonstration values.
        </p>
      </footer>
    </BrowserRouter>
  )
}
