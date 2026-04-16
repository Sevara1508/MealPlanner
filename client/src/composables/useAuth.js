import { ref, readonly } from 'vue'

// Shared state — defined outside the function so all components use the same instance
const user = ref(null)
const loading = ref(true)

const API_BASE = 'http://localhost:3001'

export function useAuth() {

  // Fetches the current logged-in user from the server using the JWT cookie
  // Called on page load to restore session
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

  // Logs in with email and password, sets the user state on success
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

  // Registers a new account and logs them in immediately on success
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

  // Clears the JWT cookie on the server and resets user state to null
  async function logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('logout error:', err)
    } finally {
      user.value = null      // always clear user even if request fails
    }
  }

  return {
    user: readonly(user),      // exposed as readonly to prevent accidental mutation
    loading: readonly(loading),
    fetchUser,
    login,
    register,
    logout,
  }
}
