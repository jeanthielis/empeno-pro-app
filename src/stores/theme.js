import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'qc-theme'

export const useThemeStore = defineStore('theme', () => {
  // Lê o estado actual do DOM (já aplicado pelo script inline do index.html)
  const isDark = ref(document.documentElement.classList.contains('dark'))

  // Aplica ao DOM sempre que o estado muda
  watch(isDark, (dark) => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  })

  const toggle = () => { isDark.value = !isDark.value }

  const setDark  = () => { isDark.value = true  }
  const setLight = () => { isDark.value = false }

  // Ouve mudanças na preferência do sistema —
  // só aplica se o utilizador NÃO tiver uma preferência salva manualmente
  const systemQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemQuery.addEventListener('change', (e) => {
    if (localStorage.getItem(STORAGE_KEY) === null) {
      isDark.value = e.matches
    }
  })

  return { isDark, toggle, setDark, setLight }
})
