<template>
  <!-- ═══════════════════════════════════════════════════════════════
       DESKTOP: sidebar lateral retrátil (md+)
       MOBILE: bottom navigation bar + drawer lateral
  ══════════════════════════════════════════════════════════════════ -->

  <!-- ── DESKTOP sidebar ──────────────────────────────────────────── -->
  <aside
    v-if="authStore.userProfile !== 'inspetor'"
    :class="[isCollapsed ? 'w-20' : 'w-64']"
    class="hidden md:flex relative z-30 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col transition-all duration-300 ease-in-out shrink-0"
  >
    <!-- Toggle recolher -->
    <button @click="toggleSidebar"
      class="absolute -right-3.5 top-8 bg-blue-600 text-white rounded-full p-1.5 shadow-md hover:bg-blue-700 transition-transform hover:scale-110 z-40 flex items-center justify-center">
      <i :class="isCollapsed ? 'ph-bold ph-caret-right' : 'ph-bold ph-caret-left'"></i>
    </button>

    <!-- Logo -->
    <div class="p-6 border-b border-gray-100 dark:border-slate-800 font-bold text-lg text-blue-600 dark:text-blue-400 flex items-center h-20 overflow-hidden"
      :class="isCollapsed ? 'justify-center' : 'justify-start gap-2'">
      <i class="ph ph-sliders text-3xl shrink-0"></i>
      <transition name="fade"><span v-if="!isCollapsed" class="whitespace-nowrap">QualityControl</span></transition>
    </div>

    <!-- Nav links -->
    <nav class="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
      <router-link v-if="authStore.userProfile !== 'inspetor'" to="/dashboard"
        class="flex items-center w-full py-3 rounded-lg font-bold transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
        active-class="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'"
        :title="isCollapsed ? 'Dashboard' : ''">
        <i class="ph ph-chart-pie-slice text-2xl shrink-0"></i>
        <transition name="fade"><span v-if="!isCollapsed" class="whitespace-nowrap">Dashboard</span></transition>
      </router-link>

      <router-link v-if="authStore.userProfile === 'admin'" to="/admin"
        class="flex items-center w-full py-3 rounded-lg font-bold transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400"
        active-class="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'"
        :title="isCollapsed ? 'Administração' : ''">
        <i class="ph ph-gear text-2xl shrink-0"></i>
        <transition name="fade"><span v-if="!isCollapsed" class="whitespace-nowrap">Administração</span></transition>
      </router-link>
    </nav>

    <!-- Tema -->
    <div class="px-4 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-col items-center gap-2 overflow-hidden">
      <div v-if="!isCollapsed" class="flex justify-between items-center w-full mb-1">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Tema Visual</span>
      </div>
      <button @click="toggleTheme"
        class="p-2.5 w-full flex items-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm overflow-hidden"
        :class="isCollapsed ? 'justify-center' : 'justify-start gap-3'"
        :title="isDark ? 'Modo Claro' : 'Modo Escuro'">
        <i :class="isDark ? 'ph-fill ph-sun text-xl shrink-0' : 'ph-fill ph-moon text-xl text-blue-600 shrink-0'"></i>
        <transition name="fade">
          <span v-if="!isCollapsed" class="text-sm font-bold whitespace-nowrap">{{ isDark ? 'Modo Claro' : 'Modo Escuro' }}</span>
        </transition>
      </button>
    </div>

    <!-- Ações de inspeção -->
    <div v-if="authStore.userProfile === 'admin' || authStore.userProfile === 'inspetor'"
      class="p-4 border-t border-gray-100 dark:border-slate-800 space-y-3 overflow-hidden">
      <router-link to="/nova-inspecao" class="w-full flex items-center text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 py-3 rounded-xl font-bold transition-colors"
        :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-2'" :title="isCollapsed ? 'Medir Empeno' : ''">
        <i class="ph-bold ph-squares-four text-xl shrink-0"></i>
        <transition name="fade"><span v-if="!isCollapsed" class="whitespace-nowrap">Medir Empeno</span></transition>
      </router-link>
      <router-link to="/dimensional" class="w-full flex items-center text-sm bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 hover:bg-violet-200 py-3 rounded-xl font-bold transition-colors"
        :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-2'" :title="isCollapsed ? 'Dimensional' : ''">
        <i class="ph-bold ph-stack text-xl shrink-0"></i>
        <transition name="fade"><span v-if="!isCollapsed" class="whitespace-nowrap">Dimensional</span></transition>
      </router-link>
      <router-link to="/atrito" class="w-full flex items-center text-sm bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 hover:bg-teal-200 py-3 rounded-xl font-bold transition-colors"
        :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-2'" :title="isCollapsed ? 'Coef. Atrito' : ''">
        <i class="ph-bold ph-wave-sine text-xl shrink-0"></i>
        <transition name="fade"><span v-if="!isCollapsed" class="whitespace-nowrap">Coef. Atrito</span></transition>
      </router-link>
      <router-link to="/relatorio-turno" class="w-full flex items-center text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 py-3 rounded-xl font-bold transition-colors"
        :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-2'" :title="isCollapsed ? 'Rel. Turno' : ''">
        <i class="ph-bold ph-clipboard-text text-xl shrink-0"></i>
        <transition name="fade"><span v-if="!isCollapsed" class="whitespace-nowrap">Rel. Final Turno</span></transition>
      </router-link>
    </div>
  </aside>

  <!-- ── MOBILE: Bottom Navigation Bar ────────────────────────────── -->
  <div v-if="authStore.userProfile !== 'inspetor'"
    class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 safe-area-bottom">
    <nav class="flex items-center justify-around px-2 py-2">

      <!-- Dashboard -->
      <router-link to="/dashboard"
        class="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[56px]"
        active-class="text-blue-600 dark:text-blue-400"
        :class="$route.path === '/dashboard' ? '' : 'text-gray-400 dark:text-gray-500'">
        <i class="ph-fill ph-chart-pie-slice text-2xl"></i>
        <span class="text-[10px] font-bold">Dashboard</span>
      </router-link>

      <!-- Inspeções (abre drawer) — só admin/inspetor -->
      <button v-if="authStore.userProfile === 'admin' || authStore.userProfile === 'inspetor'"
        @click="drawerAberto = true"
        class="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[56px]"
        :class="isInspecaoRoute ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'">
        <i class="ph-fill ph-plus-circle text-2xl"></i>
        <span class="text-[10px] font-bold">Medir</span>
      </button>

      <!-- Admin — só admin -->
      <router-link v-if="authStore.userProfile === 'admin'" to="/admin"
        class="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[56px]"
        active-class="text-blue-600 dark:text-blue-400"
        :class="$route.path === '/admin' ? '' : 'text-gray-400 dark:text-gray-500'">
        <i class="ph-fill ph-gear text-2xl"></i>
        <span class="text-[10px] font-bold">Admin</span>
      </router-link>

      <!-- Tema -->
      <button @click="toggleTheme"
        class="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[56px] text-gray-400 dark:text-yellow-400">
        <i :class="isDark ? 'ph-fill ph-sun text-2xl' : 'ph-fill ph-moon text-2xl'"></i>
        <span class="text-[10px] font-bold">{{ isDark ? 'Claro' : 'Escuro' }}</span>
      </button>

    </nav>
  </div>

  <!-- ── MOBILE: Drawer de inspeções (bottom sheet) ─────────────── -->
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="drawerAberto" class="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="drawerAberto = false"></div>

        <!-- Sheet -->
        <div class="relative bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-6 pb-8 safe-area-bottom"
          @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">

          <!-- Handle -->
          <div class="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-6"></div>

          <h2 class="text-base font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
            <i class="ph-fill ph-plus-circle text-blue-500"></i> Iniciar Medição
          </h2>

          <div class="grid grid-cols-2 gap-3">
            <router-link to="/nova-inspecao" @click="drawerAberto = false"
              class="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 p-4 rounded-2xl font-bold transition-colors border border-blue-100 dark:border-blue-800/30">
              <i class="ph-bold ph-squares-four text-2xl shrink-0"></i>
              <span class="text-sm leading-tight">Medir Empeno</span>
            </router-link>

            <router-link to="/dimensional" @click="drawerAberto = false"
              class="flex items-center gap-3 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 hover:bg-violet-100 p-4 rounded-2xl font-bold transition-colors border border-violet-100 dark:border-violet-800/30">
              <i class="ph-bold ph-stack text-2xl shrink-0"></i>
              <span class="text-sm leading-tight">Dimensional</span>
            </router-link>

            <router-link to="/atrito" @click="drawerAberto = false"
              class="flex items-center gap-3 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 hover:bg-teal-100 p-4 rounded-2xl font-bold transition-colors border border-teal-100 dark:border-teal-800/30">
              <i class="ph-bold ph-wave-sine text-2xl shrink-0"></i>
              <span class="text-sm leading-tight">Coef. Atrito</span>
            </router-link>

            <router-link to="/relatorio-turno" @click="drawerAberto = false"
              class="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 p-4 rounded-2xl font-bold transition-colors border border-indigo-100 dark:border-indigo-800/30">
              <i class="ph-bold ph-clipboard-text text-2xl shrink-0"></i>
              <span class="text-sm leading-tight">Rel. Turno</span>
            </router-link>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore    = useAuthStore()
const route        = useRoute()
const isDark       = ref(false)
const isCollapsed  = ref(false)
const drawerAberto = ref(false)

const isInspecaoRoute = computed(() =>
  ['/nova-inspecao', '/dimensional', '/atrito', '/relatorio-turno'].includes(route.path)
)

const toggleSidebar = () => { isCollapsed.value = !isCollapsed.value }

// ── Swipe para fechar o drawer ─────────────────────────────────────
let touchStartY = 0
const onTouchStart = (e) => { touchStartY = e.touches[0].clientY }
const onTouchMove  = (e) => { if (e.touches[0].clientY - touchStartY > 60) drawerAberto.value = false }
const onTouchEnd   = () => { touchStartY = 0 }

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark'
  if (isDark.value) document.documentElement.classList.add('dark')
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Drawer desliza de baixo para cima */
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-active .relative, .drawer-leave-active .relative { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from .relative, .drawer-leave-to .relative { transform: translateY(100%); }

/* Safe area para dispositivos com notch/home bar */
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0); }
</style>
