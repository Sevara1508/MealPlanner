<template>
  <div class="app">

    <!-- NAVBAR -->
    <nav class="navbar">
      <h1>🍽️ Meal Planner</h1>
      <div class="nav-links">
        <span>Search</span>
        <span>Calendar</span>
        <span>Favorites</span>
      </div>
    </nav>

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
            :key="recipe.idMeal"
          >
            <img :src="recipe.strMealThumb" />
            <h3>{{ recipe.strMeal }}</h3>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const query = ref('')
const recipes = ref([])

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

const searchRecipes = async () => {
  console.log("clicked", query.value)  // 👈 ADD THIS LINE

  if (!query.value) return

  try {
    const res = await axios.get(
      `http://localhost:3000/api/recipes?search=${query.value}`
    )

    console.log("API response:", res.data) // 👈 ADD THIS TOO

    recipes.value = res.data
  } catch (err) {
    console.error(err)
  }
}
</script>