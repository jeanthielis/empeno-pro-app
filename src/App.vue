<template>
  <div class="bg-gray-50 text-gray-800 dark:bg-slate-950 dark:text-slate-100 font-sans antialiased min-h-screen">
    <router-view></router-view>
    <PwaInstallPrompt />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from './firebase'
import { useAuthStore } from './stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'

const authStore = useAuthStore()
const router    = useRouter()
const route     = useRoute()

const homePorPerfil = {
  admin:    '/dashboard',
  analista: '/dashboard',
  inspetor: '/home',
}

// Rotas permitidas por perfil (para validar após reload)
const rotasPermitidas = {
  admin:    ['/', '/dashboard', '/nova-inspecao', '/dimensional', '/atrito', '/relatorio-turno', '/admin', '/home'],
  analista: ['/', '/dashboard'],
  inspetor: ['/', '/home', '/nova-inspecao', '/dimensional', '/atrito', '/relatorio-turno'],
}

useRegisterSW({
  onRegistered(r)   { console.log('[PWA] SW registado:', r) },
  onRegisterError(e){ console.error('[PWA] Erro SW:', e) },
})

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const loginName = user.email.split('@')[0]
        const q = query(collection(db, 'usuarios'), where('login', '==', loginName))
        const snap = await getDocs(q)

        let perfil = 'inspetor'
        if (!snap.empty) {
          const data = snap.docs[0].data()
          perfil = data.perfil || (data.admin ? 'admin' : 'inspetor')
        }

        authStore.setUsuario(user, perfil)

        // Redireciona se a rota atual não é permitida para o perfil
        const rotasOk = rotasPermitidas[perfil] ?? ['/']
        if (!rotasOk.includes(route.path)) {
          router.replace(homePorPerfil[perfil] ?? '/')
        }

      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      }
    } else {
      authStore.limparSessao()
    }
  })
})
</script>