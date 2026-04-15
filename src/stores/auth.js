import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userProfile = ref(null) // Guardará se é 'admin', 'inspetor' ou 'analista'

  function setUsuario(userData, profile) {
    user.value = userData
    userProfile.value = profile
  }

  function limparSessao() {
    user.value = null
    userProfile.value = null
  }

  return { user, userProfile, setUsuario, limparSessao }
})