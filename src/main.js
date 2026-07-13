import './index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from "vue3-apexcharts"
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

// ── Atualização automática do PWA ────────────────────────────────────────────
// Verifica se há nova versão a cada 30 min (útil em tablets que ficam sempre abertos)
// e recarrega automaticamente quando um novo build é publicado.
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return
    setInterval(() => registration.update(), 30 * 60 * 1000)
  },
  onNeedRefresh() {
    updateSW(true) // aplica a nova versão e recarrega
  },
})

// Loga a versão no console — ajuda a diagnosticar qual build está rodando
console.info(`%cQualityControl v${__APP_VERSION__} — build ${__BUILD_DATE__}`, 'color:#0d9488;font-weight:bold')

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueApexCharts)
app.mount('#app')
