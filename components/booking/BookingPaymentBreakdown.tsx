'use client'

import type { PaymentBreakdown } from '@/lib/utils/paymentBreakdown'
import { formatPrice } from '@/lib/utils/flightHelpers'

interface BookingPaymentBreakdownProps {
  breakdown: PaymentBreakdown
}

export function BookingPaymentBreakdown({ breakdown }: BookingPaymentBreakdownProps) {
  const rows = [
    { label: 'Base Fare', value: breakdown.baseFare },
    { label: 'Tax', value: breakdown.tax },
    { label: 'Sub Total', value: breakdown.subTotal, divider: true },
    { label: 'AIT & VAT', value: breakdown.aitVat },
    { label: 'Other Charges', value: breakdown.otherCharges },
    { label: 'Processing Fee', value: breakdown.processingFee },
  ]

  return (
    <div className="glass-card overflow-hidden" data-testid="payment-breakdown">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-800">Payment Details</h3>
      </div>

      <div className="space-y-3 px-5 py-4 text-sm">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex justify-between text-slate-600">
              <span>{row.label}</span>
              <span className="font-medium text-slate-800">{formatPrice(row.value)}</span>
            </div>
            {row.divider && <div className="mt-3 border-t border-dashed border-slate-200" />}
          </div>
        ))}

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold text-slate-800">Total Payable</span>
            <span
              className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-bold text-transparent"
              data-testid="payment-total">
              {formatPrice(breakdown.totalPayable)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
