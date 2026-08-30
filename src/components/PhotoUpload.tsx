import { useRef, useState } from 'react'
import { ui } from './ui'
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
      <h3 className={`${ui.sectionTitle} mb-3`}>Photos</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square">
            <img
              src={photo.url}
              alt="Container contents"
              className="h-full w-full rounded-2xl object-cover shadow-md ring-2 ring-violet-200"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => onRemove(photo)}
                className="absolute top-2 right-2 min-h-8 min-w-8 rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-sm font-bold text-white shadow-md"
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
            className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/80 text-sm font-bold text-violet-500 transition active:scale-[0.98] hover:border-fuchsia-400 hover:bg-fuchsia-50 hover:text-fuchsia-600 disabled:opacity-50"
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
