import { ref } from 'vue'

// Shared state — defined outside so all components access the same favorites list
const favorites = ref([])

const API = 'http://localhost:3001/api/recipes'

export function useFavorites() {

  // Fetches the logged-in user's saved favorites from the server
  async function loadFavorites() {
    try {
      const res = await fetch(`${API}/favorites/all`, { credentials: 'include' })
      if (!res.ok) { favorites.value = []; return }
      favorites.value = await res.json()
    } catch {
      favorites.value = []
    }
  }

  // Returns true if the given recipe ID is in the favorites list
  function isFavorited(recipeId) {
    return favorites.value.some(f => String(f.recipe_id) === String(recipeId))
  }

  // Saves a recipe to favorites, then refreshes the list
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

  // Removes a recipe from favorites by ID, then refreshes the list
  async function removeFavorite(recipeId) {
    const res = await fetch(`${API}/favorites/${recipeId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) await loadFavorites()
  }

  // Toggles a recipe's favorite status — adds if not saved, removes if already saved
  async function toggleFavorite(recipe) {
    if (isFavorited(recipe.id)) {
      await removeFavorite(recipe.id)
    } else {
      await addFavorite(recipe)
    }
  }

  return { favorites, loadFavorites, isFavorited, addFavorite, removeFavorite, toggleFavorite }
}
