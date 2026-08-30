export interface Location {
  id: string
  name: string
  sortOrder: number
  createdAt: number
  updatedAt: number
}

export interface Row {
  id: string
  locationId: string
  number: number
  createdAt: number
  updatedAt: number
}

export interface ContainerPhoto {
  id: string
  url: string
  storagePath: string
  caption?: string
}

export interface Container {
  id: string
  locationId: string
  rowId: string | null
  number: number
  contents: string
  photos: ContainerPhoto[]
  createdAt: number
  updatedAt: number
}
