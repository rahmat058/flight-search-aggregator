import { Heart, Plane } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-indigo-200/80 bg-white/50 shadow-[0_-1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Plane className="h-4 w-4 text-indigo-500" />
          <span>SkyRoute — Flight Search Aggregator</span>
        </div>
        <p className="flex items-center gap-1 text-xs text-slate-400">
          Built with
          <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
          using mock data
        </p>
      </div>
    </footer>
  )
}
