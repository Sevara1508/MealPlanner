```vue
<template>
  <div class="planner-page">

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
      </div>
    </nav>

    <div class="container">
      <h1 class="title">Weekly Meal Planner</h1>

      <div class="planner-grid">
        <div v-for="day in days" :key="day" class="planner-day">
          <h2>{{ day }}</h2>

          <div class="meal-slot">
            <span>Breakfast</span>
            <div class="slot">—</div>
          </div>

          <div class="meal-slot">
            <span>Lunch</span>
            <div class="slot">—</div>
          </div>

          <div class="meal-slot">
            <span>Dinner</span>
            <div class="slot">—</div>
          </div>
        </div>
      </div>

      <!-- MACRO PLACEHOLDER -->
      <div class="macro-box">
        <h2>Weekly Nutrition Overview</h2>
        <p>Macro chart coming soon...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
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

.planner-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.planner-day {
  background: white;
  border-radius: 16px;
  padding: 1rem;
}

.meal-slot {
  margin-top: 0.8rem;
}

.meal-slot span {
  font-size: 0.85rem;
  color: #753742;
}

.slot {
  margin-top: 0.3rem;
  padding: 0.6rem;
  background: #f7ece7;
  border-radius: 10px;
}

.macro-box {
  margin-top: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
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
</style>
```
