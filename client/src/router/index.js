import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import RecipePage from '../pages/RecipePage.vue'
import Favorites from '../pages/Favorites.vue'
import WeeklyPlanner from '../pages/WeeklyPlanner.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/recipe/:id', component: RecipePage },
    { path: '/favorites', component: Favorites },
    {path: '/planner', component: WeeklyPlanner}, 
  ]
})

export default router