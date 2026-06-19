export interface PaymentBreakdown {
  baseFare: number
  tax: number
  subTotal: number
  aitVat: number
  otherCharges: number
  processingFee: number
  totalPayable: number
}

export const buildPaymentBreakdown = (ticketTotal: number): PaymentBreakdown => {
  const processingFee = 9.75
  const baseFare = Math.round(ticketTotal * 0.82 * 100) / 100
  const tax = Math.round(ticketTotal * 0.1 * 100) / 100
  const aitVat = Math.round(ticketTotal * 0.05 * 100) / 100
  const otherCharges = Math.round((ticketTotal - baseFare - tax - aitVat) * 100) / 100
  const subTotal = Math.round((baseFare + tax) * 100) / 100
  const totalPayable = Math.round((ticketTotal + processingFee) * 100) / 100

  return {
    baseFare,
    tax,
    subTotal,
    aitVat,
    otherCharges,
    processingFee,
    totalPayable,
  }
}
