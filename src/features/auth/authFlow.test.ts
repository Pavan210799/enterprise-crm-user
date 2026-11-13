import { describe, expect, it } from 'vitest'
import { login, requestPasswordReset, resetPassword, verifyOtp } from '@/features/auth/authSlice'
import { makeStore } from '@/app/store'

describe('auth flow', () => {
  it('rejects an unknown account', async () => {
    const store = makeStore()
    const result = await store.dispatch(login({ email: 'maya.chen@nexrel.io', password: 'wrong-password', remember: false }))
    expect(login.rejected.match(result)).toBe(true)
    expect(store.getState().auth.user).toBeNull()
  })

  it('signs the demo account into the session', async () => {
    const store = makeStore()
    const result = await store.dispatch(login({ email: 'maya.chen@nexrel.io', password: 'Employee@1234', remember: true }))
    expect(login.fulfilled.match(result)).toBe(true)
    expect(store.getState().auth.user?.name).toBe('Maya Chen')
    expect(localStorage.getItem('nexrel-user:session')).toContain('maya.chen@nexrel.io')
  })

  it('resets a password after the one-time code is verified', async () => {
    const store = makeStore()
    const requested = await store.dispatch(requestPasswordReset({ email: 'maya.chen@nexrel.io' }))
    expect(requestPasswordReset.fulfilled.match(requested)).toBe(true)
    if (!requestPasswordReset.fulfilled.match(requested)) return

    const wrong = await store.dispatch(verifyOtp({ code: '000000' }))
    expect(verifyOtp.rejected.match(wrong)).toBe(true)

    const verified = await store.dispatch(verifyOtp({ code: requested.payload.code }))
    expect(verifyOtp.fulfilled.match(verified)).toBe(true)
    if (!verifyOtp.fulfilled.match(verified)) return

    const reset = await store.dispatch(resetPassword({ token: verified.payload.token, password: 'Newpass@123' }))
    expect(resetPassword.fulfilled.match(reset)).toBe(true)

    const signedIn = await store.dispatch(login({ email: 'maya.chen@nexrel.io', password: 'Newpass@123', remember: false }))
    expect(login.fulfilled.match(signedIn)).toBe(true)
    expect(sessionStorage.getItem('nexrel-user:session')).toContain('maya.chen@nexrel.io')
  }, 15000)

  it('refuses a reset for an email that is not registered', async () => {
    const store = makeStore()
    const result = await store.dispatch(requestPasswordReset({ email: 'missing@nexrel.io' }))
    expect(requestPasswordReset.rejected.match(result)).toBe(true)
  })
})
