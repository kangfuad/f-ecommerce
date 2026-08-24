import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CatalogView from '../views/CatalogView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import OrderSuccessView from '../views/OrderSuccessView.vue'
import MyOrdersView from '../views/MyOrdersView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/katalog',
    name: 'catalog',
    component: CatalogView,
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutView,
  },
  {
    path: '/pembayaran',
    redirect: '/checkout',
  },
  {
    path: '/order-success/:orderId',
    name: 'order-success',
    component: OrderSuccessView,
  },
  {
    path: '/pesanan-saya',
    name: 'my-orders',
    component: MyOrdersView,
    meta: { requiresAuth: true },
  },
  {
    path: '/riwayat-sewa',
    redirect: '/pesanan-saya',
  },
  {
    path: '/my-orders',
    redirect: '/pesanan-saya',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  },
})

// Navigation Guard: Protect auth-only routes
router.beforeEach((to, _from, next) => {
  const userRaw = localStorage.getItem('epunyasewa_auth_user')
  const isLoggedIn = !!userRaw

  if (to.matched.some((record) => record.meta.requiresAuth) && !isLoggedIn) {
    // Redirect to home if unauthenticated
    next({ path: '/', query: { redirect: to.fullPath, auth: 'login' } })
  } else {
    next()
  }
})
