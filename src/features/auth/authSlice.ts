import { createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit'
import { ROLE_LABEL } from '@/lib/constants'
import type { AuthUser, ProfileInput, UserRole } from '@/types'

const SESSION_KEY = 'nexrel-user:session'
const USERS_KEY = 'nexrel-user:users'
const OTP_KEY = 'nexrel-user:otp'
const RESET_KEY = 'nexrel-user:reset'
const AUTH_DELAY_MS = 850
const CHALLENGE_TTL_MS = 10 * 60 * 1000

type StoredUser = AuthUser & { password: string }

export type DemoAccount = {
  email: string
  password: string
  name: string
  role: UserRole
  profile: Pick<AuthUser, 'phone' | 'jobTitle' | 'location' | 'bio' | 'timezone' | 'joinedAt'>
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'maya.chen@nexrel.io',
    password: 'Employee@1234',
    name: 'Maya Chen',
    role: 'employee',
    profile: {
      phone: '+1 415 555 0100',
      jobTitle: 'Sales Associate',
      location: 'San Francisco, CA',
      bio: 'Owns mid-market accounts on the West Coast. Focused on fast follow-ups and clean handoffs to onboarding.',
      timezone: 'America/Los_Angeles',
      joinedAt: '2025-03-10',
    },
  },
]

type OtpChallenge = { email: string; code: string; expiresAt: number }
type ResetGrant = { email: string; token: string; expiresAt: number }

export type PasswordResetRequest = { email: string; code: string }

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

function seedUsers(): StoredUser[] {
  return DEMO_ACCOUNTS.map((account) => ({
    id: `user_${account.role}`,
    name: account.name,
    email: account.email,
    company: 'NexRel Inc.',
    role: account.role,
    roleLabel: ROLE_LABEL[account.role],
    ...account.profile,
    password: account.password,
  }))
}

function toPublicUser(user: StoredUser): AuthUser {
  const { password: _password, ...rest } = user
  return rest
}

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage failures in private mode
  }
}

function readUsers(): StoredUser[] {
  const seeds = seedUsers()
  const stored = readJson<StoredUser[]>(localStorage, USERS_KEY) ?? []
  const byId = new Map<string, StoredUser>()
  for (const seed of seeds) byId.set(seed.id, seed)
  for (const user of stored) {
    const seed = user?.id ? byId.get(user.id) : undefined
    if (seed) byId.set(seed.id, { ...seed, ...user })
  }
  return [...byId.values()]
}

function writeUsers(users: StoredUser[]) {
  writeJson(localStorage, USERS_KEY, users)
}

function readSession(): AuthUser | null {
  const session = readJson<AuthUser>(localStorage, SESSION_KEY) ?? readJson<AuthUser>(sessionStorage, SESSION_KEY)
  if (!session) return null
  const stored = readUsers().find((user) => user.id === session.id)
  return stored ? toPublicUser(stored) : session
}

function writeSession(user: AuthUser, remember: boolean) {
  clearSession()
  writeJson(remember ? localStorage : sessionStorage, SESSION_KEY, user)
}

function refreshSession(user: AuthUser) {
  const remembered = localStorage.getItem(SESSION_KEY) !== null
  writeSession(user, remembered)
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

function createOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function readOtpChallenge(): OtpChallenge | null {
  const challenge = readJson<OtpChallenge>(sessionStorage, OTP_KEY)
  if (!challenge) return null
  if (challenge.expiresAt < Date.now()) {
    sessionStorage.removeItem(OTP_KEY)
    return null
  }
  return challenge
}

export function readResetGrant(): ResetGrant | null {
  const grant = readJson<ResetGrant>(sessionStorage, RESET_KEY)
  if (!grant) return null
  if (grant.expiresAt < Date.now()) {
    sessionStorage.removeItem(RESET_KEY)
    return null
  }
  return grant
}

export const login = createAsyncThunk<
  AuthUser,
  { email: string; password: string; remember: boolean },
  { rejectValue: string }
>('auth/login', async ({ email, password, remember }, { rejectWithValue }) => {
  await wait(AUTH_DELAY_MS)
  const match = readUsers().find((user) => user.email.toLowerCase() === email.trim().toLowerCase())
  if (!match || match.password !== password) {
    return rejectWithValue('Invalid email or password. Please check your details and try again.')
  }
  const user = toPublicUser(match)
  writeSession(user, remember)
  return user
})

export const requestPasswordReset = createAsyncThunk<PasswordResetRequest, { email: string }, { rejectValue: string }>(
  'auth/requestPasswordReset',
  async ({ email }, { rejectWithValue }) => {
    await wait(AUTH_DELAY_MS)
    const normalized = email.trim().toLowerCase()
    const match = readUsers().find((user) => user.email.toLowerCase() === normalized)
    if (!match) {
      return rejectWithValue('We could not find a workspace account for that email.')
    }
    const challenge: OtpChallenge = {
      email: match.email,
      code: createOtp(),
      expiresAt: Date.now() + CHALLENGE_TTL_MS,
    }
    writeJson(sessionStorage, OTP_KEY, challenge)
    sessionStorage.removeItem(RESET_KEY)
    return { email: challenge.email, code: challenge.code }
  },
)

export const verifyOtp = createAsyncThunk<{ email: string; token: string }, { code: string }, { rejectValue: string }>(
  'auth/verifyOtp',
  async ({ code }, { rejectWithValue }) => {
    await wait(AUTH_DELAY_MS)
    const challenge = readOtpChallenge()
    if (!challenge) {
      return rejectWithValue('That code has expired. Request a new one to continue.')
    }
    if (challenge.code !== code.trim()) {
      return rejectWithValue('That code does not match. Check the digits and try again.')
    }
    const grant: ResetGrant = {
      email: challenge.email,
      token: nanoid(24),
      expiresAt: Date.now() + CHALLENGE_TTL_MS,
    }
    writeJson(sessionStorage, RESET_KEY, grant)
    sessionStorage.removeItem(OTP_KEY)
    return { email: grant.email, token: grant.token }
  },
)

export const resetPassword = createAsyncThunk<string, { token: string; password: string }, { rejectValue: string }>(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    await wait(AUTH_DELAY_MS)
    const grant = readResetGrant()
    if (!grant || grant.token !== token) {
      return rejectWithValue('This reset link is no longer valid. Start again from forgot password.')
    }
    const users = readUsers()
    const index = users.findIndex((user) => user.email.toLowerCase() === grant.email)
    if (index < 0) {
      return rejectWithValue('We could not find that account anymore.')
    }
    users[index] = { ...users[index], password, passwordChangedAt: new Date().toISOString() }
    writeUsers(users)
    sessionStorage.removeItem(RESET_KEY)
    return grant.email
  },
)

export const updateProfile = createAsyncThunk<AuthUser, ProfileInput, { state: { auth: AuthState }; rejectValue: string }>(
  'auth/updateProfile',
  async (values, { getState, rejectWithValue }) => {
    await wait(AUTH_DELAY_MS)
    const current = getState().auth.user
    if (!current) return rejectWithValue('Your session has ended. Sign in again to save changes.')
    const users = readUsers()
    const email = values.email.trim().toLowerCase()
    if (users.some((user) => user.id !== current.id && user.email.toLowerCase() === email)) {
      return rejectWithValue('Another account already uses that email address.')
    }
    const index = users.findIndex((user) => user.id === current.id)
    if (index < 0) return rejectWithValue('We could not find your account. Sign in again.')
    users[index] = { ...users[index], ...values, email }
    writeUsers(users)
    const user = toPublicUser(users[index])
    refreshSession(user)
    return user
  },
)

export const changePassword = createAsyncThunk<
  string,
  { currentPassword: string; newPassword: string },
  { state: { auth: AuthState }; rejectValue: string }
>('auth/changePassword', async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
  await wait(AUTH_DELAY_MS)
  const current = getState().auth.user
  if (!current) return rejectWithValue('Your session has ended. Sign in again to change your password.')
  const users = readUsers()
  const index = users.findIndex((user) => user.id === current.id)
  if (index < 0 || users[index].password !== currentPassword) {
    return rejectWithValue('Your current password is incorrect.')
  }
  if (currentPassword === newPassword) {
    return rejectWithValue('Choose a password you have not used for this account.')
  }
  const changedAt = new Date().toISOString()
  users[index] = { ...users[index], password: newPassword, passwordChangedAt: changedAt }
  writeUsers(users)
  refreshSession(toPublicUser(users[index]))
  return changedAt
})

interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading'
  error: string | null
}

const initialState: AuthState = {
  user: readSession(),
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      clearSession()
      state.user = null
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload ?? 'Something went wrong. Please try again.'
      })
      .addCase(requestPasswordReset.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.status = 'idle'
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload ?? 'Something went wrong. Please try again.'
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.status = 'idle'
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload ?? 'Something went wrong. Please try again.'
      })
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'idle'
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload ?? 'Something went wrong. Please try again.'
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        if (state.user) state.user.passwordChangedAt = action.payload
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export const authReducer = authSlice.reducer
