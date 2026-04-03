<template>
  <div>
    <h1>meal planner</h1>

    <input v-model="query" placeholder="search recipes" />
    <button @click="handleSearch">search</button>

    <div v-for="recipe in recipes" :key="recipe.id">
      <h3>{{ recipe.title }}</h3>
      <img :src="recipe.image" :alt="recipe.title" width="200" />
    </div>
  </div>
</template>

<script>
import { searchRecipes } from './services/api'

export default {
  data() {
    return {
      query: '',
      recipes: []
    }
  },
  methods: {
    async handleSearch() {
      this.recipes = await searchRecipes(this.query)
    }
  }
}
</script>