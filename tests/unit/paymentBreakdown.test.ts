import { describe, it, expect } from 'vitest'
import { buildPaymentBreakdown } from '@/lib/utils/paymentBreakdown'

describe('paymentBreakdown', () => {
  it('builds a fare breakdown with processing fee', () => {
    const breakdown = buildPaymentBreakdown(300)

    expect(breakdown.baseFare).toBeGreaterThan(0)
    expect(breakdown.tax).toBeGreaterThan(0)
    expect(breakdown.subTotal).toBe(breakdown.baseFare + breakdown.tax)
    expect(breakdown.processingFee).toBe(9.75)
    expect(breakdown.totalPayable).toBeGreaterThan(300)
  })

  it('scales breakdown with ticket total', () => {
    const single = buildPaymentBreakdown(300)
    const double = buildPaymentBreakdown(600)

    expect(double.baseFare).toBeGreaterThan(single.baseFare)
    expect(double.totalPayable).toBeGreaterThan(single.totalPayable)
  })
})
