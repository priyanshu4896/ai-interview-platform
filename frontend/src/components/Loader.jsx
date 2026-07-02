export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-slate-400">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-accent" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function InlineSpinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
}
