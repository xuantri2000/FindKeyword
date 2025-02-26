import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TargetListView from '../views/TargetListView.vue'

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
      path: '/target_list',
      name: 'target_list',
      component: TargetListView,
	  meta: { title: `Mục tiêu | ${appName}` }
    },
  ],
})

router.beforeEach((to, from, next) => {
	document.title = to.meta.title || appName
	next()
})

export default router
