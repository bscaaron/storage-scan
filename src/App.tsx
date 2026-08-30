import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

const LocationListPage = lazy(() =>
  import('./pages/LocationListPage').then((m) => ({
    default: m.LocationListPage,
  })),
)
const LocationGridPage = lazy(() =>
  import('./pages/LocationGridPage').then((m) => ({
    default: m.LocationGridPage,
  })),
)
const ContainerDetailPage = lazy(() =>
  import('./pages/ContainerDetailPage').then((m) => ({
    default: m.ContainerDetailPage,
  })),
)
const ShareContainerPage = lazy(() =>
  import('./pages/ShareContainerPage').then((m) => ({
    default: m.ShareContainerPage,
  })),
)

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-gray-500">Loading…</p>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LocationListPage />} />
          <Route path="/location/:locationId" element={<LocationGridPage />} />
          <Route path="/container/:containerId" element={<ContainerDetailPage />} />
          <Route path="/share/:containerId" element={<ShareContainerPage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
