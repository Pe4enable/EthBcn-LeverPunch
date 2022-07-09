import { createRouter, createWebHistory } from 'vue-router'
import Gallery from '../views/Gallery.vue'

const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: 'Characters',
    component: Gallery
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
