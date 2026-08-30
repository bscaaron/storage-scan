import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PhotoUpload } from '../components/PhotoUpload'
import { getContainerLocationName, useContainer } from '../hooks/useContainers'
import { useLocation } from '../hooks/useLocations'

const RichTextDisplay = lazy(() =>
  import('../components/RichTextEditor').then((m) => ({
    default: m.RichTextDisplay,
  })),
)

export function ShareContainerPage() {
  const { containerId } = useParams<{ containerId: string }>()
  const { container } = useContainer(containerId)
  const { location } = useLocation(container?.locationId)
  const [locationName, setLocationName] = useState<string | null>(null)

  useEffect(() => {
    if (location?.name) {
      setLocationName(location.name)
    } else if (container) {
      getContainerLocationName(container.locationId).then(setLocationName)
    }
  }, [container, location])

  if (!container) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-gray-500">Loading container…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-2 text-sm text-gray-500">
        {locationName ?? 'Storage Scan'}
      </div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Container {container.number}
      </h1>

      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Contents</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
              <RichTextDisplay content={container.contents} />
            </Suspense>
          </div>
        </div>

        {container.photos.length > 0 && (
          <PhotoUpload
            photos={container.photos}
            onUpload={async () => {}}
            onRemove={async () => {}}
            readOnly
          />
        )}
      </div>

      <p className="mt-8 text-center text-xs text-gray-400">
        Shared via{' '}
        <Link to="/" className="text-blue-500 hover:underline">
          Storage Scan
        </Link>
      </p>
    </div>
  )
}
