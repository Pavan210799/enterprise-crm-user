import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage'
import { renderWithProviders } from '@/test/renderWithProviders'

describe('LoginPage', () => {
  it('validates required fields before submitting', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' })
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('fills a demo account from the role picker', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' })
    await userEvent.click(screen.getByRole('button', { name: /Maya Chen/ }))
    expect(screen.getByLabelText('Work email')).toHaveValue('maya.chen@nexrel.io')
    expect(screen.getByLabelText('Password')).toHaveValue('Employee@1234')
  })

  it('shows an error for invalid credentials', async () => {
    renderWithProviders(<LoginPage />, { route: '/login' })
    await userEvent.type(screen.getByLabelText('Work email'), 'maya.chen@nexrel.io')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong-password')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText(/invalid email or password/i, {}, { timeout: 2500 })).toBeInTheDocument()
  })

  it('signs in with valid credentials and stores the session', async () => {
    const { store } = renderWithProviders(<LoginPage />, { route: '/login' })
    await userEvent.type(screen.getByLabelText('Work email'), 'maya.chen@nexrel.io')
    await userEvent.type(screen.getByLabelText('Password'), 'Employee@1234')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(store.getState().auth.user?.email).toBe('maya.chen@nexrel.io'), { timeout: 2500 })
    expect(sessionStorage.getItem('nexrel-user:session')).toContain('maya.chen@nexrel.io')
  })
})
