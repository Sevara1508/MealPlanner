<template>
  <div class="container">
    <!-- SEARCH -->
    <section class="search-section">
      <h2>Find Recipes</h2>

      <div class="search-bar">
        <input v-model="query" placeholder="Search recipes..." />
        <button @click="searchRecipes">Search</button>
      </div>

      <div class="recipe-grid">
        <div
          class="card"
          v-for="recipe in recipes"
          :key="recipe.id"
          @click="$router.push(`/recipe/${recipe.id}`)"
        >
          <img :src="recipe.image" :alt="recipe.title" />
          <h3>{{ recipe.title }}</h3>
        </div>
      </div>
    </section>

    <!-- CALENDAR -->
    <section class="calendar-section">
      <h2>Weekly Plan</h2>

      <div class="calendar">
        <div class="day" v-for="day in days" :key="day">
          <h4>{{ day }}</h4>
          <div class="drop-zone">
            <p>Drop meals</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CHARTS -->
    <section class="charts-section">
      <h2>Nutrition Overview</h2>
      <div class="charts">
        <div class="chart-box">Pie Chart</div>
        <div class="chart-box">Bar Chart</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const query = ref('')
const recipes = ref([])

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const searchRecipes = async () => {
  if (!query.value) return

  try {
    const res = await axios.get(
      `http://localhost:3001/api/recipes/search?query=${query.value}`
    )
    recipes.value = res.data.results
  } catch (err) {
    console.error(err)
  }
}
</script>