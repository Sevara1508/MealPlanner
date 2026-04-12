// Meal planner website - Home Page
<template>
  <div class="page">
    <header class="navbar">
      <div class="brand">
        <span class="brand-icon">🍽</span>
        <span class="brand-text">Meal Planner</span>
      </div>

      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/favorites">Favorites</router-link>

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
            @keyup.enter="searchRecipes"
          />
          <button @click="searchRecipes">Search</button>
        </div>
        <div class="filters">
          <label>
            <input type="checkbox" v-model="filters.vegetarian" />
            Vegetarian
          </label>

          <label>
            <input type="checkbox" v-model="filters.vegan" />
            Vegan
          </label>

          <label>
            <input type="checkbox" v-model="filters.glutenFree" />
            Gluten Free
          </label>

          <label>
            <input type="checkbox" v-model="filters.dairyFree" />
            Dairy Free
          </label>

          <div>
            <label>Max Time (mins): </label>
            <input
              type="number"
              v-model.number="filters.maxTime"
              placeholder="e.g. 30"
            />
          </div>

          <div>
            <label>Servings: </label>
            <input
              type="number"
              v-model.number="filters.servings"
              placeholder="e.g. 4"
            />
          </div>

        </div>
        <div v-if="recipes.length" class="recipe-grid">
          <div
            v-for="recipe in filteredRecipes"
            :key="recipe.id"
            class="recipe-card"
            draggable="true"
            @dragstart="dragStart(recipe)"
            @click="$router.push(`/recipe/${recipe.id}`)"
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
        <NutritionCharts :mealPlan="mealPlan" />
      </section>
    </main>

    <AuthModal
      :show="showAuthModal"
      @close="showAuthModal = false"
      @success="onAuthSuccess"
    />

    <button class="theme-toggle" @click="toggleTheme">
      <span v-if="isDark">
        <!-- REAL SUN ICON -->
        <svg viewBox="0 0 24 24" class="icon">
          <circle cx="12" cy="12" r="5" />
          <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
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
          <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>
        </svg>
      </span>
    </button>
  </div>
</template>

<script setup>
import NutritionCharts from '../components/NutritionCharts.vue'
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

const filters = ref({
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  dairyFree: false,
  maxTime: null,
  servings: null,
})

const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) => {
    const nutrients = recipe.nutrition?.nutrients || []

    const calories = nutrients.find(n => n.name === 'Calories')?.amount || 0

    const isVegetarian = recipe.vegetarian === true
    const isVegan = recipe.vegan === true
    const isGlutenFree = recipe.glutenFree === true
    const isDairyFree = recipe.dairyFree === true

    const time = recipe.readyInMinutes || 0
    const servings = recipe.servings || 0

    const ingredients = [
      ...(recipe.missedIngredients || []),
      ...(recipe.usedIngredients || []),
    ].map(i => (i.name || '').toLowerCase())

    //vegetarian filter
    if (filters.value.vegetarian && !isVegetarian) return false

    //vegan filter
    if (filters.value.vegan && !isVegan) return false

    //gluten filter
    if (filters.value.glutenFree && !isGlutenFree) return false

    //dairy filter
    if (filters.value.dairyFree && !isDairyFree) return false

    //time filter
    if (filters.value.maxTime && time > filters.value.maxTime) return false

    // servings filter
    if (filters.value.servings && servings < filters.value.servings) return false

    return true
  })
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

async function dropMeal(day) {
  if (!draggedRecipe.value) return

  try {
    const res = await axios.get(`http://localhost:3001/api/recipes/${draggedRecipe.value.id}`, {
      params: { includeNutrition: true },
      withCredentials: true,
    })

    const nutrients = res.data.nutrition?.nutrients || []
    const get = (name) => Math.round(nutrients.find(n => n.name === name)?.amount ?? 0)

    mealPlan.value[day] = {
      ...draggedRecipe.value,
      calories: get('Calories'),
      protein: get('Protein'),
      carbs: get('Carbohydrates'),
      fat: get('Fat'),
    }
  } catch (err) {
    console.error('Failed to fetch nutrition on drop:', err)
    mealPlan.value[day] = draggedRecipe.value // fallback without nutrition
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

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.body.classList.add('dark')
  }
})
</script>

<style>

:root {
  --deep-rosewood: #4F3130;
  --dusty-rosewood: #753742;
  --warm-beige: #D3AB9E;
  --soft-blush: #EAC9C1;
  --pale-blush: #EBD8D0;
}

body.dark {
  --deep-rosewood: #2A2A2A;
  --dusty-rosewood: #3A3A3A;
  --warm-beige: #555;
  --soft-blush: #2A2A2A;
  --pale-blush: #121212;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
  align-items: center;

  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  color: var(--deep-rosewood);
}

.filters label {
  font-weight: 500;
  color: var(--dusty-rosewood);
}

.filters input {
  background: transparent;
  border: 1px solid var(--warm-beige);
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  color: var(--deep-rosewood);
}

.filters input:focus {
  outline: none;
  border-color: var(--dusty-rosewood);
  box-shadow: 0 0 0 2px rgba(117, 55, 66, 0.15);
}

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
  flex: 1;
  min-width: 300px;
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

.theme-toggle {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  border: none;
  background: var(--dusty-rosewood);
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  z-index: 9999;
  transition: all 0.3s ease;

  padding: 0;             
}

.theme-toggle svg {
  width: 24px;
  height: 24px;

  display: block;          
  margin: auto;            

  transform: translateY(1px); 
}


/* ================= DARK MODE ================= */

body.dark .page {
  background: #121212;
  color: #EAEAEA;
}

body.dark .navbar {
  background: #1E1E1E;
}

body.dark .search-section h2,
body.dark .weekly-plan h2,
body.dark .nutrition-section h2 {
  color: #EAEAEA;
}

body.dark .recipe-card,
body.dark .day-card,
body.dark .nutrition-box {
  background: #1E1E1E;
  color: #EAEAEA;
}

body.dark .search-bar input {
  background: #2A2A2A;
  color: #EAEAEA;
}

body.dark .drop-zone {
  background: #2A2A2A;
  color: #EAEAEA;
  border-color: #555;
}

body.dark .filters label {
  color: #CCCCCC;
}

body.dark .filters input {
  color: #EAEAEA;
  border-color: #555;
}

body.dark .day-card h3 {
  color: #BBBBBB;
}

body.dark .signout-btn {
  background: #2A2A2A;
  color: #EAEAEA;
}

body.dark .signin-btn {
  border-color: #777;
}

* {
  transition: 
    background-color 0.4s ease,
    color 0.4s ease,
    border-color 0.4s ease,
    box-shadow 0.4s ease;
}

</style>