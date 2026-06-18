import Link from 'next/link'
import { ArrowLeft, SearchX } from 'lucide-react'
import { CenteredMain } from '@/components/layout/CenteredMain'

export default function NotFound() {
  return (
    <CenteredMain>
      <div className="animate-fade-in w-full max-w-md" data-testid="not-found">
        <div className="glass-card p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <SearchX className="h-8 w-8 text-amber-500" />
          </div>

          <p className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-5xl font-bold text-transparent">
            404
          </p>
          <h1 className="mt-3 text-xl font-bold text-slate-800">Page not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            The page you are looking for does not exist or may have been moved.
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:via-violet-600 hover:to-purple-600 hover:shadow-indigo-500/40">
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>
        </div>
      </div>
    </CenteredMain>
  )
}
