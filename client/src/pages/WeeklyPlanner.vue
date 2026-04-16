<template>
  <div class="planner-page" @click.self="resetSelection">
    <!-- NAVBAR -->
    <header class="navbar">
      <div class="brand">
        <img :src="logo" alt="Meal Planner" class="brand-logo" />
      </div>

      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/favorites">Favorites</router-link>
        <router-link to="/planner">Planner</router-link>

        <!-- AUTH BUTTONS -->
        <template v-if="authUser">
          <button class="signout-btn" @click="handleLogout">
            Sign out
          </button>
        </template>

        <button v-else class="signin-btn" @click.stop="showAuthModal = true">
          Sign in
        </button>
      </nav>
    </header>

    <div class="container">

      <!-- Navigation button to return to previous page -->
      <button class="back-btn" @click="$router.back()">← Back</button>
      <div class="title-row">
        <h1 class="title">Weekly Meal Planner</h1>
        <!-- Action buttons for exporting grocery list and clearing plan -->
        <button class="action-btn primary" @click="exportGroceryList">
          🛒 Export Grocery List
        </button>
        <button class="action-btn secondary" @click="clearPlan">
          🗑 Clear Plan
        </button>
      </div>

      <div class="layout">

        <!-- LEFT: WEEK GRID -->
        <div class="planner-grid">

          <!-- HEADER ROW -->
          <div class="header empty"></div>
          <div class="header" v-for="meal in mealTypes" :key="meal">
            {{ meal }}
          </div>

          <!-- ROWS -->
          <div class="day-row" v-for="day in days" :key="day">
          
            <!-- DAY LABEL -->
            <div 
              class="day-label"
              :class="{ active: selectedDay === day }"
              @click.stop="selectDay(day)"
            >
              {{ day }}
            </div>

            <!-- MEAL CELLS -->
            <div
              v-for="meal in mealTypes"
              :key="day + meal"
              class="cell"
            >

              <div
                v-if="mealPlan[day][meal]"
                class="meal"
                @click.stop="selectRecipe(mealPlan[day][meal])"
              >
                <button 
                  class="remove-btn"
                  @click.stop="removeMeal(day, meal)"
                >
                  ✕
                </button>

                <img :src="mealPlan[day][meal].image" />
                <p>{{ mealPlan[day][meal].title }}</p>
              </div>

              <div v-else class="slot">—</div>
            </div>
          </div>
        </div>

        <!-- RIGHT: MACROS -->
        <div class="macro-box">
          <h2>{{ macroTitle }}</h2>

          <!-- D3.js chart container for visualizing macros -->
          <div ref="chartRef" style="margin-top: 20px;"></div>

          <div class="macro">

            <div class="macro-row">
              <span class="dot" :style="{ background: color('Calories') }"></span>
              <span>Calories</span>
              <strong>{{ macros.calories }}</strong>
            </div>

            <!-- Macro nutrient rows with color-coded dots -->
            <div class="macro-row">
              <span class="dot" :style="{ background: color('Protein') }"></span>
              <span>Protein</span>
              <strong>{{ macros.protein }}g</strong>
            </div>

            <div class="macro-row">
              <span class="dot" :style="{ background: color('Carbs') }"></span>
              <span>Carbs</span>
              <strong>{{ macros.carbs }}g</strong>
            </div>

            <div class="macro-row">
              <span class="dot" :style="{ background: color('Fat') }"></span>
              <span>Fat</span>
              <strong>{{ macros.fat }}g</strong>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Theme toggle button - fixed position bottom left -->
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
    <AuthModal 
      v-if="showAuthModal" 
      @success="onAuthSuccess" 
      @close="showAuthModal = false" 
    />
  </div>
</template>


<script setup>

// Import necessary Vue composition API functions
import { ref, computed } from 'vue'
import * as d3 from 'd3'
import { watch, nextTick } from 'vue'
import AuthModal from '../components/AuthModal.vue'
import { useAuth } from '../composables/useAuth'
import logo from '../assets/ReciPeekLogo.png'

// ===== AUTHENTICATION =====
const { user, fetchUser, logout } = useAuth()

const authUser = computed(() => user.value)

const showAuthModal = ref(false)

// ===== CHART REFERENCE =====
const chartRef = ref(null)

// ===== COLOR SCHEME FOR MACROS =====
const color = d3.scaleOrdinal()
  .domain(['Calories', 'Protein', 'Carbs', 'Fat'])
  .range(['#753742', '#4F3130', '#D3AB9E', '#EAC9C1'])


/**
 * Renders a pie chart using D3.js to visualize macro nutrient distribution
 * Called whenever macro data changes
 */

function renderChart() {
  if (!chartRef.value) return

  // Prepare data for chart
  const data = [
    { name: 'Calories', value: macros.value.calories },
    { name: 'Protein', value: macros.value.protein },
    { name: 'Carbs', value: macros.value.carbs },
    { name: 'Fat', value: macros.value.fat },
  ]

  d3.select(chartRef.value).selectAll('*').remove()      // Clear previous chart

  // Chart dimensions
  const width = 260
  const height = 260
  const radius = Math.min(width, height) / 2

  // Create SVG container
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)

  // Create pie chart layout
  const pie = d3.pie().value(d => d.value)

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 10)

   // Draw pie slices
  const arcs = svg.selectAll('arc')
    .data(pie(data))
    .enter()
    .append('g')

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.name))
    .style('stroke', '#fff')
    .style('stroke-width', '2px')
}

// ===== THEME MANAGEMENT =====
const isDark = ref(false)

/**
 * Toggles between light and dark themes
 * Updates body class and persists preference to localStorage
 */
function toggleTheme() {
  isDark.value = !isDark.value

  if (isDark.value) {
    document.body.classList.add('dark')
  } else {
    document.body.classList.remove('dark')
  }

  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// ===== MEAL PLAN DATA STRUCTURE =====
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const mealTypes = ['Breakfast','Lunch','Dinner','Snack']

// UPDATED STRUCTURE
const mealPlan = ref({
  Mon: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
  Tue: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
  Wed: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
  Thu: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
  Fri: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
  Sat: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
  Sun: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
})

/**
 * Converts abbreviated day names to full names for display
 */
const fullDayName = (short) => {
  return {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday"
  }[short]
}

import { onMounted } from 'vue'

onMounted(async () => {
  const saved = localStorage.getItem('mealPlan')
  if (saved) {
    mealPlan.value = JSON.parse(saved)
  }

  await fetchUser()

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.body.classList.add('dark')
  }
})

async function handleLogout() {
  await logout()
  mealPlan.value = {
    Mon: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Tue: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Wed: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Thu: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Fri: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Sat: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    Sun: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
  }
}

function onAuthSuccess() {
  showAuthModal.value = false
}

watch(authUser, (newUser) => {
  if (!newUser) {
    // user logged OUT → clear planner
    mealPlan.value = {
      Mon: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
      Tue: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
      Wed: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
      Thu: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
      Fri: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
      Sat: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
      Sun: { Breakfast:null, Lunch:null, Dinner:null, Snack:null },
    }
  } else {
    // user logged IN → reload saved plan
    const saved = localStorage.getItem('mealPlan')
    if (saved) {
      mealPlan.value = JSON.parse(saved)
    }
  }
})

// ===== SELECTION STATE =====
const selectedDay = ref(null)
const selectedRecipe = ref(null)

// ===== SELECT LOGIC =====
/**
 * Selects a day and clears recipe selection
 */
  
function selectDay(day) {
  selectedDay.value = day
  selectedRecipe.value = null
}

function removeMeal(day, mealType) {
  mealPlan.value[day][mealType] = null

  localStorage.setItem('mealPlan', JSON.stringify(mealPlan.value))
}

/**
 * Selects a recipe and clears day selection
 */
function selectRecipe(recipe) {
  selectedRecipe.value = recipe
  selectedDay.value = null
}

/**
 * Resets all selections (clears both day and recipe)
 */
function resetSelection() {
  selectedDay.value = null
  selectedRecipe.value = null
}

// ===== MACRO CALCULATIONS =====
/**
 * Computes total macro nutrients for the entire week
 * Sums calories, protein, carbs, and fat from all meals
 */
  
const weeklyMacros = computed(() => {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }

  Object.values(mealPlan.value).forEach(day => {
    Object.values(day).forEach(meal => {
      if (!meal) return
      totals.calories += meal.calories || 0
      totals.protein += meal.protein || 0
      totals.carbs += meal.carbs || 0
      totals.fat += meal.fat || 0
    })
  })

  return totals
})

const dayMacros = computed(() => {
  if (!selectedDay.value) return null

  const meals = mealPlan.value[selectedDay.value]
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 }

  Object.values(meals).forEach(meal => {
    if (!meal) return
    totals.calories += meal.calories || 0
    totals.protein += meal.protein || 0
    totals.carbs += meal.carbs || 0
    totals.fat += meal.fat || 0
  })

  return totals
})

/**
 * Main macro display - shows different data based on selection:
 * - If recipe selected: shows recipe macros
 * - If day selected: shows day totals
 * - Otherwise: shows weekly totals
 */
const macros = computed(() => {
  if (selectedRecipe.value) return selectedRecipe.value
  if (selectedDay.value) return dayMacros.value
  return weeklyMacros.value
})

watch(macros, async () => {
  await nextTick()
  renderChart()
})

const macroTitle = computed(() => {
  if (selectedRecipe.value) return selectedRecipe.value.title
  if (selectedDay.value) return fullDayName(selectedDay.value)
  return "Weekly Nutrition"
})

// ===== UTILITY FUNCTIONS =====

/**
 * Exports all ingredients from the meal plan to a text file
 * Creates a formatted grocery list with checkboxes
 */
function exportGroceryList() {
  const allIngredients = new Set()  // Set auto-deduplicates

  Object.values(mealPlan.value).forEach(meals => {
    Object.values(meals).forEach(meal => {
      if (!meal?.ingredients) return
      meal.ingredients.forEach(ing => allIngredients.add(ing))
    })
  })

  if (allIngredients.size === 0) {
    alert('Add some meals to your plan first!')
    return
  }

  // Format the grocery list
  const today = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  let content = `🍽 Recipeek — Grocery List\nGenerated: ${today}\n`
  content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  allIngredients.forEach(ing => {
    content += `☐  ${ing}\n`
  })
  content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMade with Recipeek ♥`

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'recipeek-grocery-list.txt'
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Clears the entire meal plan after user confirmation
 * Resets all meal slots to null and removes from localStorage
 */
function clearPlan() {
  if (!confirm('Clear your entire meal plan?')) return
  localStorage.removeItem('mealPlan')
  mealPlan.value = {
    Mon: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Tue: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Wed: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Thu: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Fri: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Sat: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Sun: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  }
}

</script>

<style scoped>
.planner-page {
  min-height: 100vh;
  background: #ecdcd4;
}

.container {
  padding: 2rem;
}

.title {
  margin-bottom: 1.5rem;
  color: #4F3130;
}

/* ===== LAYOUT ===== */
.layout {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
}

/* ===== TABLE GRID ===== */
.planner-grid {
  display: grid;
  grid-template-columns: 100px repeat(4, 1fr);
  gap: 0.6rem;
}

/* HEADER */
.header {
  font-weight: 600;
  text-align: center;
  color: #753742;
}

.empty {
  background: transparent;
}

/* DAY LABEL */
.day-label {
  font-weight: 700;
  color: #4F3130;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  text-align: center;

  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.2s ease;
}

/* HOVER ANIMATION */
.day-label:hover {
  transform: translateY(-2px) scale(1.05);
  background: #e0bfb6;
}

/* ACTIVE (CLICKED DAY) */
.day-label.active {
  background: #753742;
  color: #4F3130;
  transform: scale(1.05);
}

/* FORCE MODAL ON TOP */
.auth-modal {
  position: fixed;
  z-index: 99999 !important;
}

/* BACK BUTTON */
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

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #753742;
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  cursor: pointer;
  z-index: 10;
}

.remove-btn:hover {
  background: #4F3130;
}

/* CELLS */
.cell {
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  min-height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.cell:hover {
  transform: translateY(-2px);
}

/* SLOT */
.slot {
  font-size: 0.75rem;
  color: #999;
}

/* MEAL */
.meal img {
  width: 100%;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
}

.meal p {
  font-size: 0.7rem;
  margin-top: 0.2rem;
  font-weight: 600;
  text-align: center;
}

.meal img,
.meal p {
  pointer-events: none;
}

/* ===== MACROS ===== */
.macro-box {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  position: sticky;
  top: 100px;
  height: fit-content;
}

.macro {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

/* CLICKED CELL */
.cell.active {
  border: 2px solid #753742;
  box-shadow: 0 0 0 2px rgba(117, 55, 66, 0.2);
  transform: scale(1.02);
}

.meal {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* ===== DARK MODE ===== */
body.dark .planner-page {
  background: #121212;
  color: #EAEAEA;
}

body.dark .planner-day,
body.dark .macro-box {
  background: #1E1E1E;
}

body.dark .slot {
  background: #2A2A2A;
}

body.dark .day-label {
  color: #EAEAEA;
}

body.dark .day-label:hover {
  background: #2A2A2A;
}

body.dark .day-label.active {
  background: #753742;
  color: white;
}

body.dark .cell.active {
  border: 2px solid #EAC9C1;
  box-shadow: 0 0 0 2px rgba(234, 201, 193, 0.2);
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

/* ===== MOBILE ===== */
@media (max-width: 1100px) {
  .planner-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .layout {
    grid-template-columns: 1fr;
  }
}


/* ===== DAY ROW BACKGROUND (FAKE BIG BOX) ===== */
.day-label,
.cell {
  position: relative;
}

/* add background behind entire row */
.day-label::before {
  content: "";
  position: absolute;
  left: -10px;
  right: -910px; /* stretches across all 4 meal cells */
  top: -6px;
  bottom: -6px;
  background: #f7ece7;
  border: 2px solid #e0bfb6;
  border-radius: 14px;
  z-index: -1;
}

.day-label::before,
.day-row::before {
  pointer-events: none;
}

.day-row {
  display: contents; /* keeps grid layout intact */
}

.day-row::before {
  content: "";
  grid-column: 1 / -1; /* spans FULL row */
  height: 100%;
  background: #f7ece7;
  border: 2px solid #e0bfb6;
  border-radius: 14px;
  z-index: -1;
}

.meal-label {
  position: absolute;
  top: 6px;
  left: 8px;
  font-size: 0.65rem;
  color: #753742;
  font-weight: 600;
}

.macro {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
}

.macro-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.navbar {
  background: #5a3434;
  color: white;
  padding: 1.2rem 1.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.theme-toggle {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  border: none;
  background: #753742;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  z-index: 9999;
}

.theme-toggle svg {
  width: 24px;
  height: 24px;
  display: block;
}

/* LIGHT MODE (moon showing) */
body:not(.dark) .theme-toggle {
  background: #5A3434;   
  color: #F4E6D8;        
}

/* DARK MODE (sun button) */
body.dark .theme-toggle {
  background: #F4E6D8; 
  color: #5a3434;       
}

body.dark .planner-page {
  background: #121212;
  color: #EAEAEA;
}

body.dark .macro-box {
  background: #1E1E1E;
  color: #EAEAEA;
}

body.dark .cell {
  background: #1E1E1E;
}

body.dark .day-label::before {
  background: #1a1a1a;
  border-color: #333;
}

body.dark .navbar {
  background: #1E1E1E;
}

body.dark .day-row::before {
  background: #1a1a1a;
  border-color: #333;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.title-row .title {
  margin-right: auto;
  margin-bottom: 0;
}

/* SHARED BUTTON BASE */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 999px;
  padding: 0.65rem 1.3rem;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

/* primary (export) */
.action-btn.primary {
  background: #753742;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(117, 55, 66, 0.3);
}

.action-btn.primary:hover {
  background: #4F3130;
  transform: translateY(-2px);
}

/* secondary (clear) */
.action-btn.secondary {
  background: white;
  color: #753742;
  border: 1.5px solid #753742;
}

.action-btn.secondary:hover {
  background: #753742;
  color: white;
  transform: translateY(-2px);
}

/* ===== DARK MODE ===== */
body.dark .action-btn.primary {
  background: #EAC9C1;
  color: #4F3130;
}

body.dark .action-btn.primary:hover {
  background: #D3AB9E;
}

body.dark .action-btn.secondary {
  background: rgba(234, 201, 193, 0.1);
  color: #EAC9C1;
  border-color: #EAC9C1;
}

body.dark .action-btn.secondary:hover {
  background: #EAC9C1;
  color: #4F3130;
}
</style>
