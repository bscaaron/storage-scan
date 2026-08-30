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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import { prefetchContainer } from '../hooks/useContainers'
import type { ContainerSummary } from '../types'

function tileClassName(hasContents: boolean) {
  return hasContents
    ? 'flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 text-2xl font-extrabold text-white shadow-lg shadow-violet-500/30 transition active:scale-95'
    : 'flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/80 text-2xl font-extrabold text-slate-400 transition active:scale-95'
}

function ContainerTileButton({
  container,
  onNavigate,
  className = '',
}: {
  container: ContainerSummary
  onNavigate: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onNavigate}
      onTouchStart={() => prefetchContainer(container.id)}
      onMouseEnter={() => prefetchContainer(container.id)}
      className={`${tileClassName(container.hasContents)} ${className}`}
    >
      {container.number}
    </button>
  )
}

interface SortableContainerTileProps {
  container: ContainerSummary
  onNavigate: () => void
}

function SortableContainerTile({
  container,
  onNavigate,
}: SortableContainerTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: container.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ContainerTileButton
        container={container}
        onNavigate={onNavigate}
      />
    </div>
  )
}

interface ContainerGridProps {
  containers: ContainerSummary[]
  onReorder?: (activeId: string, overId: string) => void
  sortable?: boolean
}

export function ContainerGrid({
  containers,
  onReorder,
  sortable = false,
}: ContainerGridProps) {
  const navigate = useNavigate()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id && onReorder) {
      onReorder(String(active.id), String(over.id))
    }
  }

  if (containers.length === 0) {
    return (
      <p className="text-sm italic text-violet-500/70">No containers yet.</p>
    )
  }

  const goTo = (id: string) => () => navigate(`/container/${id}`)

  const grid = (
    <div className="grid grid-cols-4 gap-2">
      {containers.map((c) =>
        sortable ? (
          <SortableContainerTile
            key={c.id}
            container={c}
            onNavigate={goTo(c.id)}
          />
        ) : (
          <ContainerTileButton
            key={c.id}
            container={c}
            onNavigate={goTo(c.id)}
          />
        ),
      )}
    </div>
  )

  if (!sortable || !onReorder) return grid

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={containers.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        {grid}
      </SortableContext>
    </DndContext>
  )
}
