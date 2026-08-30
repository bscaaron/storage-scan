import { HashRouter, Routes, Route } from 'react-router-dom'
import { LocationListPage } from './pages/LocationListPage'
import { LocationGridPage } from './pages/LocationGridPage'
import { ContainerDetailPage } from './pages/ContainerDetailPage'
import { ShareContainerPage } from './pages/ShareContainerPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LocationListPage />} />
        <Route path="/location/:locationId" element={<LocationGridPage />} />
        <Route path="/container/:containerId" element={<ContainerDetailPage />} />
        <Route path="/share/:containerId" element={<ShareContainerPage />} />
      </Routes>
    </HashRouter>
  )
}
