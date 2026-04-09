<template>
  <div class="favorites-page">
    <h1 class="title">Your Favorites</h1>

    <div v-if="!authUser" class="empty">
      <p>Please sign in to view your favorites.</p>
    </div>

    <div v-else-if="favorites.length === 0" class="empty">
      <p>No favorite recipes yet</p>
      <span>Start adding some delicious meals!</span>
    </div>

    <transition-group name="fade" tag="div" class="grid">
      <div
        v-for="recipe in favorites"
        :key="recipe.recipe_id"
        class="card"
        @click="$router.push(`/recipe/${recipe.recipe_id}`)"
      >
        <img :src="recipe.image" alt="recipe" />
        <div class="card-content">
          <h2>{{ recipe.title }}</h2>
          <button class="unsave-btn" @click.stop="removeFavorite(recipe.recipe_id)">
            <Bookmark :fill="'#5a3434'" :size="16" />
            Unsave
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Bookmark } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import { useFavorites } from '../composables/useFavorites'

const { user } = useAuth()
const authUser = computed(() => user.value)

const { favorites, loadFavorites, removeFavorite } = useFavorites()

onMounted(async () => {
  await loadFavorites()
})
</script>

<style scoped>
.favorites-page { padding: 2rem; }
.title { font-size: 2rem; margin-bottom: 1.5rem; }
.empty { text-align: center; color: #777; margin-top: 3rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 24px rgba(0,0,0,0.15);
}

.card img { width: 100%; height: 150px; object-fit: cover; }

.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-content h2 {
  font-size: 1.1rem;
  margin-bottom: auto;
  padding-bottom: 0.75rem;
}

.unsave-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f7ece7;
  color: #5a3434;
  border: 1.5px solid #d9b7ac;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}
.unsave-btn:hover { background: #ecd3ca; }

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.9); }
</style>