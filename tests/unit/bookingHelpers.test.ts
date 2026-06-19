import { describe, it, expect } from 'vitest'
import { isPassengerComplete } from '@/lib/utils/bookingHelpers'
import type { BookingPassenger } from '@/lib/types/flight'

const completePassenger: BookingPassenger = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
}

describe('bookingHelpers', () => {
  describe('isPassengerComplete', () => {
    it('returns true when all required fields are filled', () => {
      expect(isPassengerComplete(completePassenger)).toBe(true)
    })

    it('returns false when a required field is missing', () => {
      expect(isPassengerComplete({ ...completePassenger, email: '' })).toBe(false)
      expect(isPassengerComplete({ ...completePassenger, firstName: '  ' })).toBe(false)
    })
  })
})
