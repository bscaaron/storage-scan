import { useNavigate } from 'react-router-dom'
import { prefetchContainer } from '../hooks/useContainers'
import type { ContainerSummary } from '../types'

interface ContainerTileProps {
  container: ContainerSummary
  className?: string
}

export function ContainerTile({ container, className = '' }: ContainerTileProps) {
  const navigate = useNavigate()

  const tileClass = container.hasContents
    ? 'flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 text-2xl font-extrabold text-white shadow-lg shadow-violet-500/30 transition active:scale-95'
    : 'flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100/80 text-2xl font-extrabold text-slate-400 transition active:scale-95'

  return (
    <button
      type="button"
      onClick={() => navigate(`/container/${container.id}`)}
      onTouchStart={() => prefetchContainer(container.id)}
      onMouseEnter={() => prefetchContainer(container.id)}
      className={`${tileClass} ${className}`}
    >
      {container.number}
    </button>
  )
}
