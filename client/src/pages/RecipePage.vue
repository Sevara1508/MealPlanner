<template>
  <div class="app">

    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="brand">
        <img :src="logo" alt="Meal Planner" class="brand-logo" />
      </div>

      <div class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/favorites">Favorites</router-link>
        <router-link to="/planner">Planner</router-link>

        <template v-if="authUser">
          <button class="signout-btn" @click="handleLogout">Sign out</button>
        </template>
        <button v-else class="signin-btn" @click="showAuthModal = true">
          Sign in
        </button>
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

            <!-- YOUR RATING (shows after you've reviewed) -->
            <div v-if="authUser && userRating" class="your-rating">
              <span class="your-rating-stars">{{ renderStars(userRating) }}</span>
              <span class="your-rating-label">Your rating</span>
            </div>

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
                </select>

                <button class="confirm-btn" @click="handleAdd">Add</button>
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

        <!-- ===== REVIEWS SECTION ===== -->
        <div class="reviews-section">

          <!-- HEADER with average rating -->
          <div class="reviews-header">
            <h2 class="section-title">Ratings & Reviews</h2>
            <div v-if="reviewData.count > 0" class="average-rating">
              <span class="avg-stars">{{ renderStars(reviewData.averageRating) }}</span>
              <span class="avg-number">{{ reviewData.averageRating }}</span>
              <span class="avg-count">({{ reviewData.count }} {{ reviewData.count === 1 ? 'review' : 'reviews' }})</span>
            </div>
            <div v-else class="no-reviews-yet">No reviews yet — be the first!</div>
          </div>

          <!-- WRITE A REVIEW (logged in only) -->
          <div v-if="authUser" class="review-form">
            <h3 class="form-title">{{ hasUserReviewed ? 'Update Your Review' : 'Write a Review' }}</h3>

            <!-- STAR PICKER -->
            <div class="star-picker">
              <button
                v-for="n in 5"
                :key="n"
                class="star-btn"
                :class="{ active: n <= hoverRating || (!hoverRating && n <= selectedRating) }"
                @mouseenter="hoverRating = n"
                @mouseleave="hoverRating = 0"
                @click="selectedRating = n"
              >★</button>
            </div>
            <p v-if="selectedRating" class="rating-label">{{ ratingLabels[selectedRating] }}</p>

            <textarea
              v-model="reviewText"
              class="review-textarea"
              placeholder="Share your thoughts on this recipe..."
              rows="3"
            />

            <div class="form-footer">
              <button
                class="submit-review-btn"
                :disabled="!selectedRating || submittingReview"
                @click="submitReview"
              >
                {{ submittingReview ? 'Saving...' : hasUserReviewed ? 'Update Review' : 'Post Review' }}
              </button>
              <span v-if="reviewSuccess" class="review-success">✓ Saved!</span>
            </div>
          </div>

          <!-- NOT LOGGED IN PROMPT -->
          <div v-else class="review-login-prompt">
            <span>Want to leave a review?</span>
            <button class="signin-inline-btn" @click="showAuthModal = true">Sign in</button>
          </div>

          <!-- REVIEWS LIST -->
          <div v-if="reviewData.reviews.length" class="reviews-list">
            <div
              v-for="review in reviewData.reviews"
              :key="review.id"
              class="review-card"
            >
              <div class="review-top">
                <div class="reviewer-avatar">{{ review.user_name.charAt(0).toUpperCase() }}</div>
                <div class="reviewer-info">
                  <span class="reviewer-name">{{ review.user_name }}</span>
                  <span class="review-date">{{ formatDate(review.created_at) }}</span>
                </div>
                <div class="review-stars">{{ renderStars(review.rating) }}</div>
              </div>
              <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>
            </div>
          </div>

        </div>
        <!-- ===== END REVIEWS ===== -->

      </template>
    </div>

    <AuthModal
      :show="showAuthModal"
      @close="showAuthModal = false"
      @success="onAuthSuccess"
    />

    <button class="theme-toggle" @click="toggleTheme">
      <span v-if="isDark">
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
import { Heart } from 'lucide-vue-next'
import { ref, onMounted, computed} from 'vue'
import { useRoute } from 'vue-router'
import { useFavorites } from '../composables/useFavorites'
import { useAuth } from '../composables/useAuth'
import AuthModal from '../components/AuthModal.vue'
import logo from '../assets/ReciPeekLogo.png'

const route = useRoute()
const recipe = ref(null)
const loading = ref(true)
const error = ref(null)
const nutrition = ref([])

// ── Auth ──
const { user, fetchUser, logout } = useAuth()
const authUser = computed(() => user.value)
const showAuthModal = ref(false)

async function handleLogout() {
  await logout()
  await fetchUser()
}

async function onAuthSuccess() {
  showAuthModal.value = false
  await fetchUser()
  await loadReviews()
}

// ── Meal Planner ──
const showPlanner = ref(false)
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const selectedDay = ref('')
const selectedMeal = ref('')

function handleAdd() {
  if (!authUser.value) {
    showAuthModal.value = true
    return
  }

  if (!recipe.value) {
    alert('Recipe is still loading')
    return
  }

  if (!selectedDay.value || !selectedMeal.value) {
    alert('Select day and meal first')
    return
  }

  const nutrients = nutrition.value || []

  const getVal = (name) =>
    Math.round(nutrients.find((n) => n.name === name)?.amount ?? 0)

  const meal = {
    id: recipe.value.id,
    title: recipe.value.title,
    image: recipe.value.image,
    readyInMinutes: recipe.value.readyInMinutes ?? 0,
    servings: recipe.value.servings ?? 0,
    calories: getVal('Calories'),
    protein: getVal('Protein'),
    carbs: getVal('Carbohydrates'),
    fat: getVal('Fat'),
  }

  const emptyPlan = {
    Mon: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Tue: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Wed: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Thu: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Fri: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Sat: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
    Sun: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  }

  let plan = emptyPlan

  try {
    const saved = JSON.parse(localStorage.getItem('mealPlan'))
    if (saved && typeof saved === 'object') {
      plan = {
        ...emptyPlan,
        ...saved,
        [selectedDay.value]: {
          ...emptyPlan[selectedDay.value],
          ...(saved[selectedDay.value] || {}),
        },
      }
    }
  } catch (e) {
    console.error('Failed to parse mealPlan from localStorage:', e)
  }

  plan[selectedDay.value][selectedMeal.value] = meal

  localStorage.setItem('mealPlan', JSON.stringify(plan))

  showPlanner.value = false
  selectedDay.value = ''
  selectedMeal.value = ''

  alert('Added to meal plan!')
}

// ── Favorites ──
const { isFavorited, toggleFavorite, loadFavorites } = useFavorites()

function handleFavorite(recipe) {
  if (!authUser.value) {
    showAuthModal.value = true
    return
  }

  toggleFavorite(recipe)
  recipe._popping = true
  setTimeout(() => { recipe._popping = false }, 400)
}

// ── Nutrition helper ──
const get = (name) => {
  const found = nutrition.value.find(n => n.name === name)
  return Math.round(found?.amount ?? 0)
}

// ── Reviews ──
const reviewData = ref({ reviews: [], averageRating: null, count: 0 })
const selectedRating = ref(0)
const hoverRating = ref(0)
const reviewText = ref('')
const submittingReview = ref(false)
const reviewSuccess = ref(false)

const ratingLabels = { 1: 'Not worth it', 2: 'Underwhelming', 3: 'Pretty decent', 4: 'Really good', 5: 'Would make again ♥' }

const hasUserReviewed = computed(() => {
  if (!authUser.value) return false
  return reviewData.value.reviews.some(r => r.user_name === authUser.value.name)
})

// shows your star rating in the hero after you've reviewed
const userRating = computed(() => {
  if (!authUser.value) return null
  const mine = reviewData.value.reviews.find(r => r.user_name === authUser.value.name)
  return mine ? mine.rating : null
})

function renderStars(rating) {
  const full = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

async function loadReviews() {
  try {
    const res = await fetch(`http://localhost:3001/api/recipes/${route.params.id}/reviews`)
    if (res.ok) {
      reviewData.value = await res.json()
      if (authUser.value) {
        const mine = reviewData.value.reviews.find(r => r.user_name === authUser.value.name)
        if (mine) {
          selectedRating.value = mine.rating
          reviewText.value = mine.comment || ''
        }
      }
    }
  } catch (err) {
    console.error('Failed to load reviews:', err)
  }
}

async function submitReview() {
  if (!selectedRating.value) return
  submittingReview.value = true
  reviewSuccess.value = false

  try {
    const res = await fetch(`http://localhost:3001/api/recipes/${route.params.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rating: selectedRating.value, comment: reviewText.value })
    })

    if (res.ok) {
      await loadReviews()
      reviewSuccess.value = true
      setTimeout(() => { reviewSuccess.value = false }, 2500)
    }
  } catch (err) {
    console.error('Failed to submit review:', err)
  } finally {
    submittingReview.value = false
  }
}

// ── Dark mode ──
const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// ── Mount ──
onMounted(async () => {
  if (localStorage.getItem('theme') === 'dark') {
    isDark.value = true
    document.body.classList.add('dark')
  }

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

  await fetchUser()
  await loadFavorites()
  await loadReviews()
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

.back-btn:hover { background: var(--soft-blush); border-color: var(--dusty-rosewood); transform: translateY(-1px); }
.back-btn:active { transform: translateY(0); }
.back-btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(117, 55, 66, 0.18); }

.recipe-loading { padding: 3rem; text-align: center; color: var(--dusty-rosewood); font-size: 1.2rem; }

.recipe-hero {
  position: relative;
  display: flex;
  gap: 2rem;
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}

.recipe-hero-img { width: 380px; height: 300px; object-fit: cover; flex-shrink: 0; }

.recipe-hero-info {
  position: relative;
  padding: 1.5rem 1.5rem 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-title { font-size: 1.8rem; color: var(--deep-rosewood); }

/* YOUR RATING */
.your-rating { display: flex; align-items: center; gap: 0.5rem; }
.your-rating-stars { color: #e6a817; font-size: 1.1rem; letter-spacing: 2px; }
.your-rating-label { font-size: 0.78rem; color: #888; font-style: italic; }

.recipe-stats { display: flex; flex-wrap: wrap; gap: 8px; }

.stat-chip { background: var(--pale-blush); color: var(--dusty-rosewood); border-radius: 20px; padding: 4px 14px; font-size: 0.85rem; }

.nutrition-summary { display: flex; gap: 1.5rem; }
.nutrition-item { display: flex; flex-direction: column; align-items: center; }
.nutrition-value { font-size: 1.3rem; font-weight: 700; color: var(--deep-rosewood); }
.nutrition-label { font-size: 0.75rem; color: var(--dusty-rosewood); text-transform: uppercase; letter-spacing: 0.05em; }

.recipe-summary {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-body { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; }

.recipe-section { background: white; border-radius: 18px; padding: 1.5rem; box-shadow: 0 6px 18px rgba(0,0,0,0.08); }

.section-title { color: var(--deep-rosewood); margin-bottom: 1rem; font-size: 1.2rem; }

.ingredients-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }

.ingredient-item { display: flex; gap: 10px; font-size: 0.9rem; border-bottom: 1px solid var(--pale-blush); padding-bottom: 8px; }

.ingredient-amount { color: var(--dusty-rosewood); font-weight: 600; }

.steps-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; }

.step-item { display: flex; gap: 1rem; align-items: flex-start; font-size: 0.9rem; line-height: 1.6; }

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

/* ===== REVIEWS ===== */

.reviews-section {
  background: white;
  border-radius: 18px;
  padding: 1.8rem;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reviews-header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.reviews-header .section-title { margin-bottom: 0; }

.average-rating { display: flex; align-items: center; gap: 0.4rem; }
.avg-stars { color: #e6a817; font-size: 1.1rem; letter-spacing: 2px; }
.avg-number { font-weight: 700; font-size: 1rem; color: var(--deep-rosewood); }
.avg-count { font-size: 0.85rem; color: #888; }
.no-reviews-yet { font-size: 0.9rem; color: #999; font-style: italic; }

.review-form {
  background: var(--pale-blush, #fdf3f0);
  border-radius: 14px;
  padding: 1.2rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-title { font-size: 1rem; font-weight: 600; color: var(--deep-rosewood); margin: 0; }

.star-picker { display: flex; gap: 4px; }

.star-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #ccc; padding: 0; line-height: 1; transition: color 0.15s ease, transform 0.1s ease; }
.star-btn.active { color: #e6a817; }
.star-btn:hover { transform: scale(1.2); }

.rating-label { font-size: 0.85rem; color: var(--dusty-rosewood); font-weight: 600; margin: 0; }

.review-textarea {
  width: 100%;
  border: 1.5px solid #e0c8c0;
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  background: white;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.review-textarea:focus { outline: none; border-color: var(--dusty-rosewood); }

.form-footer { display: flex; align-items: center; gap: 1rem; }

.submit-review-btn {
  background: #5a3434;
  color: white;
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  font-family: inherit;
}

.submit-review-btn:hover:not(:disabled) { background: #7a4545; }
.submit-review-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.review-success { color: #2e7d32; font-size: 0.9rem; font-weight: 600; }

.review-login-prompt {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #777;
  background: var(--pale-blush, #fdf3f0);
  border-radius: 12px;
  padding: 1rem 1.2rem;
}

.signin-inline-btn {
  background: #5a3434;
  color: white;
  border: none;
  border-radius: 999px;
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.signin-inline-btn:hover { background: #7a4545; }

.reviews-list { display: flex; flex-direction: column; gap: 1rem; }

.review-card { border: 1px solid #f0e0d8; border-radius: 14px; padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 0.5rem; }

.review-top { display: flex; align-items: center; gap: 0.75rem; }

.reviewer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #5a3434;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  flex-shrink: 0;
}

.reviewer-info { display: flex; flex-direction: column; flex: 1; }
.reviewer-name { font-size: 0.9rem; font-weight: 600; color: var(--deep-rosewood); }
.review-date { font-size: 0.78rem; color: #aaa; }
.review-stars { color: #e6a817; font-size: 0.95rem; letter-spacing: 2px; }
.review-comment { font-size: 0.9rem; color: #555; line-height: 1.6; margin: 0; padding-left: 0.25rem; }

/* ===== NAVBAR ===== */

.navbar { background: #5a3434; color: #fff; padding: 1.2rem 1.8rem; display: flex; justify-content: space-between; align-items: center; }
.brand { display: flex; align-items: center; gap: 0.5rem; }
.brand-icon { font-size: 1.4rem; }
.brand-text { font-size: 2rem; font-weight: 700; color: white; }
.nav-links { display: flex; align-items: center; gap: 1.25rem; }
.nav-links a { color: white; text-decoration: none; font-weight: 500; }

.signin-btn, .signout-btn { border-radius: 999px; padding: 0.6rem 1rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: 0.2s ease; }
.signin-btn { background: transparent; color: white; border: 1.5px solid #d9b7ac; }
.signin-btn:hover { background: rgba(255, 255, 255, 0.12); }
.signout-btn { background: #f7ece7; color: #5a3434; border: 1.5px solid #d9b7ac; }
.signout-btn:hover { background: #ecd3ca; }

/* ===== MEAL PLANNER DROPDOWN ===== */

.planner-dropdown { position: absolute; top: 10px; right: 60px; z-index: 200; }
.planner-btn { background: #5a3434; color: white; border: none; border-radius: 999px; padding: 0.5rem 1.2rem; font-size: 0.9rem; cursor: pointer; }

.dropdown {
  position: absolute;
  top: 110%;
  right: 0;
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

.dropdown select { padding: 0.4rem; border-radius: 8px; border: 1px solid #ccc; }
.confirm-btn { background: #5a3434; color: white; border: none; border-radius: 8px; padding: 0.4rem; cursor: pointer; }

/* ===== HEART ===== */

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

.heart-btn:hover { transform: scale(1.1); }

/* ===== RESPONSIVE ===== */

@media (max-width: 768px) {
  .recipe-hero { flex-direction: column; }
  .recipe-hero-img { width: 100%; height: 220px; }
  .recipe-hero-info { padding: 1rem; }
  .recipe-body { grid-template-columns: 1fr; }
}

/* ===== DARK MODE ===== */

body.dark .app { background: #121212; color: #EAEAEA; }
body.dark .recipe-hero, body.dark .recipe-section, body.dark .reviews-section { background: #1E1E1E; color: #EAEAEA; }
body.dark .recipe-summary { color: #CCCCCC; }
body.dark .step-number { background: #444; }
body.dark .back-btn { background: #2A2A2A; color: #EAEAEA; border-color: #555; }
body.dark .navbar { background: #1E1E1E; }
body.dark .dropdown, body.dark .review-form, body.dark .review-login-prompt { background: #2A2A2A; color: #EAEAEA; }
body.dark .dropdown select { background: #333; color: #EAEAEA; border-color: #555; }
body.dark .planner-btn, body.dark .confirm-btn { background: #2A2A2A; }
body.dark .review-card { background: #252525; border-color: #333; }
body.dark .review-comment { color: #CCCCCC; }
body.dark .review-textarea { background: #333; color: #EAEAEA; border-color: #555; }
body.dark .no-reviews-yet { color: #777; }
body.dark .reviewer-name { color: #EAEAEA; }
body.dark .avg-number { color: #EAEAEA; }
body.dark .your-rating-label { color: #777; }

/* LIGHT MODE (moon showing) */
body:not(.dark) .theme-toggle {
  background: #5A3434;   /* dark rosewood */
  color: #F4E6D8;        /* soft cream moon */
}

/* DARK MODE (sun button) */
body.dark .theme-toggle {
  background: #F4E6D8; /* warm golden */
  color: #5a3434;       /* dark icon contrast */
}
</style>
