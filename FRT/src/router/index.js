import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BlackListView from '../views/BlackListView.vue'
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
      path: '/black_list',
      name: 'black_list',
      component: BlackListView,
	  meta: { title: `Danh sách đen | ${appName}` }
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
