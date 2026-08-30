import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'
import {
  createLocation,
  deleteLocation,
  renameLocation,
  sortLocations,
  useLocations,
} from '../hooks/useLocations'
import type { Location } from '../types'

function LocationRow({
  location,
  onRename,
  onDelete,
}: {
  location: Location
  onRename: (id: string, name: string) => void
  onDelete: (location: Location) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(location.name)

  const handleSave = async () => {
    const trimmed = name.trim()
    if (trimmed && trimmed !== location.name) {
      await onRename(location.id, trimmed)
    }
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {editing ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        />
      ) : (
        <Link
          to={`/location/${location.id}`}
          className="flex-1 text-lg font-medium text-gray-900 hover:text-blue-600"
        >
          {location.name}
        </Link>
      )}

      <span className="text-sm text-gray-500">
        {location.containerCount} container{location.containerCount !== 1 ? 's' : ''}
      </span>

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Rename
      </button>
      <button
        type="button"
        onClick={() => onDelete(location)}
        className="text-sm text-red-600 hover:text-red-800"
      >
        Delete
      </button>
    </div>
  )
}

export function LocationListPage() {
  const { locations, loading } = useLocations()
  const [newName, setNewName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null)
  const sorted = sortLocations(locations)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    await createLocation(trimmed)
    setNewName('')
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading locations…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Storage Scan</h1>
      <p className="mb-8 text-gray-600">
        Track what's in your storage containers, organized by location.
      </p>

      <form onSubmit={handleAdd} className="mb-8 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New location name (e.g. Garage West Shelf)"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Location
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className="text-center text-gray-500">
          No locations yet. Add one above to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((location) => (
            <LocationRow
              key={location.id}
              location={location}
              onRename={renameLocation}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          title="Delete location?"
          message={`This will permanently delete "${deleteTarget.name}" and all its rows and containers.`}
          onConfirm={async () => {
            await deleteLocation(deleteTarget.id)
            setDeleteTarget(null)
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
