import type { Container, ContainerSummary, Location, Row } from '../types'

export const cache = {
  locations: null as Location[] | null,
  locationById: new Map<string, Location>(),
  rowsByLocation: new Map<string, Row[]>(),
  containersByLocation: new Map<string, ContainerSummary[]>(),
  containerById: new Map<string, Container>(),
}

export function invalidateLocations() {
  cache.locations = null
}

export function invalidateLocation(locationId: string) {
  cache.locationById.delete(locationId)
  cache.rowsByLocation.delete(locationId)
  cache.containersByLocation.delete(locationId)
}

export function invalidateContainer(containerId: string) {
  cache.containerById.delete(containerId)
}

export function invalidateAll() {
  cache.locations = null
  cache.locationById.clear()
  cache.rowsByLocation.clear()
  cache.containersByLocation.clear()
  cache.containerById.clear()
}
