interface IconButtonProps {
  title: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'default' | 'teal' | 'danger'
  form?: string
  children: React.ReactNode
}

export function IconButton({
  title,
  onClick,
  type = 'button',
  disabled,
  variant = 'default',
  form,
  children,
}: IconButtonProps) {
  const variants = {
    default: 'text-violet-600 hover:bg-violet-100',
    teal: 'text-teal-600 hover:bg-teal-50',
    danger: 'text-rose-600 hover:bg-rose-50',
  }

  return (
    <button
      type={type}
      form={form}
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-xl transition active:scale-95 disabled:opacity-50 ${variants[variant]}`}
    >
      {children}
    </button>
  )
}

const iconClass = 'h-5 w-5'

export function IconPlus({ className = iconClass }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  )
}

export function IconSearch({ className = iconClass }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  )
}

export function IconAddRow({ className = iconClass }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 5.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.25Zm0 4.5a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" />
      <path d="M16.25 12.25a.75.75 0 0 1 .75.75v1.25H18.25a.75.75 0 0 1 0 1.5h-1.25v1.25a.75.75 0 0 1-1.5 0v-1.25H14.25a.75.75 0 0 1 0-1.5h1.25V13a.75.75 0 0 1 .75-.75Z" />
    </svg>
  )
}

export function IconAddContainer({ className = iconClass }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.25 4A2.25 2.25 0 0 1 5.5 1.75h9A2.25 2.25 0 0 1 16.75 4v12A2.25 2.25 0 0 1 14.5 18.25h-9A2.25 2.25 0 0 1 3.25 16V4Z" />
      <path d="M10 6.25a.75.75 0 0 0-.75.75v2.25H7a.75.75 0 0 0 0 1.5h2.25V12.5a.75.75 0 0 0 1.5 0v-2.25H12a.75.75 0 0 0 0-1.5h-2.25V7a.75.75 0 0 0-.75-.75Z" />
    </svg>
  )
}

export function IconTrash({ className = iconClass }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 0 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  )
}
