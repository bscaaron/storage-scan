import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog'
import { RowList, UnassignedSection } from '../components/RowSection'
import {
  createContainer,
  deleteContainer,
  reorderContainers,
  useContainers,
} from '../hooks/useContainers'
import { useLocations, renameLocation, deleteLocation } from '../hooks/useLocations'
import { createRow, deleteRow, reorderRows, useRows } from '../hooks/useRows'
import type { Row } from '../types'

export function LocationGridPage() {
  const { locationId } = useParams<{ locationId: string }>()
  const navigate = useNavigate()
  const { locations, loading: locationsLoading } = useLocations()
  const { rows, loading: rowsLoading } = useRows(locationId)
  const { containers, loading: containersLoading } = useContainers(locationId)

  const location = locations.find((l) => l.id === locationId)
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState('')
  const [deleteRowTarget, setDeleteRowTarget] = useState<Row | null>(null)
  const [showDeleteLocation, setShowDeleteLocation] = useState(false)

  const unassigned = containers.filter((c) => c.rowId === null)
  const loading = locationsLoading || rowsLoading || containersLoading

  const startEditing = () => {
    if (location) {
      setName(location.name)
      setEditingName(true)
    }
  }

  const saveName = async () => {
    if (locationId && name.trim()) {
      await renameLocation(locationId, name.trim())
    }
    setEditingName(false)
  }

  const handleAddRow = async () => {
    if (!locationId) return
    await createRow(locationId, rows)
  }

  const handleAddContainer = async (rowId: string | null = null) => {
    if (!locationId) return
    await createContainer(locationId, rowId, containers)
  }

  const handleDeleteRow = async (row: Row) => {
    const rowContainers = containers.filter((c) => c.rowId === row.id)
    let remaining = [...containers]
    for (const c of rowContainers) {
      await deleteContainer(c, remaining)
      remaining = remaining.filter((x) => x.id !== c.id)
    }
    await deleteRow(row, rows)
    setDeleteRowTarget(null)
  }

  const handleDeleteLocation = async () => {
    if (!locationId) return
    await deleteLocation(locationId)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-gray-500">Location not found.</p>
        <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
          Back to locations
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
        ← All locations
      </Link>

      <div className="mb-6 flex items-center justify-between">
        {editingName ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            autoFocus
            className="text-2xl font-bold rounded border border-gray-300 px-3 py-1 focus:border-blue-500 focus:outline-none"
          />
        ) : (
          <h1
            className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600"
            onClick={startEditing}
            title="Click to rename"
          >
            {location.name}
          </h1>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            + Row
          </button>
          <button
            type="button"
            onClick={() => handleAddContainer(null)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Container
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteLocation(true)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete location
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <RowList
          rows={rows}
          containers={containers}
          onDeleteRow={setDeleteRowTarget}
          onReorderRows={(activeId, overId) =>
            reorderRows(rows, activeId, overId)
          }
          onReorderContainers={(activeId, overId) =>
            reorderContainers(containers, activeId, overId)
          }
          onAddContainer={(rowId) => handleAddContainer(rowId)}
        />

        {(rows.length === 0 || unassigned.length > 0) && (
          <UnassignedSection
            containers={rows.length === 0 ? containers : unassigned}
            onReorderContainers={(activeId, overId) =>
              reorderContainers(containers, activeId, overId)
            }
            onAddContainer={() => handleAddContainer(null)}
          />
        )}
      </div>

      {deleteRowTarget && (
        <ConfirmDeleteDialog
          title="Delete row?"
          message={`This will delete Row ${deleteRowTarget.number} and all containers in it.`}
          onConfirm={() => handleDeleteRow(deleteRowTarget)}
          onCancel={() => setDeleteRowTarget(null)}
        />
      )}

      {showDeleteLocation && (
        <ConfirmDeleteDialog
          title="Delete location?"
          message={`This will permanently delete "${location.name}" and all its rows and containers.`}
          onConfirm={handleDeleteLocation}
          onCancel={() => setShowDeleteLocation(false)}
        />
      )}
    </div>
  )
}
