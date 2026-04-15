<template>
  <aside v-if="authStore.userProfile !== 'inspetor'" :class="[isCollapsed ? 'w-20' : 'w-64']" class="relative z-30 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shrink-0">

    <button @click="toggleSidebar" class="absolute -right-3.5 top-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full p-1.5 shadow-md hover:bg-blue-700 transition-transform hover:scale-110 z-40 hidden md:flex items-center justify-center">
      <i :class="isCollapsed ? 'ph-bold ph-caret-right' : 'ph-bold ph-caret-left'"></i>
    </button>

    <div class="p-6 border-b border-gray-100 dark:border-slate-800 font-bold text-lg text-blue-600 dark:text-blue-400 flex items-center h-20 overflow-hidden" :class="isCollapsed ? 'justify-center' : 'justify-start gap-2'">
      <i class="ph ph-sliders text-3xl shrink-0"></i>
      <transition name="fade">
        <span v-if="!isCollapsed" class="whitespace-nowrap">QualityControl</span>
      </transition>
    </div>
    
    <nav class="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
      <!-- Início (hub do inspetor) — apenas inspetor -->
      <router-link v-if="authStore.userProfile === 'inspetor'" to="/home" class="flex items-center w-full py-3 rounded-lg font-bold transition-colors hover:bg-gray-50 dark:hover:bg-slate-800" active-class="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'" :title="isCollapsed ? 'Início' : ''">
        <i class="ph ph-house text-2xl shrink-0"></i>
        <transition name="fade">
          <span v-if="!isCollapsed" class="whitespace-nowrap">Início</span>
        </transition>
      </router-link>

      <!-- Dashboard: apenas admin e analista -->
      <router-link v-if="authStore.userProfile !== 'inspetor'" to="/dashboard" class="flex items-center w-full py-3 rounded-lg font-bold transition-colors hover:bg-gray-50 dark:hover:bg-slate-800" active-class="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'" :title="isCollapsed ? 'Dashboard' : ''">
        <i class="ph ph-chart-pie-slice text-2xl shrink-0"></i>
        <transition name="fade">
          <span v-if="!isCollapsed" class="whitespace-nowrap">Dashboard</span>
        </transition>
      </router-link>

      <!-- Administração: apenas admin -->
      <router-link v-if="authStore.userProfile === 'admin'" to="/admin" class="flex items-center w-full py-3 rounded-lg font-bold transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400" active-class="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-3'" :title="isCollapsed ? 'Administração' : ''">
        <i class="ph ph-gear text-2xl shrink-0"></i>
        <transition name="fade">
          <span v-if="!isCollapsed" class="whitespace-nowrap">Administração</span>
        </transition>
      </router-link>
    </nav>
    
    <div class="px-4 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-col items-center gap-2 overflow-hidden">
      <div v-if="!isCollapsed" class="flex justify-between items-center w-full mb-1">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Tema Visual</span>
      </div>
      <button @click="toggleTheme" class="p-2.5 w-full flex items-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm overflow-hidden" :class="isCollapsed ? 'justify-center' : 'justify-start gap-3'" :title="isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'">
        <i :class="isDark ? 'ph-fill ph-sun text-xl shrink-0' : 'ph-fill ph-moon text-xl text-blue-600 shrink-0'"></i>
        <transition name="fade">
          <span v-if="!isCollapsed" class="text-sm font-bold whitespace-nowrap">{{ isDark ? 'Modo Claro' : 'Modo Escuro' }}</span>
        </transition>
      </button>
    </div>

    <div v-if="authStore.userProfile === 'admin' || authStore.userProfile === 'inspetor'" class="p-4 border-t border-gray-100 dark:border-slate-800 space-y-3 overflow-hidden">
      
      <router-link to="/nova-inspecao" class="w-full flex items-center text-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 py-3 rounded-xl font-bold transition-colors" :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-2'" :title="isCollapsed ? 'Medir Empeno' : ''">
        <i class="ph-bold ph-squares-four text-xl shrink-0"></i>
        <transition name="fade">
          <span v-if="!isCollapsed" class="whitespace-nowrap">Medir Empeno</span>
        </transition>
      </router-link>

      <router-link to="/dimensional" class="w-full flex items-center text-sm bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 hover:bg-violet-200 py-3 rounded-xl font-bold transition-colors" :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-2'" :title="isCollapsed ? 'Medição Dimensional' : ''">
        <i class="ph-bold ph-stack text-xl shrink-0"></i>
        <transition name="fade">
          <span v-if="!isCollapsed" class="whitespace-nowrap">Dimensional</span>
        </transition>
      </router-link>

      <router-link to="/atrito" class="w-full flex items-center text-sm bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 hover:bg-teal-200 py-3 rounded-xl font-bold transition-colors" :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-2'" :title="isCollapsed ? 'Coeficiente de Atrito' : ''">
        <i class="ph-bold ph-wave-sine text-xl shrink-0"></i>
        <transition name="fade">
          <span v-if="!isCollapsed" class="whitespace-nowrap">Coef. Atrito</span>
        </transition>
      </router-link>

      <router-link to="/relatorio-turno" class="w-full flex items-center text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200 py-3 rounded-xl font-bold transition-colors" :class="isCollapsed ? 'justify-center px-0' : 'justify-start px-4 gap-2'" :title="isCollapsed ? 'Relatório Final de Turno' : ''">
        <i class="ph-bold ph-clipboard-text text-xl shrink-0"></i>
        <transition name="fade">
          <span v-if="!isCollapsed" class="whitespace-nowrap">Rel. Final Turno</span>
        </transition>
      </router-link>
      
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const isDark = ref(false)
const isCollapsed = ref(false) // Estado que controla se a barra está aberta ou fechada

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

onMounted(() => {
  // Mantém a preferência salva do usuário ao recarregar a página
  isDark.value = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark'
  if(isDark.value) {
    document.documentElement.classList.add('dark')
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if(isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>

<style scoped>
/* Animação suave para esconder e mostrar os textos quando a barra recolhe */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, width 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>