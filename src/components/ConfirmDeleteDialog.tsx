import { ui } from './ui'

interface ConfirmDeleteDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteDialog({
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-violet-950/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-rose-500/20 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-violet-900">{title}</h3>
        <p className="mt-2 text-sm text-violet-700/80">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className={ui.btnSecondary}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={ui.btnDanger}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
