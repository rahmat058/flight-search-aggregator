import type { PaymentMethod } from '@/lib/types/flight'

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'amex',
    label: 'Amex Cards',
    brand: 'American Express',
    cardholder: 'John Doe',
    last4: '0005',
    expiry: '04/27',
  },
  {
    id: 'visa',
    label: 'Visa Cards',
    brand: 'Visa',
    cardholder: 'John Doe',
    last4: '4242',
    expiry: '06/28',
  },
  {
    id: 'mastercard',
    label: 'Mastercard Cards',
    brand: 'Mastercard',
    cardholder: 'John Doe',
    last4: '5555',
    expiry: '09/26',
  },
]
