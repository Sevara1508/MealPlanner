<template>
  <RouterView />
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// Search query input and results list
const query = ref('')
const recipes = ref([])

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

// Fetches recipes from the backend based on the search query
const searchRecipes = async () => {
  console.log("clicked", query.value)  

  if (!query.value) return

  try {
    const res = await axios.get(
      `http://localhost:3000/api/recipes?search=${query.value}`
    )

    console.log("API response:", res.data) 

    recipes.value = res.data
  } catch (err) {
    console.error(err)
  }
}
</script>
