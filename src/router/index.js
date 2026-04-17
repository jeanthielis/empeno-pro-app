import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '../stores/auth'
import Swal from 'sweetalert2'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import InspetorHome from '../views/InspetorHome.vue'
import NovaInspecao from '../views/NovaInspecao.vue'
import NovaInspecaoDimensional from '../views/NovaInspecaoDimensional.vue'
import NovaInspecaoAtrito from '../views/NovaInspecaoAtrito.vue'
import RelatorioFinalTurno from '../views/RelatorioFinalTurno.vue'
import RelatorioGeral from '../views/RelatorioGeral.vue'
import Admin from '../views/Admin.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',               name: 'Login',                  component: Login },

    // Admin e Analista
    { path: '/dashboard',      name: 'Dashboard',              component: Dashboard,               meta: { requiresAuth: true, roles: ['admin', 'analista'] } },

    // Hub do Inspetor (home exclusiva)
    { path: '/home',           name: 'InspetorHome',           component: InspetorHome,            meta: { requiresAuth: true, roles: ['inspetor'] } },

    // Admin e Inspetor criam análises
    { path: '/nova-inspecao',  name: 'NovaInspecao',           component: NovaInspecao,            meta: { requiresAuth: true, roles: ['admin', 'inspetor'] } },
    { path: '/dimensional',    name: 'NovaInspecaoDimensional',component: NovaInspecaoDimensional, meta: { requiresAuth: true, roles: ['admin', 'inspetor'] } },
    { path: '/atrito',         name: 'NovaInspecaoAtrito',     component: NovaInspecaoAtrito,      meta: { requiresAuth: true, roles: ['admin', 'inspetor'] } },
    { path: '/relatorio-turno',name: 'RelatorioFinalTurno',    component: RelatorioFinalTurno,     meta: { requiresAuth: true, roles: ['admin', 'inspetor'] } },

    // Apenas Admin
    { path: '/admin',             name: 'Admin',          component: Admin,          meta: { requiresAuth: true, roles: ['admin'] } },
    { path: '/relatorio-geral',   name: 'RelatorioGeral', component: RelatorioGeral, meta: { requiresAuth: true, roles: ['admin', 'analista'] } },
  ]
})

// Home por perfil
const homePorPerfil = {
  admin:    '/dashboard',
  analista: '/dashboard',
  inspetor: '/home',
}

const getCurrentUser = () =>
  new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(getAuth(), user => { unsub(); resolve(user) }, reject)
  })

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)

  if (requiresAuth) {
    const user = await getCurrentUser()
    if (!user) {
      Swal.fire({ icon: 'warning', title: 'Acesso Negado', text: 'Sessão expirada ou não iniciada.', confirmButtonColor: '#2563eb' })
      next('/')
      return
    }
  }

  // Verifica perfil se disponível
  const routeRoles = to.meta.roles
  if (routeRoles) {
    try {
      const authStore = useAuthStore()
      const perfil = authStore.userProfile
      if (perfil && !routeRoles.includes(perfil)) {
        next(homePorPerfil[perfil] ?? '/')
        return
      }
    } catch { /* Pinia ainda não iniciado, App.vue trata */ }
  }

  next()
})

export default router