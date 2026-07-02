import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useEffect } from 'react'

const styles = {
  error: 'border-red-500/30 bg-red-500/10 text-red-100',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  info: 'border-cyan/30 bg-cyan/10 text-cyan-50',
}
const icons = { error: AlertCircle, success: CheckCircle2, info: Info }

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null
  const Icon = icons[type] || Info
  return <div className={`fixed right-4 top-20 z-[60] flex max-w-sm items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl ${styles[type]}`} role="status" aria-live="polite"><Icon className="mt-0.5 shrink-0" size={18} /><p className="text-sm leading-6">{message}</p><button onClick={onClose} className="ml-auto shrink-0 opacity-70 hover:opacity-100" aria-label="Dismiss notification"><X size={17} /></button></div>
}
