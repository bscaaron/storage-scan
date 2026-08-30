import { Link, useParams } from 'react-router-dom'
import { PhotoUpload } from '../components/PhotoUpload'
import { RichTextDisplay } from '../components/RichTextEditor'
import {
  getContainerLocationName,
  useContainer,
} from '../hooks/useContainers'
import { useEffect, useState } from 'react'

export function ShareContainerPage() {
  const { containerId } = useParams<{ containerId: string }>()
  const { container, loading } = useContainer(containerId)
  const [locationName, setLocationName] = useState<string | null>(null)

  useEffect(() => {
    if (container) {
      getContainerLocationName(container).then(setLocationName)
    }
  }, [container])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  if (!container) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <p className="text-gray-500">Container not found.</p>
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
            <RichTextDisplay content={container.contents} />
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
