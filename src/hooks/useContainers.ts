import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
  orderBy,
} from 'firebase/firestore'
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage'
import { useEffect, useState } from 'react'
import { db, storage } from '../lib/firebase'
import {
  deleteAndRenumber,
  getNextNumber,
  reorderItems,
  sortByNumber,
} from '../lib/numbering'
import type { Container, ContainerPhoto } from '../types'

const COLLECTION = 'containers'

export function useContainers(locationId: string | undefined) {
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!locationId) {
      setContainers([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, COLLECTION),
      where('locationId', '==', locationId),
      orderBy('number'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setContainers(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            photos: data.photos ?? [],
            contents: data.contents ?? '',
          } as Container
        }),
      )
      setLoading(false)
    })
    return unsub
  }, [locationId])

  return { containers, loading }
}

export function useContainer(containerId: string | undefined) {
  const [container, setContainer] = useState<Container | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!containerId) {
      setContainer(null)
      setLoading(false)
      return
    }

    const unsub = onSnapshot(doc(db, COLLECTION, containerId), (snap) => {
      if (!snap.exists()) {
        setContainer(null)
      } else {
        const data = snap.data()
        setContainer({
          id: snap.id,
          ...data,
          photos: data.photos ?? [],
          contents: data.contents ?? '',
        } as Container)
      }
      setLoading(false)
    })
    return unsub
  }, [containerId])

  return { container, loading }
}

export async function createContainer(
  locationId: string,
  rowId: string | null,
  existingContainers: Container[],
) {
  const now = Date.now()
  const ref = await addDoc(collection(db, COLLECTION), {
    locationId,
    rowId,
    number: getNextNumber(existingContainers),
    contents: '',
    photos: [],
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function deleteContainer(
  container: Container,
  allContainers: Container[],
) {
  for (const photo of container.photos) {
    try {
      await deleteObject(storageRef(storage, photo.storagePath))
    } catch {
      // photo may already be deleted
    }
  }
  await deleteAndRenumber(COLLECTION, allContainers, container.id)
}

export async function reorderContainers(
  allContainers: Container[],
  activeId: string,
  overId: string,
) {
  await reorderItems(COLLECTION, allContainers, activeId, overId)
}

export async function moveContainerToRow(
  containerId: string,
  rowId: string | null,
) {
  await updateDoc(doc(db, COLLECTION, containerId), {
    rowId,
    updatedAt: Date.now(),
  })
}

export async function updateContainerContents(
  containerId: string,
  contents: string,
) {
  await updateDoc(doc(db, COLLECTION, containerId), {
    contents,
    updatedAt: Date.now(),
  })
}

export async function uploadContainerPhoto(
  containerId: string,
  file: File,
  existingPhotos: ContainerPhoto[],
): Promise<ContainerPhoto[]> {
  const photoId = crypto.randomUUID()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `photos/${containerId}/${photoId}.${ext}`
  const fileRef = storageRef(storage, path)

  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)

  const newPhoto: ContainerPhoto = { id: photoId, url, storagePath: path }
  const photos = [...existingPhotos, newPhoto]

  await updateDoc(doc(db, COLLECTION, containerId), {
    photos,
    updatedAt: Date.now(),
  })

  return photos
}

export async function removeContainerPhoto(
  containerId: string,
  photo: ContainerPhoto,
  existingPhotos: ContainerPhoto[],
): Promise<ContainerPhoto[]> {
  try {
    await deleteObject(storageRef(storage, photo.storagePath))
  } catch {
    // photo may already be deleted
  }

  const photos = existingPhotos.filter((p) => p.id !== photo.id)
  await updateDoc(doc(db, COLLECTION, containerId), {
    photos,
    updatedAt: Date.now(),
  })

  return photos
}

export async function getContainerLocationName(
  container: Container,
): Promise<string | null> {
  const locSnap = await getDoc(doc(db, 'locations', container.locationId))
  if (!locSnap.exists()) return null
  return locSnap.data().name as string
}

export { sortByNumber }
