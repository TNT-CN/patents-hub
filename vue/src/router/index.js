import { createRouter, createWebHistory } from 'vue-router'
import SearchComponent from '/home/libohan/search-project/src/components/Searchcomponent.vue'
import PatentDetail from '/home/libohan/search-project/src/components/PatentDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: SearchComponent
  },
  {
    path: '/patents/:application_number',
    name: 'PatentDetail',
    component: PatentDetail,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router