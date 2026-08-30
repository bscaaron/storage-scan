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
import { IconButton, IconPlus, IconTrash } from './icons'
import { ui } from './ui'
import type { ContainerSummary, Row } from '../types'

interface RowSectionProps {
  row: Row
  containers: ContainerSummary[]
  onDeleteRow: (row: Row) => void
  onReorderContainers: (activeId: string, overId: string) => void
  onAddContainer: (rowId: string) => void
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
    <div ref={setNodeRef} style={style} className={ui.card}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="min-h-10 min-w-10 shrink-0 cursor-grab rounded-xl bg-violet-100 text-lg text-violet-500 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            ⠿
          </button>
          <h3 className={`${ui.sectionTitle} truncate`}>Row {row.number}</h3>
        </div>
        <div className="flex shrink-0 items-center">
          <IconButton
            title="Add container"
            variant="teal"
            onClick={() => onAddContainer(row.id)}
          >
            <IconPlus />
          </IconButton>
          <IconButton
            title="Delete row"
            variant="danger"
            onClick={() => onDeleteRow(row)}
          >
            <IconTrash />
          </IconButton>
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
  containers: ContainerSummary[]
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
  containers: ContainerSummary[]
  onReorderContainers: (activeId: string, overId: string) => void
  onAddContainer: () => void
}) {
  return (
    <div className={ui.card}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className={`${ui.sectionTitle} min-w-0 truncate`}>
          {containers.length > 0 ? 'Containers' : 'No rows — containers'}
        </h3>
        <IconButton title="Add container" variant="teal" onClick={onAddContainer}>
          <IconPlus />
        </IconButton>
      </div>
      <ContainerGrid
        containers={containers}
        onReorder={onReorderContainers}
        sortable
      />
    </div>
  )
}
