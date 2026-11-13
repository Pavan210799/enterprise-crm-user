const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string) {
  return EMAIL_RE.test(value.trim())
}

export function required(value: string, label: string) {
  if (!value.trim()) return `${label} is required`
  return undefined
}

export function validatePhone(value: string) {
  if (!value.trim()) return 'Phone is required'
  if (value.replace(/\D/g, '').length < 7) return 'Enter a valid phone number'
  return undefined
}

export function validateEmail(value: string) {
  if (!value.trim()) return 'Email is required'
  if (!isValidEmail(value)) return 'Enter a valid email address'
  return undefined
}

export function validatePassword(value: string) {
  if (!value) return 'Password is required'
  if (value.length < 8) return 'Use at least 8 characters'
  return undefined
}

export function passwordStrength(value: string) {
  let score = 0
  if (value.length >= 8) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] }
}

export function validateNewPassword(value: string) {
  return validatePassword(value) ?? (passwordStrength(value).score < 3 ? 'Mix upper and lower case letters, numbers, or symbols' : undefined)
}

export function validateConfirmPassword(confirm: string, password: string) {
  if (!confirm) return 'Confirm your new password'
  if (confirm !== password) return 'Passwords do not match'
  return undefined
}

export function validateOtp(value: string) {
  if (!value.trim()) return 'Enter the 6-digit code'
  if (!/^\d{6}$/.test(value.trim())) return 'The code must be 6 digits'
  return undefined
}

export const BIO_LIMIT = 280

export function validateProfile(values: { name: string; email: string; phone: string; bio: string }) {
  return compactErrors({
    name: !values.name.trim() ? 'Full name is required' : values.name.trim().length < 2 ? 'Enter at least 2 characters' : undefined,
    email: validateEmail(values.email),
    phone: values.phone.trim() ? validatePhone(values.phone) : undefined,
    bio: values.bio.length > BIO_LIMIT ? `Keep your bio under ${BIO_LIMIT} characters` : undefined,
  })
}

export function validatePasswordChange(values: { currentPassword: string; newPassword: string; confirmPassword: string }) {
  return compactErrors({
    currentPassword: values.currentPassword ? undefined : 'Enter your current password',
    newPassword:
      validateNewPassword(values.newPassword) ??
      (values.newPassword === values.currentPassword ? 'Choose a password different from your current one' : undefined),
    confirmPassword: validateConfirmPassword(values.confirmPassword, values.newPassword),
  })
}

export function compactErrors<T extends Record<string, string | undefined>>(errors: T) {
  const next: Partial<Record<keyof T, string>> = {}
  for (const key of Object.keys(errors) as (keyof T)[]) {
    if (errors[key]) next[key] = errors[key]
  }
  return next
}
