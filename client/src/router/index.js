import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import RecipePage from '../pages/RecipePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/recipe/:id', component: RecipePage },
  ]
})

export default router