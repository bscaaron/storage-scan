import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  getDocs,
  where,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import type { Location } from '../types'

const COLLECTION = 'locations'

function mapLocation(id: string, data: Record<string, unknown>): Location {
  return {
    id,
    name: data.name as string,
    sortOrder: (data.sortOrder as number) ?? 0,
    containerCount: (data.containerCount as number) ?? 0,
    createdAt: data.createdAt as number,
    updatedAt: data.updatedAt as number,
  }
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setLocations(snap.docs.map((d) => mapLocation(d.id, d.data())))
      setLoading(false)
    })
    return unsub
  }, [])

  return { locations, loading }
}

export function useLocation(locationId: string | undefined) {
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!locationId) {
      setLocation(null)
      setLoading(false)
      return
    }

    const unsub = onSnapshot(doc(db, COLLECTION, locationId), (snap) => {
      setLocation(snap.exists() ? mapLocation(snap.id, snap.data()) : null)
      setLoading(false)
    })
    return unsub
  }, [locationId])

  return { location, loading }
}

export async function createLocation(name: string): Promise<string> {
  const now = Date.now()
  const snap = await getDocs(collection(db, COLLECTION))
  const maxSort = snap.docs.reduce(
    (max, d) => Math.max(max, (d.data().sortOrder as number) ?? 0),
    0,
  )
  const ref = await addDoc(collection(db, COLLECTION), {
    name,
    sortOrder: maxSort + 1,
    containerCount: 0,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function renameLocation(id: string, name: string) {
  await updateDoc(doc(db, COLLECTION, id), { name, updatedAt: Date.now() })
}

export async function deleteLocation(id: string) {
  const batch = writeBatch(db)

  const rowsSnap = await getDocs(
    query(collection(db, 'rows'), where('locationId', '==', id)),
  )
  rowsSnap.docs.forEach((d) => batch.delete(d.ref))

  const containersSnap = await getDocs(
    query(collection(db, 'containers'), where('locationId', '==', id)),
  )
  containersSnap.docs.forEach((d) => {
    batch.delete(d.ref)
    batch.delete(doc(db, 'containerDetails', d.id))
  })

  batch.delete(doc(db, COLLECTION, id))
  await batch.commit()
}

export function sortLocations(locations: Location[]): Location[] {
  return [...locations].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )
}
