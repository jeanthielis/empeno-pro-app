<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
    <Sidebar />

    <main class="flex-1 overflow-y-auto w-full flex flex-col">

      <header class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
              <i class="ph-fill ph-clipboard-text text-blue-500"></i> Olá, {{ nomeInspetor }}
            </h1>
            <p class="text-xs text-gray-400 mt-0.5">{{ dataHoraAtual }} · Selecione o tipo de análise</p>
          </div>
          <button @click="sairDoSistema" class="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/20 p-2.5 rounded-xl transition-all" title="Terminar Sessão">
            <i class="ph-bold ph-sign-out text-xl"></i>
          </button>
        </div>
      </header>

      <div class="flex-1 flex items-center justify-center p-6">
        <div class="w-full max-w-2xl space-y-6">

          <!-- Título -->
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">O que deseja fazer?</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Escolha o tipo de análise ou relatório</p>
          </div>

          <!-- Grid de opções -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Medir Empeno -->
            <router-link to="/nova-inspecao"
              class="group bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/40 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-6 flex flex-col items-center gap-4 text-center transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5"
            >
              <div class="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <i class="ph-bold ph-squares-four text-3xl text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors"></i>
              </div>
              <div>
                <p class="font-bold text-gray-800 dark:text-white text-lg">Medir Empeno</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Lançamento de medidas laterais e centrais</p>
              </div>
              <span class="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Iniciar <i class="ph-bold ph-arrow-right"></i>
              </span>
            </router-link>

            <!-- Dimensional -->
            <router-link to="/dimensional"
              class="group bg-white dark:bg-slate-900 border-2 border-violet-100 dark:border-violet-900/40 hover:border-violet-400 dark:hover:border-violet-600 rounded-2xl p-6 flex flex-col items-center gap-4 text-center transition-all hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5"
            >
              <div class="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                <i class="ph-bold ph-stack text-3xl text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors"></i>
              </div>
              <div>
                <p class="font-bold text-gray-800 dark:text-white text-lg">Dimensional</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Espessura, tamanho e esquadro</p>
              </div>
              <span class="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Iniciar <i class="ph-bold ph-arrow-right"></i>
              </span>
            </router-link>

            <!-- Coeficiente de Atrito -->
            <router-link to="/atrito"
              class="group bg-white dark:bg-slate-900 border-2 border-teal-100 dark:border-teal-900/40 hover:border-teal-400 dark:hover:border-teal-600 rounded-2xl p-6 flex flex-col items-center gap-4 text-center transition-all hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-0.5"
            >
              <div class="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                <i class="ph-bold ph-wave-sine text-3xl text-teal-600 dark:text-teal-400 group-hover:text-white transition-colors"></i>
              </div>
              <div>
                <p class="font-bold text-gray-800 dark:text-white text-lg">Coef. de Atrito</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Medição por classe AD</p>
              </div>
              <span class="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Iniciar <i class="ph-bold ph-arrow-right"></i>
              </span>
            </router-link>

            <!-- Relatório Final de Turno -->
            <router-link to="/relatorio-turno"
              class="group bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-6 flex flex-col items-center gap-4 text-center transition-all hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5"
            >
              <div class="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                <i class="ph-bold ph-clipboard-text text-3xl text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors"></i>
              </div>
              <div>
                <p class="font-bold text-gray-800 dark:text-white text-lg">Rel. Final de Turno</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Relatório com situação dos lotes</p>
              </div>
              <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Iniciar <i class="ph-bold ph-arrow-right"></i>
              </span>
            </router-link>

          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuthStore } from '../stores/auth'
import Sidebar from '../components/Sidebar.vue'

const router    = useRouter()
const authStore = useAuthStore()

const nomeInspetor = computed(() => {
  const email = auth.currentUser?.email || ''
  const base  = email.split('@')[0]
  const partes = base.split('.')
  if (partes.length >= 2)
    return partes[0].charAt(0).toUpperCase() + partes[0].slice(1) + ' ' +
           partes[partes.length - 1].charAt(0).toUpperCase() + partes[partes.length - 1].slice(1)
  return base.toUpperCase()
})

const agora = ref(new Date())
const dataHoraAtual = computed(() =>
  agora.value.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) +
  ' · ' + agora.value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
)
let timer = null
onMounted(() => { timer = setInterval(() => { agora.value = new Date() }, 60000) })
onUnmounted(() => clearInterval(timer))

const sairDoSistema = async () => {
  await signOut(auth)
  authStore.limparSessao()
  router.push('/')
}
</script>
