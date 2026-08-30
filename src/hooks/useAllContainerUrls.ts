import { mapContainerSummary, mapLocation, mapRow } from '../lib/mappers'
import { sortByNumber } from '../lib/numbering'
import { supabase } from '../lib/supabase'
import type { ContainerSummary, Location, Row } from '../types'

export interface ContainerUrlEntry {
  id: string
  number: number
}

export interface RowUrlGroup {
  row: Row
  containers: ContainerUrlEntry[]
}

export interface LocationUrlGroup {
  location: Location
  rows: RowUrlGroup[]
  unassigned: ContainerUrlEntry[]
}

export async function fetchAllContainerUrlGroups(): Promise<LocationUrlGroup[]> {
  const [locationsRes, rowsRes, containersRes] = await Promise.all([
    supabase.from('locations').select('*').order('name'),
    supabase.from('rows').select('*').order('number'),
    supabase
      .from('containers')
      .select('id, location_id, row_id, number, created_at, updated_at')
      .order('number'),
  ])

  if (locationsRes.error) throw locationsRes.error
  if (rowsRes.error) throw rowsRes.error
  if (containersRes.error) throw containersRes.error

  const locations = (locationsRes.data ?? []).map(mapLocation)
  const rows = (rowsRes.data ?? []).map(mapRow)
  const containers = (containersRes.data ?? []).map(mapContainerSummary)

  return locations.map((location) => {
    const locationRows = sortByNumber(
      rows.filter((row) => row.locationId === location.id),
    )
    const locationContainers = sortByNumber(
      containers.filter((c) => c.locationId === location.id),
    )

    const rowGroups: RowUrlGroup[] = locationRows.map((row) => ({
      row,
      containers: locationContainers
        .filter((c) => c.rowId === row.id)
        .map(toEntry),
    }))

    const unassigned = locationContainers
      .filter((c) => c.rowId === null)
      .map(toEntry)

    return {
      location,
      rows: rowGroups,
      unassigned,
    }
  })
}

function toEntry(container: ContainerSummary): ContainerUrlEntry {
  return { id: container.id, number: container.number }
}
