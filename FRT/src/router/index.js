import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BlackListView from '../views/BlackListView.vue'

const appName = 'Công cụ tìm kiếm tài khoản lộ lọt';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
	  meta: { title: `Trang chủ | ${appName}` }
    },
    {
      path: '/blacklist',
      name: 'blacklist',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: BlackListView,
	  meta: { title: `Trang chủ | ${appName}` }
    },
  ],
})

router.beforeEach((to, from, next) => {
	document.title = to.meta.title || appName
	next()
})

export default router
