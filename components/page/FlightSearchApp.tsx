'use client'

import { useAppSelector } from '@/lib/store/hooks'
import { SearchForm } from '@/components/search/SearchForm'
import { FlightResults } from '@/components/search/FlightResults'

export function FlightSearchApp() {
  const status = useAppSelector((state) => state.search.status)

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <section className="relative z-20 mb-8">
        <SearchForm />
      </section>

      {status !== 'idle' && (
        <section className="relative z-10">
          <FlightResults />
        </section>
      )}
    </main>
  )
}
