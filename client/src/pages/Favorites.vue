<template>
  <div class="favorites-page">
    <h1 class="title">Your Favorites</h1>

    <!-- Empty State -->
    <div v-if="favorites.length === 0" class="empty">
      <p>No favorite recipes yet </p>
      <span>Start adding some delicious meals!</span>
    </div>

    <!-- Favorites Grid -->
    <transition-group name="fade" tag="div" class="grid">
      <div
        v-for="recipe in favorites"
        :key="recipe.id"
        class="card"
      >
        <img :src="recipe.image" alt="recipe" />

        <div class="card-content">
          <h2>{{ recipe.title }}</h2>

          <button @click="removeFavorite(recipe.id)">
            Remove ❌
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: "Favorites",

  data() {
    return {
      favorites: []
    };
  },

  mounted() {
    // Load from localStorage
    const saved = localStorage.getItem("favorites");
    this.favorites = saved ? JSON.parse(saved) : [];
  },

  methods: {
    removeFavorite(id) {
      this.favorites = this.favorites.filter(r => r.id !== id);
      localStorage.setItem("favorites", JSON.stringify(this.favorites));
    }
  }
};
</script>

<style scoped>
/* PAGE */
.favorites-page {
  padding: 2rem;
}

/* TITLE */
.title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

/* EMPTY STATE */
.empty {
  text-align: center;
  color: #777;
  margin-top: 3rem;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

/* CARD */
.card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: scale(1.03);
  box-shadow: 0 10px 24px rgba(0,0,0,0.15);
}

/* IMAGE */
.card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

/* CONTENT */
.card-content {
  padding: 1rem;
}

.card-content h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

/* BUTTON */
button {
  background: #ff6b6b;
  border: none;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #ff4c4c;
}

/* ANIMATIONS */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>