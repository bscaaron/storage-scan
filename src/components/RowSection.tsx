import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ContainerGrid } from './ContainerGrid'
import type { Container, Row } from '../types'

interface RowSectionProps {
  row: Row
  containers: Container[]
  onDeleteRow: (row: Row) => void
  onReorderContainers: (activeId: string, overId: string) => void
  onAddContainer: (rowId: string) => void
}

function RowHeader({
  row,
  onDeleteRow,
}: {
  row: Row
  onDeleteRow: (row: Row) => void
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-700">Row {row.number}</h3>
      <button
        type="button"
        onClick={() => onDeleteRow(row)}
        className="text-xs text-red-600 hover:text-red-800"
      >
        Delete row
      </button>
    </div>
  )
}

function SortableRowSection({
  row,
  containers,
  onDeleteRow,
  onReorderContainers,
  onAddContainer,
}: RowSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-gray-200 bg-white p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            ⠿
          </button>
          <h3 className="text-sm font-semibold text-gray-700">
            Row {row.number}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onAddContainer(row.id)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            + Container
          </button>
          <button
            type="button"
            onClick={() => onDeleteRow(row)}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Delete row
          </button>
        </div>
      </div>
      <ContainerGrid
        containers={containers}
        onReorder={onReorderContainers}
        sortable
      />
    </div>
  )
}

interface RowListProps {
  rows: Row[]
  containers: Container[]
  onDeleteRow: (row: Row) => void
  onReorderRows: (activeId: string, overId: string) => void
  onReorderContainers: (activeId: string, overId: string) => void
  onAddContainer: (rowId: string) => void
}

export function RowList({
  rows,
  containers,
  onDeleteRow,
  onReorderRows,
  onReorderContainers,
  onAddContainer,
}: RowListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorderRows(String(active.id), String(over.id))
    }
  }

  if (rows.length === 0) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={rows.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {rows.map((row) => (
            <SortableRowSection
              key={row.id}
              row={row}
              containers={containers.filter((c) => c.rowId === row.id)}
              onDeleteRow={onDeleteRow}
              onReorderContainers={onReorderContainers}
              onAddContainer={onAddContainer}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export function UnassignedSection({
  containers,
  onReorderContainers,
  onAddContainer,
}: {
  containers: Container[]
  onReorderContainers: (activeId: string, overId: string) => void
  onAddContainer: () => void
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          {containers.length > 0 ? 'Containers' : 'No rows — containers'}
        </h3>
        <button
          type="button"
          onClick={onAddContainer}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          + Container
        </button>
      </div>
      <ContainerGrid
        containers={containers}
        onReorder={onReorderContainers}
        sortable
      />
    </div>
  )
}

export { RowHeader }
