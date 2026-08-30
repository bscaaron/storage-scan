import { lazy, Suspense, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'
import { PhotoUpload } from '../components/PhotoUpload'
import { ShareButton } from '../components/ShareButton'
import {
  deleteContainer,
  getLocationContainers,
  removeContainerPhoto,
  updateContainerContents,
  uploadContainerPhoto,
  useContainer,
} from '../hooks/useContainers'
import { useLocation } from '../hooks/useLocations'

const RichTextEditor = lazy(() =>
  import('../components/RichTextEditor').then((m) => ({
    default: m.RichTextEditor,
  })),
)

export function ContainerDetailPage() {
  const { containerId } = useParams<{ containerId: string }>()
  const navigate = useNavigate()
  const { container } = useContainer(containerId)
  const { location } = useLocation(container?.locationId)
  const [showDelete, setShowDelete] = useState(false)

  const handleDelete = async () => {
    if (!container) return
    const siblings = await getLocationContainers(container.locationId)
    await deleteContainer(container, siblings)
    navigate(`/location/${container.locationId}`)
  }

  if (!container) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
          ← Back
        </Link>
        <p className="text-gray-500">Loading container…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to={`/location/${container.locationId}`}
        className="mb-4 inline-block text-sm text-blue-600 hover:underline"
      >
        ← {location?.name ?? 'Location'}
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Container {container.number}
        </h1>
        <div className="flex items-center gap-2">
          <ShareButton containerId={container.id} />
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Contents</h2>
          <Suspense
            fallback={
              <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                Loading editor…
              </div>
            }
          >
            <RichTextEditor
              content={container.contents}
              onChange={(html) => updateContainerContents(container.id, html)}
            />
          </Suspense>
        </div>

        <PhotoUpload
          photos={container.photos}
          onUpload={async (file) => {
            await uploadContainerPhoto(container.id, file, container.photos)
          }}
          onRemove={async (photo) => {
            await removeContainerPhoto(container.id, photo, container.photos)
          }}
        />
      </div>

      {showDelete && (
        <ConfirmDeleteDialog
          title="Delete container?"
          message={`This will permanently delete Container ${container.number} and its photos.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  )
}
