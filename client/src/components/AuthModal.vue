<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="overlay" @click.self="$emit('close')">
        <div class="modal">
          <button class="close-btn" @click="$emit('close')">✕</button>

          <div class="modal-header">
            <span class="logo-icon">🍽️</span>
            <h2>{{ isLogin ? 'Welcome back' : 'Create account' }}</h2>
            <p class="subtitle">{{ isLogin ? 'Sign in to your meal planner' : 'Start planning your meals today' }}</p>
          </div>

          <Transition name="slide-down">
            <div v-if="error" class="error-banner">{{ error }}</div>
          </Transition>

          <form @submit.prevent="handleSubmit" class="auth-form">
            <div v-if="!isLogin" class="field">
              <label>Full name</label>
              <input v-model="form.name" type="text" placeholder="Jane Doe" required />
            </div>
            <div class="field">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="you@email.com" required />
            </div>
            <div class="field">
              <label>Password</label>
              <div class="password-wrap">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                />
                <button type="button" class="toggle-pw" @click="showPassword = !showPassword">
                  <svg v-if="showPassword" viewBox="0 0 24 24" class="eye-icon">
                    <!-- closed eye -->
                    <path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" fill="none" stroke="currentColor" stroke-width="2"/>
                    <path d="M4 4l16 16" stroke="currentColor" stroke-width="2"/>
                  </svg>

                  <svg v-else viewBox="0 0 24 24" class="eye-icon">
                    <!-- open eye -->
                    <path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z" fill="none" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-else>{{ isLogin ? 'Sign in' : 'Create account' }}</span>
            </button>
          </form>

          <p class="switch-text">
            {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
            <button class="switch-btn" @click="toggleMode">
              {{ isLogin ? 'Sign up' : 'Sign in' }}
            </button>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuth } from '../composables/useAuth'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'success'])

const { login, register } = useAuth()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const form = reactive({ name: '', email: '', password: '' })

function toggleMode() {
  isLogin.value = !isLogin.value
  error.value = ''
  Object.assign(form, { name: '', email: '', password: '' })
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const user = isLogin.value
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.password)
    emit('success', user)
    emit('close')
  } catch (e) {
    console.error('AUTH ERROR:', e)
    error.value = e?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(79, 49, 48, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}
.modal {
  background: #EBD8D0;
  border-radius: 24px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 24px 60px rgba(79, 49, 48, 0.25);
  border: 1px solid #EAC9C1;
}
.close-btn {
  position: absolute;
  top: 1rem; right: 1rem;
  background: #EAC9C1;
  border: none;
  width: 32px; height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: #4F3130;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.close-btn:hover { background: #D3AB9E; }
.modal-header { text-align: center; margin-bottom: 1.75rem; }
.logo-icon { font-size: 2rem; }
h2 {
  margin: 0.5rem 0 0.25rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: #4F3130;
  font-family: Georgia, serif;
}
.subtitle { color: #753742; font-size: 0.875rem; margin: 0; }
.error-banner {
  background: #753742;
  color: #EBD8D0;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: center;
}
.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
label { font-size: 0.8rem; font-weight: 600; color: #4F3130; letter-spacing: 0.03em; }
input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #D3AB9E;
  border-radius: 12px;
  background: white;
  color: #4F3130;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
input:focus {
  border-color: #753742;
  box-shadow: 0 0 0 3px rgba(117, 55, 66, 0.12);
}
input::placeholder { color: #D3AB9E; }
.password-wrap { position: relative; }
.password-wrap input { padding-right: 3rem; }
.toggle-pw {
  position: absolute;
  right: 0.75rem; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  cursor: pointer; font-size: 1rem;
}
.submit-btn {
  margin-top: 0.5rem;
  padding: 0.85rem;
  background: #4F3130;
  color: #EBD8D0;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}
.submit-btn:hover:not(:disabled) { background: #753742; transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(235,216,208,0.4);
  border-top-color: #EBD8D0;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
.switch-text {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
  color: #4F3130;
}
.switch-btn {
  background: none;
  border: none;
  color: #753742;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0 0.25rem;
  text-decoration: underline;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal { transition: transform 0.25s ease; }
.modal-fade-enter-from .modal { transform: scale(0.95) translateY(10px); }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-6px); }

/* ===== DARK MODE (AUTH MODAL FIX) ===== */

body.dark .overlay {
  background: rgba(0, 0, 0, 0.6);
}

body.dark .modal {
  background: #1E1E1E;
  border: 1px solid #333;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
}

body.dark h2 {
  color: #EAEAEA;
}

body.dark .subtitle {
  color: #BBBBBB;
}

body.dark label {
  color: #CCCCCC;
}

body.dark input {
  background: #2A2A2A;
  color: #EAEAEA;
  border-color: #555;
}

body.dark input::placeholder {
  color: #888;
}

body.dark .close-btn {
  background: #2A2A2A;
  color: #EAEAEA;
}

body.dark .close-btn:hover {
  background: #444;
}

body.dark .submit-btn {
  background: #2A2A2A;
  color: #EAEAEA;
}

body.dark .submit-btn:hover {
  background: #444;
}

body.dark .switch-text {
  color: #BBBBBB;
}

body.dark .switch-btn {
  color: #EAEAEA;
}

body.dark .error-banner {
  background: #5a2a2a;
  color: #EAEAEA;
}

.eye-icon {
  width: 20px;
  height: 20px;
  color: #4F3130;
}

body.dark .eye-icon {
  color: #EAEAEA;
}
</style>