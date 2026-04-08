<template>
  <RouterView />
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