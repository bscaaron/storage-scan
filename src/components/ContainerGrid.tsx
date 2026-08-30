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
import { Link } from 'react-router-dom'
import { prefetchContainer } from '../hooks/useContainers'
import type { ContainerSummary } from '../types'

interface SortableContainerTileProps {
  container: ContainerSummary
}

function SortableContainerTile({ container }: SortableContainerTileProps) {
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
      <Link
        to={`/container/${container.id}`}
        onMouseEnter={() => prefetchContainer(container.id)}
        onClick={(e) => isDragging && e.preventDefault()}
        className="flex aspect-square items-center justify-center rounded-xl border-2 border-blue-200 bg-blue-50 text-2xl font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 hover:shadow-md"
      >
        {container.number}
      </Link>
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
      <p className="text-sm text-gray-500 italic">No containers yet.</p>
    )
  }

  const grid = (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {containers.map((c) =>
        sortable ? (
          <SortableContainerTile key={c.id} container={c} />
        ) : (
          <Link
            key={c.id}
            to={`/container/${c.id}`}
            onMouseEnter={() => prefetchContainer(c.id)}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-blue-200 bg-blue-50 text-2xl font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 hover:shadow-md"
          >
            {c.number}
          </Link>
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
