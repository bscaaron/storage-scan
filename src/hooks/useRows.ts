import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import {
  deleteAndRenumber,
  getNextNumber,
  reorderItems,
  sortByNumber,
} from '../lib/numbering'
import type { Row } from '../types'

const COLLECTION = 'rows'

export function useRows(locationId: string | undefined) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!locationId) {
      setRows([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, COLLECTION),
      where('locationId', '==', locationId),
      orderBy('number'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Row))
      setLoading(false)
    })
    return unsub
  }, [locationId])

  return { rows, loading }
}

export async function createRow(locationId: string, existingRows: Row[]) {
  const now = Date.now()
  const ref = await addDoc(collection(db, COLLECTION), {
    locationId,
    number: getNextNumber(existingRows),
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function deleteRow(row: Row, allRows: Row[]) {
  await deleteAndRenumber(COLLECTION, allRows, row.id)
}

export async function reorderRows(
  allRows: Row[],
  activeId: string,
  overId: string,
) {
  await reorderItems(COLLECTION, allRows, activeId, overId)
}

export { sortByNumber }
