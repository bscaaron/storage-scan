import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  orderBy,
  deleteDoc,
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
import type {
  Container,
  ContainerDetails,
  ContainerPhoto,
  ContainerSummary,
} from '../types'

const COLLECTION = 'containers'
const DETAILS_COLLECTION = 'containerDetails'

function mapSummary(id: string, data: Record<string, unknown>): ContainerSummary {
  return {
    id,
    locationId: data.locationId as string,
    rowId: (data.rowId as string | null) ?? null,
    number: data.number as number,
    createdAt: data.createdAt as number,
    updatedAt: data.updatedAt as number,
  }
}

function mapDetails(data: Record<string, unknown> | undefined): ContainerDetails {
  return {
    contents: (data?.contents as string) ?? '',
    photos: (data?.photos as ContainerPhoto[]) ?? [],
  }
}

function mergeContainer(
  summary: ContainerSummary,
  details: ContainerDetails,
): Container {
  return { ...summary, ...details }
}

async function readDetails(containerId: string): Promise<ContainerDetails> {
  const detailsSnap = await getDoc(doc(db, DETAILS_COLLECTION, containerId))
  if (detailsSnap.exists()) {
    return mapDetails(detailsSnap.data())
  }

  const containerSnap = await getDoc(doc(db, COLLECTION, containerId))
  if (containerSnap.exists()) {
    return mapDetails(containerSnap.data())
  }

  return { contents: '', photos: [] }
}

async function adjustContainerCount(locationId: string, delta: number) {
  await updateDoc(doc(db, 'locations', locationId), {
    containerCount: increment(delta),
    updatedAt: Date.now(),
  })
}

export function useContainers(locationId: string | undefined) {
  const [containers, setContainers] = useState<ContainerSummary[]>([])
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
      setContainers(snap.docs.map((d) => mapSummary(d.id, d.data())))
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

    let summary: ContainerSummary | null = null
    let details: ContainerDetails = { contents: '', photos: [] }
    let legacyDetails: ContainerDetails | null = null
    let summaryReady = false
    let detailsReady = false

    const publish = () => {
      if (!summaryReady || !detailsReady) return
      if (!summary) {
        setContainer(null)
      } else {
        const resolvedDetails =
          details.contents || details.photos.length > 0
            ? details
            : (legacyDetails ?? details)
        setContainer(mergeContainer(summary, resolvedDetails))
      }
      setLoading(false)
    }

    const unsubSummary = onSnapshot(doc(db, COLLECTION, containerId), (snap) => {
      summaryReady = true
      if (!snap.exists()) {
        summary = null
        legacyDetails = null
      } else {
        const data = snap.data()
        summary = mapSummary(snap.id, data)
        if (data.contents !== undefined || data.photos !== undefined) {
          legacyDetails = mapDetails(data)
        }
      }
      publish()
    })

    const unsubDetails = onSnapshot(
      doc(db, DETAILS_COLLECTION, containerId),
      (snap) => {
        detailsReady = true
        if (snap.exists()) {
          details = mapDetails(snap.data())
        } else if (summary) {
          details = { contents: '', photos: [] }
        }
        publish()
      },
    )

    return () => {
      unsubSummary()
      unsubDetails()
    }
  }, [containerId])

  return { container, loading }
}

export async function createContainer(
  locationId: string,
  rowId: string | null,
  existingContainers: ContainerSummary[],
) {
  const now = Date.now()
  const ref = await addDoc(collection(db, COLLECTION), {
    locationId,
    rowId,
    number: getNextNumber(existingContainers),
    createdAt: now,
    updatedAt: now,
  })

  await setDoc(doc(db, DETAILS_COLLECTION, ref.id), {
    contents: '',
    photos: [],
    updatedAt: now,
  })
  await adjustContainerCount(locationId, 1)

  return ref.id
}

export async function deleteContainer(
  container: ContainerSummary,
  allContainers: ContainerSummary[],
) {
  const details = await readDetails(container.id)
  for (const photo of details.photos) {
    try {
      await deleteObject(storageRef(storage, photo.storagePath))
    } catch {
      // photo may already be deleted
    }
  }

  await deleteDoc(doc(db, DETAILS_COLLECTION, container.id))
  await deleteAndRenumber(COLLECTION, allContainers, container.id)
  await adjustContainerCount(container.locationId, -1)
}

export async function reorderContainers(
  allContainers: ContainerSummary[],
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
  await setDoc(
    doc(db, DETAILS_COLLECTION, containerId),
    { contents, updatedAt: Date.now() },
    { merge: true },
  )
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

  await setDoc(
    doc(db, DETAILS_COLLECTION, containerId),
    { photos, updatedAt: Date.now() },
    { merge: true },
  )

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
  await setDoc(
    doc(db, DETAILS_COLLECTION, containerId),
    { photos, updatedAt: Date.now() },
    { merge: true },
  )

  return photos
}

export async function getLocationContainers(
  locationId: string,
): Promise<ContainerSummary[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where('locationId', '==', locationId),
      orderBy('number'),
    ),
  )
  return snap.docs.map((d) => mapSummary(d.id, d.data()))
}

export async function getContainerLocationName(
  locationId: string,
): Promise<string | null> {
  const locSnap = await getDoc(doc(db, 'locations', locationId))
  if (!locSnap.exists()) return null
  return locSnap.data().name as string
}

export { sortByNumber }
