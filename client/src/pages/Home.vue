<template>
  <div class="page">
    <header class="navbar">
      <div class="brand">
        <span class="brand-icon">🍽</span>
        <span class="brand-text">Meal Planner</span>
      </div>

      <nav class="nav-links">
        <a href="#">Search</a>
        <a href="#">Calendar</a>
        <a href="#">Favorites</a>

        <template v-if="authUser">
          <button class="signout-btn" @click="handleLogout">Sign out</button>
        </template>

        <button v-else class="signin-btn" @click="showAuthModal = true">
          Sign in
        </button>
      </nav>
    </header>

    <main class="content">
      <section class="search-section">
        <h2>Find Recipes</h2>

        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search recipes..."
          />
          <button @click="searchRecipes">Search</button>
        </div>

        <div v-if="recipes.length" class="recipe-grid">
          <div
            v-for="recipe in recipes"
            :key="recipe.id"
            class="recipe-card"
            draggable="true"
            @dragstart="dragStart(recipe)"
          >
            <img :src="recipe.image" :alt="recipe.title" />
            <p>{{ recipe.title }}</p>
          </div>
        </div>
      </section>

      <section class="weekly-plan">
        <h2>Weekly Plan</h2>

        <div class="days-grid">
          <div
            v-for="day in days"
            :key="day"
            class="day-card"
            @dragover.prevent
            @drop="dropMeal(day)"
          >
            <h3>{{ day }}</h3>

            <div class="drop-zone">
              <template v-if="mealPlan[day]">
                <div class="planned-meal">
                  <img :src="mealPlan[day].image" :alt="mealPlan[day].title" />
                  <p>{{ mealPlan[day].title }}</p>
                </div>
              </template>

              <template v-else>
                <span>Drop meals</span>
              </template>
            </div>
          </div>
        </div>
      </section>

      <section class="nutrition-section">
        <h2>Nutrition Overview</h2>

        <div class="nutrition-grid">
          <div class="nutrition-box">Pie Chart</div>
          <div class="nutrition-box">Bar Chart</div>
        </div>
      </section>
    </main>

    <AuthModal
      :show="showAuthModal"
      @close="showAuthModal = false"
      @success="onAuthSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '../composables/useAuth'
import AuthModal from '../components/AuthModal.vue'

const { user, fetchUser, logout } = useAuth()

const authUser = computed(() => user.value)

const showAuthModal = ref(false)
const searchQuery = ref('')
const recipes = ref([])
const draggedRecipe = ref(null)

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const mealPlan = ref({
  Mon: null,
  Tue: null,
  Wed: null,
  Thu: null,
  Fri: null,
  Sat: null,
  Sun: null,
})

async function searchRecipes() {
  if (!searchQuery.value.trim()) return

  try {
    const res = await axios.get('http://localhost:3001/api/recipes/search', {
      params: { query: searchQuery.value },
      withCredentials: true,
    })

    recipes.value = res.data.results || []
  } catch (err) {
    console.error('Recipe search error:', err)
  }
}

function dragStart(recipe) {
  draggedRecipe.value = recipe
}

function dropMeal(day) {
  if (draggedRecipe.value) {
    mealPlan.value[day] = draggedRecipe.value
  }
}

async function handleLogout() {
  await logout()
}

function onAuthSuccess() {
  showAuthModal.value = false
}

onMounted(async () => {
  await fetchUser()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #ecdcd4;
  color: #2f1d1d;
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

.brand-icon {
  font-size: 1.4rem;
}

.brand-text {
  font-size: 2rem;
  font-weight: 700;
  color: white;
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

.content {
  padding: 2rem 1.8rem 3rem;
}

.search-section h2,
.weekly-plan h2,
.nutrition-section h2 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #1f1010;
}

.search-bar {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.search-bar input {
  width: 265px;
  padding: 0.8rem 0.9rem;
  border: none;
  border-radius: 12px;
  background: white;
}

.search-bar button {
  background: #5a3434;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-weight: 600;
  cursor: pointer;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.recipe-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: grab;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.recipe-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.recipe-card p {
  padding: 0.8rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.day-card {
  background: white;
  border-radius: 16px;
  padding: 0.6rem;
  min-height: 120px;
}

.day-card h3 {
  margin: 0 0 0.6rem;
  color: #8a4e5c;
  font-size: 1rem;
}

.drop-zone {
  border: 2px dashed #b97c8a;
  border-radius: 14px;
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.5rem;
  color: #4d2b2b;
  background: #fffdfd;
}

.planned-meal img {
  width: 100%;
  max-width: 90px;
  height: 60px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 0.4rem;
}

.planned-meal p {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.nutrition-box {
  background: white;
  border-radius: 18px;
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a4e5c;
  font-weight: 500;
}

@media (max-width: 1100px) {
  .days-grid {
    grid-template-columns: repeat(3, 1fr);
  }
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

  .days-grid,
  .nutrition-grid {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-bar input {
    width: 100%;
  }
}
</style>