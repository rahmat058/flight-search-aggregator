'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react'
import { CenteredMain } from '@/components/layout/CenteredMain'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const isDev = process.env.NODE_ENV === 'development'
  const errorMessage = error.message?.trim()
  const showMessage = Boolean(
    errorMessage && (isDev || errorMessage !== 'An error occurred in the Server Components render.'),
  )

  return (
    <CenteredMain>
      <div className="animate-fade-in w-full max-w-md" data-testid="error-page">
        <div className="glass-card p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
            <AlertTriangle className="h-8 w-8 text-rose-500" />
          </div>

          <p className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-5xl font-bold text-transparent">
            Oops
          </p>
          <h1 className="mt-3 text-xl font-bold text-slate-800">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-500">
            An unexpected error occurred. Please try again or return to the search page.
          </p>

          {(showMessage || error.digest) && (
            <div
              className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-center text-sm text-rose-700"
              data-testid="error-details">
              {showMessage && (
                <p className="font-medium wrap-break-word" data-testid="error-message">
                  {errorMessage}
                </p>
              )}
              {error.digest && (
                <p className={`text-xs text-rose-500 ${showMessage ? 'mt-1' : ''}`}>Reference: {error.digest}</p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              data-testid="error-retry-btn"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 via-violet-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:via-violet-600 hover:to-purple-600 hover:shadow-indigo-500/40">
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href="/"
              data-testid="error-home-link"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:border-indigo-300 hover:bg-white">
              <ArrowLeft className="h-4 w-4" />
              Back to search
            </Link>
          </div>
        </div>
      </div>
    </CenteredMain>
  )
}
