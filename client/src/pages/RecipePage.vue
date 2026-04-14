<template>
  <div class="app">

    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="brand">
        <span class="brand-icon">🍽</span>
        <span class="brand-text">Meal Planner</span>
      </div>

      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/favorites">Favorites</router-link>
        <router-link to="/planner">Planner</router-link>
        <button class="signin-btn">Sign in</button>
      </div>
    </nav>

    <div class="container">

      <!-- BACK -->
      <button class="back-btn" @click="$router.back()">← Back</button>

      <!-- LOADING / ERROR -->
      <div v-if="loading" class="recipe-loading">Loading recipe...</div>
      <div v-else-if="error" class="recipe-loading">{{ error }}</div>

      <template v-else>

        <!-- HERO -->
        <div class="recipe-hero">
          <img :src="recipe.image" :alt="recipe.title" class="recipe-hero-img" />
          <div class="recipe-hero-info">
            <h1 class="recipe-title">{{ recipe.title }}</h1>

            <!-- CHIPS -->
            <div class="recipe-stats">
              <div v-if="recipe.readyInMinutes" class="stat-chip">⏱ {{ recipe.readyInMinutes }} min</div>
              <div v-if="recipe.servings" class="stat-chip">🍽 {{ recipe.servings }} servings</div>
              <div v-for="diet in recipe.diets?.slice(0,2)" :key="diet" class="stat-chip">🌿 {{ diet }}</div>
            </div>

            <!-- HEART BUTTON (TOP RIGHT) -->
            <button
              class="heart-btn"
              :class="{ popping: recipe._popping }"
              @click.stop="handleFavorite(recipe)"
            >
              <Heart
                :key="recipe.id + '-' + isFavorited(recipe.id)"
                :fill="isFavorited(recipe.id) ? '#e74c3c' : 'none'"
                :stroke="isFavorited(recipe.id) ? '#e74c3c' : '#555'"
                :size="22"
              />
            </button>

            <!-- ADD TO MEAL PLAN -->
            <div class="planner-dropdown">
              <button class="planner-btn" @click="showPlanner = !showPlanner">
                + Add to Meal Plan
              </button>

              <div v-if="showPlanner" class="dropdown">
                <label>Day</label>
                <select v-model="selectedDay">
                  <option disabled value="">Select day</option>
                  <option v-for="day in days" :key="day">{{ day }}</option>
                </select>

                <label>Meal</label>
                <select v-model="selectedMeal">
                  <option disabled value="">Select meal</option>
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>

                <button class="confirm-btn" @click="handleAdd">
                  Add
                </button>
              </div>
            </div>

            <!-- NUTRITION -->
            <div v-if="nutrition.length" class="nutrition-summary">
              <div class="nutrition-item">
                <span class="nutrition-value">{{ get('Calories') }}</span>
                <span class="nutrition-label">kcal</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-value">{{ get('Protein') }}g</span>
                <span class="nutrition-label">protein</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-value">{{ get('Carbohydrates') }}g</span>
                <span class="nutrition-label">carbs</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-value">{{ get('Fat') }}g</span>
                <span class="nutrition-label">fat</span>
              </div>
            </div>

            <!-- SUMMARY -->
            <p class="recipe-summary" v-html="recipe.summary" />
          </div>
        </div>

        <!-- BODY -->
        <div class="recipe-body">

          <!-- INGREDIENTS -->
          <div class="recipe-section">
            <h2 class="section-title">Ingredients</h2>
            <ul class="ingredients-list">
              <li v-for="ing in recipe.extendedIngredients" :key="ing.id" class="ingredient-item">
                <span class="ingredient-amount">{{ ing.amount }} {{ ing.unit }}</span>
                <span>{{ ing.name }}</span>
              </li>
            </ul>
          </div>

          <!-- INSTRUCTIONS -->
          <div class="recipe-section">
            <h2 class="section-title">Instructions</h2>
            <ol class="steps-list">
              <li v-for="step in recipe.analyzedInstructions?.[0]?.steps" :key="step.number" class="step-item">
                <div class="step-number">{{ step.number }}</div>
                <p>{{ step.step }}</p>
              </li>
            </ol>
          </div>

        </div>
      </template>
    </div>
    
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
import { Heart } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFavorites } from '../composables/useFavorites'

const route = useRoute()
const recipe = ref(null)
const loading = ref(true)
const error = ref(null)

const nutrition = ref([])

const showPlanner = ref(false)

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const selectedDay = ref('')
const selectedMeal = ref('')

function handleAdd() {
  if (!selectedDay.value || !selectedMeal.value) {
    alert("Select day and meal first")
    return
  }

  const nutrients = nutrition.value || []

  const getVal = (name) =>
    Math.round(nutrients.find(n => n.name === name)?.amount ?? 0)

  const meal = {
    ...recipe.value,
    calories: getVal('Calories'),
    protein: getVal('Protein'),
    carbs: getVal('Carbohydrates'),
    fat: getVal('Fat'),
  }

  // get existing plan OR create fresh
  const plan = JSON.parse(localStorage.getItem('mealPlan')) || {
    Mon: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Tue: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Wed: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Thu: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Fri: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Sat: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Sun: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
  }

  plan[selectedDay.value][selectedMeal.value] = meal

  localStorage.setItem('mealPlan', JSON.stringify(plan))

  showPlanner.value = false
}

const { isFavorited, toggleFavorite, loadFavorites } = useFavorites()

function handleFavorite(recipe) {
  toggleFavorite(recipe)

  recipe._popping = true

  setTimeout(() => {
    recipe._popping = false
  }, 400)
}

const get = (name) => {
  const found = nutrition.value.find(n => n.name === name)
  return Math.round(found?.amount ?? 0)
}

onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:3001/api/recipes/${route.params.id}?includeNutrition=true`)
    if (!res.ok) throw new Error('Recipe not found')
    const data = await res.json()
    recipe.value = data
    nutrition.value = data.nutrition?.nutrients || []
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }

  await loadFavorites()

  // 🌙 DARK MODE LOAD (THIS IS THE ONLY ADDITION)
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

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.body.classList.add('dark')
  }
})

</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  width: fit-content;
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

.recipe-loading {
  padding: 3rem;
  text-align: center;
  color: var(--dusty-rosewood);
  font-size: 1.2rem;
}

.recipe-hero {
  position: relative;
  display: flex;
  gap: 2rem;
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}

.recipe-hero-img {
  width: 380px;
  height: 300px;
  object-fit: cover;
  flex-shrink: 0;
}

.recipe-hero-info {
  position: relative;
  padding: 1.5rem 1.5rem 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-title {
  font-size: 1.8rem;
  color: var(--deep-rosewood);
}

.recipe-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-chip {
  background: var(--pale-blush);
  color: var(--dusty-rosewood);
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 0.85rem;
}

.fav-btn {
  align-self: flex-start;
  background: #5a3434;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1.2rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nutrition-summary {
  display: flex;
  gap: 1.5rem;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nutrition-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--deep-rosewood);
}

.nutrition-label {
  font-size: 0.75rem;
  color: var(--dusty-rosewood);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.recipe-summary {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-body {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

.recipe-section {
  background: white;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}

.section-title {
  color: var(--deep-rosewood);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.ingredients-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ingredient-item {
  display: flex;
  gap: 10px;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--pale-blush);
  padding-bottom: 8px;
}

.ingredient-amount {
  color: var(--dusty-rosewood);
  font-weight: 600;
  min-width: 70px;
}

.steps-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  font-size: 0.9rem;
  line-height: 1.6;
}

.step-number {
  background: var(--deep-rosewood);
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .recipe-hero {
    flex-direction: column;
  }
  .recipe-hero-img {
    width: 100%;
    height: 220px;
  }
  .recipe-hero-info {
    padding: 1rem;
  }
  .recipe-body {
    grid-template-columns: 1fr;
  }
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

.signin-btn {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
  background: transparent;
  color: white;
  border: 1.5px solid #d9b7ac;
}

.signin-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

/* ===== DARK MODE ===== */

body.dark .app {
  background: #121212;
  color: #EAEAEA;
}

body.dark .recipe-hero,
body.dark .recipe-section {
  background: #1E1E1E;
  color: #EAEAEA;
}

body.dark .recipe-summary {
  color: #CCCCCC;
}

body.dark .step-number {
  background: #444;
}

body.dark .back-btn {
  background: #2A2A2A;
  color: #EAEAEA;
  border-color: #555;
}

body.dark .navbar {
  background: #1E1E1E;
}

/* ===== MEAL PLANNER DROPDOWN ===== */

.planner-dropdown {
  position: absolute;
  top: 10px;
  right: 60px;
  z-index: 200;
}

.planner-btn {
  background: #5a3434;
  color: white;
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.2rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  left: auto;
  background: white;
  padding: 1rem;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 180px;
  z-index: 100;
}

.dropdown select {
  padding: 0.4rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.confirm-btn {
  background: #5a3434;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.4rem;
  cursor: pointer;
}

/* DARK MODE */

body.dark .dropdown {
  background: #1E1E1E;
  color: #EAEAEA;
}

body.dark .dropdown select {
  background: #2A2A2A;
  color: #EAEAEA;
  border-color: #555;
}

body.dark .planner-btn,
body.dark .confirm-btn {
  background: #2A2A2A;
}

.heart-btn {
  position: absolute;
  top: 10px;
  right: 10px;

  background: white;
  border: none;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;

  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  z-index: 10;

  transition: transform 0.15s ease;
}

.heart-btn:hover {
  transform: scale(1.1);
}

</style>