<template>
  <div class="favorites-page">
    <header class="navbar">
      <div class="brand">
        <img :src="logo" alt="Meal Planner" class="brand-logo" />
      </div>

      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/favorites">Favorites</router-link>
        <router-link to="/planner">Planner</router-link>

        <template v-if="authUser">
          <button class="signout-btn" @click="handleLogout">Sign out</button>
        </template>

        <button v-else class="signin-btn" @click="showAuthModal = true">
          Sign in
        </button>
      </nav>
    </header>

    <div class="favorites-content">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <h1 class="title">Your Favorites</h1>
      
      <div v-if="!authUser" class="empty">
        <p>Please sign in to view your favorites.</p>
      </div>

      <div v-else-if="favorites.length === 0" class="empty">
        <p>No favorite recipes yet</p>
        <span>Start adding some delicious meals!</span>
      </div>

      <transition-group name="fade" tag="div" class="grid">
        <div
          v-for="recipe in favorites"
          :key="recipe.recipe_id"
          class="card"
          @click="$router.push(`/recipe/${recipe.recipe_id}`)"
        >
          <img :src="recipe.image" alt="recipe" />
          <div class="card-content">
            <h2>{{ recipe.title }}</h2>
            <button
              class="heart-btn"
              :class="{ popping: recipe._popping }"
              @click.stop="handleUnfavorite(recipe.recipe_id, recipe)"
            >
              <Heart
                :key="recipe.recipe_id"
                fill="#e74c3c"
                stroke="#e74c3c"
                :size="18"
              />
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <AuthModal
      :show="showAuthModal"
      @close="showAuthModal = false"
      @success="onAuthSuccess"
    />

    <button class="theme-toggle" @click="toggleTheme">
      <span v-if="isDark">
        <!-- REAL SUN ICON -->
        <svg viewBox="0 0 24 24" class="icon">
          <!-- CENTER -->
          <circle cx="12" cy="12" r="5" fill="#5A3434"/>

          <!-- RAYS -->
          <g stroke="#5A3434" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="1" x2="12" y2="4"/>
            <line x1="12" y1="20" x2="12" y2="23"/>
            <line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/>
            <line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/>
            <line x1="1" y1="12" x2="4" y2="12"/>
            <line x1="20" y1="12" x2="23" y2="12"/>
            <line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/>
            <line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/>
          </g>
        </svg>
      </span>
      <span v-else>
        <!-- Moon -->
        <svg viewBox="0 0 24 24" class="icon">
          <path
            d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Heart } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import logo from '../assets/ReciPeekLogo.png'
import { useFavorites } from '../composables/useFavorites'
import AuthModal from '../components/AuthModal.vue'

const { user, logout, fetchUser } = useAuth()
const authUser = computed(() => user.value)

const showAuthModal = ref(false)

const { favorites, loadFavorites, removeFavorite } = useFavorites()

function handleUnfavorite(recipeId, recipe) {
  removeFavorite(recipeId)

  recipe._popping = true

  setTimeout(() => {
    recipe._popping = false
  }, 400)
}

async function handleLogout() {
  await logout()
}

async function onAuthSuccess() {
  showAuthModal.value = false
  await fetchUser()
  await loadFavorites()
}

onMounted(async () => {
  await fetchUser()
  await loadFavorites()

  // 🌙 DARK MODE LOAD
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.body.classList.add('dark')
  }
})

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value

  if (isDark.value) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }

  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: #ecdcd4;
}

.favorites-content {
  padding: 2rem;
}

.navbar {
  background: #5a3434;
  color: #fff;
  padding: 1.2rem 1.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.signin-btn,
.signout-btn {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.signin-btn {
  background: transparent;
  color: white;
  border: 1.5px solid #d9b7ac;
}

.signin-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.signout-btn {
  background: #f7ece7;
  color: #5a3434;
  border: 1.5px solid #d9b7ac;
}

.signout-btn:hover {
  background: #ecd3ca;
}

.title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--deep-rosewood);
}

.empty {
  text-align: center;
  color: #777;
  margin-top: 3rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.card {
  position: relative;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 24px rgba(0,0,0,0.15);
}

.card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-content h2 {
  font-size: 1.1rem;
  margin-bottom: auto;
  padding-bottom: 0.75rem;
}

.unsave-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f7ece7;
  color: #5a3434;
  border: 1.5px solid #d9b7ac;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}

.unsave-btn:hover {
  background: #ecd3ca;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@media (max-width: 700px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .nav-links {
    flex-wrap: wrap;
  }

  .favorites-content {
    padding: 1.2rem;
  }
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
  align-self: flex-start;
  background: white;
  border: 1.5px solid var(--warm-beige);
  color: var(--deep-rosewood);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.back-btn:hover {
  background: var(--soft-blush);
  border-color: var(--dusty-rosewood);
  transform: translateY(-1px);
}

.back-btn:active {
  transform: translateY(0);
}

.back-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(117, 55, 66, 0.18);
}

/* ===== DARK MODE ===== */

body.dark .favorites-page {
  background: #121212;
  color: #EAEAEA;
}

body.dark .card {
  background: #1E1E1E;
  color: #EAEAEA;
}

body.dark .title {
  color: #EAEAEA;
}

body.dark .empty {
  color: #BBBBBB;
}

body.dark .unsave-btn {
  background: #2A2A2A;
  color: #EAEAEA;
  border-color: #555;
}

body.dark .back-btn {
  background: #2A2A2A;
  color: #EAEAEA;
  border-color: #555;
}

body.dark .back-btn:hover {
  background: #753742;  /* your accent color */
  color: white;
  border-color: #753742;
}

body.dark .navbar {
  background: #1E1E1E;
}

/* 🌙 LIGHT MODE (moon showing) */
body:not(.dark) .theme-toggle {
  background: #5A3434;   /* dark rosewood */
  color: #F4E6D8;        /* soft cream moon */
}

/* DARK MODE (sun button) */
body.dark .theme-toggle {
  background: #F4E6D8; /* warm golden */
  color: #5a3434;       /* dark icon contrast */
}

.heart-btn {
  position: absolute;
  top: 10px;
  right: 10px;

  background: white;
  border: none;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;

  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  z-index: 10;

  transition: transform 0.15s ease;
}

.heart-btn:hover {
  transform: scale(1.1);
}

.heart-btn.popping {
  animation: heartPop 0.4s ease;
}

@keyframes heartPop {
  0% { transform: scale(1); }
  30% { transform: scale(1.4); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

</style>