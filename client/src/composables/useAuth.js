import { ref, readonly } from 'vue'

const user = ref(null)
const loading = ref(true)

const API_BASE = 'http://localhost:3001'

export function useAuth() {
  async function fetchUser() {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        credentials: 'include',
      })

      user.value = res.ok ? (await res.json()).user : null
    } catch (err) {
      console.error('fetchUser error:', err)
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      user.value = data.user
      return data.user
    } catch (err) {
      console.error('login error:', err)
      throw new Error(err?.message || 'Login failed')
    }
  }

  async function register(name, email, password) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')

      user.value = data.user
      return data.user
    } catch (err) {
      console.error('register error:', err)
      throw new Error(err?.message || 'Registration failed')
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('logout error:', err)
    } finally {
      user.value = null
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    fetchUser,
    login,
    register,
    logout,
  }
}