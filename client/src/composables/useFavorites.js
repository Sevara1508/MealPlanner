import { ref } from 'vue'

const favorites = ref([])

const API = 'http://localhost:3001/api/recipes'

export function useFavorites() {

  async function loadFavorites() {
    try {
      const res = await fetch(`${API}/favorites/all`, { credentials: 'include' })
      if (!res.ok) { favorites.value = []; return }
      favorites.value = await res.json()
    } catch {
      favorites.value = []
    }
  }

  function isFavorited(recipeId) {
    return favorites.value.some(f => String(f.recipe_id) === String(recipeId))
  }

  async function addFavorite(recipe) {
    const res = await fetch(`${API}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        recipe_id: recipe.id,
        title: recipe.title,
        image: recipe.image,
      }),
    })
    if (res.ok) await loadFavorites()
  }

  async function removeFavorite(recipeId) {
    const res = await fetch(`${API}/favorites/${recipeId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) await loadFavorites()
  }

  async function toggleFavorite(recipe) {
    if (isFavorited(recipe.id)) {
      await removeFavorite(recipe.id)
    } else {
      await addFavorite(recipe)
    }
  }

  return { favorites, loadFavorites, isFavorited, addFavorite, removeFavorite, toggleFavorite }
}