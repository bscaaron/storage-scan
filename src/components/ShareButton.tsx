import { useState } from 'react'

interface ShareButtonProps {
  containerId: string
}

export function ShareButton({ containerId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#/share/${containerId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      title="Copy share link"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4"
      >
        <path d="M12 4.5v2.25a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75v-2.25A2.25 2.25 0 0 1 9 2.25h2.25A2.25 2.25 0 0 1 13.5 4.5Z" />
        <path d="M6.75 6.75h6.5A2.25 2.25 0 0 1 15.5 9v6.75a2.25 2.25 0 0 1-2.25 2.25h-6.5A2.25 2.25 0 0 1 4.5 15.75V9a2.25 2.25 0 0 1 2.25-2.25Z" />
      </svg>
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
