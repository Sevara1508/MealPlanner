<template>
  <nav class="navbar">
    <h1 class="logo" @click="$router.push('/')">🍽️ Meal Planner</h1>

    <div class="nav-links">
      <span @click="$router.push('/')">Search</span>
      <span @click="$router.push('/calendar')">Calendar</span>
      <span @click="$router.push('/favorites')">Favorites</span>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.logo {
  cursor: pointer;
}
</style>