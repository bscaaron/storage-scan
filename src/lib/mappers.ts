import type { ContainerPhoto } from '../types'
import type { DbContainer, DbLocation, DbRow } from './supabase'

export function toTimestamp(iso: string): number {
  return new Date(iso).getTime()
}

export function mapLocation(row: DbLocation) {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    containerCount: row.container_count,
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at),
  }
}

export function mapRow(row: DbRow) {
  return {
    id: row.id,
    locationId: row.location_id,
    number: row.number,
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at),
  }
}

export function mapPhotos(value: unknown): ContainerPhoto[] {
  if (!Array.isArray(value)) return []
  return value as ContainerPhoto[]
}

export function mapContainerSummary(row: {
  id: string
  location_id: string
  row_id: string | null
  number: number
  created_at: string
  updated_at: string
}) {
  return {
    id: row.id,
    locationId: row.location_id,
    rowId: row.row_id,
    number: row.number,
    createdAt: toTimestamp(row.created_at),
    updatedAt: toTimestamp(row.updated_at),
  }
}

export function mapContainer(row: DbContainer) {
  return {
    ...mapContainerSummary(row),
    contents: row.contents ?? '',
    photos: mapPhotos(row.photos),
  }
}
