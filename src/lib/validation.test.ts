import { describe, expect, it } from 'vitest'
import {
  BIO_LIMIT,
  compactErrors,
  passwordStrength,
  validateConfirmPassword,
  validateEmail,
  validateNewPassword,
  validateOtp,
  validatePassword,
  validatePasswordChange,
  validatePhone,
  validateProfile,
} from './validation'

describe('validation', () => {
  it('applies the same new-password rules to reset and change flows', () => {
    expect(validateNewPassword('')).toBe('Password is required')
    expect(validateNewPassword('short')).toBe('Use at least 8 characters')
    expect(validateNewPassword('abcdefgh')).toMatch(/Mix upper/)
    expect(validateNewPassword('Pipeline@2025')).toBeUndefined()
    expect(validateConfirmPassword('', 'Pipeline@2025')).toBe('Confirm your new password')
    expect(validateConfirmPassword('Pipeline@2024', 'Pipeline@2025')).toBe('Passwords do not match')
    expect(validateConfirmPassword('Pipeline@2025', 'Pipeline@2025')).toBeUndefined()
  })

  it('requires a real work email', () => {
    expect(validateEmail('')).toBe('Email is required')
    expect(validateEmail('maya')).toMatch(/valid email/)
    expect(validateEmail('maya.chen@nexrel.io')).toBeUndefined()
  })

  it('requires a password of at least 8 characters', () => {
    expect(validatePassword('')).toBe('Password is required')
    expect(validatePassword('short')).toMatch(/8 characters/)
    expect(validatePassword('Employee@1234')).toBeUndefined()
  })

  it('scores a mixed password as strong', () => {
    expect(passwordStrength('Employee@1234').label).toBe('Strong')
  })

  it('accepts a 6-digit code', () => {
    expect(validateOtp('')).toMatch(/6-digit/)
    expect(validateOtp('12345')).toMatch(/6 digits/)
    expect(validateOtp('123456')).toBeUndefined()
  })

  it('requires a usable phone number', () => {
    expect(validatePhone('')).toBe('Phone is required')
    expect(validatePhone('123')).toMatch(/valid phone/)
    expect(validatePhone('+1 415 555 0142')).toBeUndefined()
  })

  it('validates a profile with an optional phone and a bio limit', () => {
    const valid = { name: 'Maya Chen', email: 'maya.chen@nexrel.io', phone: '', bio: '' }
    expect(validateProfile(valid)).toEqual({})
    expect(validateProfile({ ...valid, name: ' ', phone: '12', bio: 'x'.repeat(BIO_LIMIT + 1) })).toEqual({
      name: 'Full name is required',
      phone: expect.stringMatching(/valid phone/),
      bio: expect.stringMatching(/under 280/),
    })
  })

  it('requires a strong, new, confirmed password', () => {
    const base = { currentPassword: 'Employee@1234', newPassword: 'Pipeline@2026', confirmPassword: 'Pipeline@2026' }
    expect(validatePasswordChange(base)).toEqual({})
    expect(validatePasswordChange({ ...base, currentPassword: '' }).currentPassword).toMatch(/current password/)
    expect(validatePasswordChange({ ...base, newPassword: 'password', confirmPassword: 'password' }).newPassword).toMatch(/Mix upper/)
    expect(validatePasswordChange({ ...base, newPassword: 'Employee@1234', confirmPassword: 'Employee@1234' }).newPassword).toMatch(/different/)
    expect(validatePasswordChange({ ...base, confirmPassword: 'Pipeline@2025' }).confirmPassword).toBe('Passwords do not match')
  })

  it('drops empty field errors', () => {
    expect(compactErrors({ email: 'Email is required', password: undefined })).toEqual({ email: 'Email is required' })
  })
})
