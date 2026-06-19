'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

const SESSION_DURATION_SECONDS = 15 * 60

const formatSessionTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m : ${String(remainingSeconds).padStart(2, '0')}s`
}

export function BookingSessionTimer() {
  const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATION_SECONDS)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="glass-card flex items-start gap-3 p-4" data-testid="booking-session-timer">
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
        <Clock className="h-3.5 w-3.5" />
        {formatSessionTime(secondsLeft)}
      </span>
      <p className="text-sm leading-relaxed text-slate-500">
        Session will expire soon. After that, you&apos;ll need to redo the search.
      </p>
    </div>
  )
}
