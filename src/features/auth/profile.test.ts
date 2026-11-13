import { describe, expect, it } from 'vitest'
import { makeStore } from '@/app/store'
import { changePassword, login, updateProfile } from './authSlice'
import type { ProfileInput } from '@/types'

async function signedInStore() {
  const store = makeStore()
  await store.dispatch(login({ email: 'maya.chen@nexrel.io', password: 'Employee@1234', remember: false }))
  return store
}

function profileOf(store: Awaited<ReturnType<typeof signedInStore>>): ProfileInput {
  const user = store.getState().auth.user!
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    jobTitle: user.jobTitle ?? '',
    location: user.location ?? '',
    bio: user.bio ?? '',
    timezone: user.timezone ?? 'UTC',
  }
}

describe('profile and password', () => {
  it('saves profile changes to the session and stored account', async () => {
    const store = await signedInStore()
    const result = await store.dispatch(updateProfile({ ...profileOf(store), jobTitle: 'Senior Associate', email: 'Maya.Chen@NexRel.io' }))
    expect(updateProfile.fulfilled.match(result)).toBe(true)
    expect(store.getState().auth.user).toMatchObject({ jobTitle: 'Senior Associate', email: 'maya.chen@nexrel.io' })
    expect(store.getState().auth.user).not.toHaveProperty('password')
    expect(sessionStorage.getItem('nexrel-user:session')).toContain('Senior Associate')
  }, 10000)

  it('rejects a wrong current password and then changes it', async () => {
    const store = await signedInStore()
    const wrong = await store.dispatch(changePassword({ currentPassword: 'Nope@1234', newPassword: 'Pipeline@2026' }))
    expect(changePassword.rejected.match(wrong) && wrong.payload).toBe('Your current password is incorrect.')

    const changed = await store.dispatch(changePassword({ currentPassword: 'Employee@1234', newPassword: 'Pipeline@2026' }))
    expect(changePassword.fulfilled.match(changed)).toBe(true)
    expect(store.getState().auth.user?.passwordChangedAt).toBeTruthy()

    const fresh = makeStore()
    const oldLogin = await fresh.dispatch(login({ email: 'maya.chen@nexrel.io', password: 'Employee@1234', remember: false }))
    expect(login.rejected.match(oldLogin)).toBe(true)
    const newLogin = await fresh.dispatch(login({ email: 'maya.chen@nexrel.io', password: 'Pipeline@2026', remember: false }))
    expect(login.fulfilled.match(newLogin)).toBe(true)
  }, 15000)
})
