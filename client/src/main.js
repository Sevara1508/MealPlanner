// Import Vue's app factory function
import { createApp } from 'vue'

// Root component
import App from './App.vue'

// Vue Router for page navigation
import router from './router/index.js'

// Global styles
import './style.css'

// Create the app, register the router, and mount to the #app div in index.html
createApp(App).use(router).mount('#app')
