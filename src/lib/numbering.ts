import {
  collection,
  doc,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore'
import { db } from './firebase'

export interface NumberedItem {
  id: string
  number: number
}

export function sortByNumber<T extends NumberedItem>(items: T[]): T[] {
  return [...items].sort((a, b) => a.number - b.number)
}

export function getNextNumber(items: NumberedItem[]): number {
  if (items.length === 0) return 1
  return Math.max(...items.map((i) => i.number)) + 1
}

export async function renumberItems(
  collectionName: string,
  items: NumberedItem[],
): Promise<void> {
  const sorted = sortByNumber(items)
  const batch = writeBatch(db)

  sorted.forEach((item, index) => {
    const newNumber = index + 1
    if (item.number !== newNumber) {
      const ref = doc(db, collectionName, item.id)
      batch.update(ref, { number: newNumber, updatedAt: Date.now() })
    }
  })

  await batch.commit()
}

export async function reorderItems(
  collectionName: string,
  items: NumberedItem[],
  activeId: string,
  overId: string,
): Promise<void> {
  const sorted = sortByNumber(items)
  const oldIndex = sorted.findIndex((i) => i.id === activeId)
  const newIndex = sorted.findIndex((i) => i.id === overId)
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

  const reordered = [...sorted]
  const [moved] = reordered.splice(oldIndex, 1)
  reordered.splice(newIndex, 0, moved)

  const batch = writeBatch(db)
  reordered.forEach((item, index) => {
    const newNumber = index + 1
    if (item.number !== newNumber) {
      const ref = doc(db, collectionName, item.id)
      batch.update(ref, { number: newNumber, updatedAt: Date.now() })
    }
  })

  await batch.commit()
}

export async function deleteAndRenumber(
  collectionName: string,
  items: NumberedItem[],
  deleteId: string,
): Promise<void> {
  const batch = writeBatch(db)
  const deleteRef = doc(db, collectionName, deleteId)
  batch.delete(deleteRef)

  const remaining = sortByNumber(items.filter((i) => i.id !== deleteId))
  remaining.forEach((item, index) => {
    const newNumber = index + 1
    if (item.number !== newNumber) {
      const ref = doc(db, collectionName, item.id)
      batch.update(ref, { number: newNumber, updatedAt: Date.now() })
    }
  })

  await batch.commit()
}

export function collectionRef(name: string) {
  return collection(db, name)
}

export function docRef(name: string, id: string): DocumentReference {
  return doc(db, name, id)
}
