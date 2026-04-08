<template>
  <div class="app">

    <!-- NAVBAR -->
    <nav class="navbar">
      <h1>🍽️ Meal Planner</h1>
      <div class="nav-links">
        <span @click="$router.push('/')">Search</span>
        <span>Calendar</span>
        <span>Favorites</span>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const recipe = ref(null)
const loading = ref(true)
const error = ref(null)

const nutrition = ref([])

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
})
</script>

<style scoped>
.back-btn {
  background: none;
  border: none;
  color: var(--dusty-rosewood);
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}
.back-btn:hover {
  color: var(--deep-rosewood);
  text-decoration: underline;
}

.recipe-loading {
  padding: 3rem;
  text-align: center;
  color: var(--dusty-rosewood);
  font-size: 1.2rem;
}

.recipe-hero {
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
</style>
