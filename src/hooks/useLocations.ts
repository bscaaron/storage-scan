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

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      setLocations(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Location),
      )
      setLoading(false)
    })
    return unsub
  }, [])

  return { locations, loading }
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
  containersSnap.docs.forEach((d) => batch.delete(d.ref))

  batch.delete(doc(db, COLLECTION, id))
  await batch.commit()
}

export function sortLocations(locations: Location[]): Location[] {
  return [...locations].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )
}
