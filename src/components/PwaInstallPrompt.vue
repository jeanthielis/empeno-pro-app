<template>
  <!-- Banner de instalação -->
  <Transition name="slide-up">
    <div v-if="mostrar"
      class="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/50 p-4 flex items-center gap-4"
    >
      <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
        <span class="text-white font-black text-xl">Q</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-gray-800 dark:text-white text-sm">Instalar QualityControl</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Adicione à tela inicial para acesso rápido</p>
      </div>
      <div class="flex flex-col gap-1.5 shrink-0">
        <button @click="instalar"
          class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
          Instalar
        </button>
        <button @click="dispensar"
          class="text-gray-400 hover:text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
          Agora não
        </button>
      </div>
    </div>
  </Transition>

  <!-- Banner iOS (instrução manual) -->
  <Transition name="slide-up">
    <div v-if="mostrarIOS"
      class="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/50 p-4"
    >
      <div class="flex justify-between items-start mb-3">
        <p class="font-bold text-gray-800 dark:text-white text-sm">Instalar no iPhone / iPad</p>
        <button @click="mostrarIOS = false" class="text-gray-400 hover:text-gray-600">
          <i class="ph-bold ph-x"></i>
        </button>
      </div>
      <ol class="text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
        <li class="flex items-center gap-2"><span class="text-blue-500 font-bold">1.</span> Toque em <strong>Compartilhar</strong> <i class="ph-fill ph-export text-blue-500"></i></li>
        <li class="flex items-center gap-2"><span class="text-blue-500 font-bold">2.</span> Selecione <strong>"Adicionar à Tela de Início"</strong></li>
        <li class="flex items-center gap-2"><span class="text-blue-500 font-bold">3.</span> Toque em <strong>Adicionar</strong></li>
      </ol>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const mostrar    = ref(false)
const mostrarIOS = ref(false)
let deferredPrompt = null

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

onMounted(() => {
  // Não mostra se já está instalado
  if (isStandalone()) return

  // iOS — instrução manual
  if (isIOS() && !localStorage.getItem('pwa-ios-dismissed')) {
    setTimeout(() => { mostrarIOS.value = true }, 3000)
    return
  }

  // Android / Desktop — evento nativo
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    if (!localStorage.getItem('pwa-dismissed')) {
      setTimeout(() => { mostrar.value = true }, 3000)
    }
  })
})

const instalar = async () => {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    mostrar.value = false
    localStorage.removeItem('pwa-dismissed')
  }
  deferredPrompt = null
}

const dispensar = () => {
  mostrar.value = false
  localStorage.setItem('pwa-dismissed', '1')
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.35s ease, opacity 0.35s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100px); opacity: 0; }
</style>
