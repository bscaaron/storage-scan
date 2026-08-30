import { useRef, useState } from 'react'
import type { ContainerPhoto } from '../types'

interface PhotoUploadProps {
  photos: ContainerPhoto[]
  onUpload: (file: File) => Promise<void>
  onRemove: (photo: ContainerPhoto) => Promise<void>
  readOnly?: boolean
}

export function PhotoUpload({
  photos,
  onUpload,
  onRemove,
  readOnly = false,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Photos</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square">
            <img
              src={photo.url}
              alt="Container contents"
              className="h-full w-full rounded-lg object-cover"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => onRemove(photo)}
                className="absolute top-1 right-1 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-blue-400 hover:text-blue-500 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : '+ Add photo'}
          </button>
        )}
      </div>
      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  )
}
