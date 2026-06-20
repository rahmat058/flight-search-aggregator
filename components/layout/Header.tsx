import Link from 'next/link'
import { Plane, Radio } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-indigo-200/80 bg-white/50 shadow-[0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-80"
          aria-label="SkyRoute home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-lg font-bold text-transparent">
              SkyRoute
            </h1>
            <p className="text-xs text-slate-500">Flight Search Aggregator</p>
          </div>
        </Link>
        <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
      
          <Link href="https://flight-search-aggregator.vercel.app/api/flights?origin=JFK&destination=LAX&date=2026-07-15&passengers=1&page=1&limit=3" target="_blank" className="flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-teal-700">
            <Radio className="h-3 w-3" />
            Live mock data
          </Link>
        </div>
      </div>
    </header>
  )
}
