import { Link } from 'react-router-dom'
import type { Container } from '../types'

interface ContainerTileProps {
  container: Container
}

export function ContainerTile({ container }: ContainerTileProps) {
  return (
    <Link
      to={`/container/${container.id}`}
      className="flex aspect-square items-center justify-center rounded-xl border-2 border-blue-200 bg-blue-50 text-2xl font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 hover:shadow-md"
    >
      {container.number}
    </Link>
  )
}
