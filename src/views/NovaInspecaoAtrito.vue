<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
    <Sidebar />

    <main class="flex-1 overflow-y-auto w-full p-6 relative">

      <header v-if="passo === 2" class="flex justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <i class="ph-bold ph-wave-sine text-teal-600"></i> Coeficiente de Atrito
          </h1>
          <div class="mt-3 flex items-center gap-3 flex-wrap">
            <div class="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-100 dark:border-teal-800/30">
              <i class="ph-fill ph-identification-card"></i> {{ form.inspetor }}
            </div>
            <span class="text-xs font-black px-3 py-1.5 rounded-lg border" :class="corClasse(form.classeAD)">
              <i class="ph-fill ph-wave-sine mr-1"></i>{{ form.classeAD }}
            </span>
            <div v-if="limiteClasse" class="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 font-bold">
              Range: {{ limiteClasse.min }} — {{ limiteClasse.max }}
            </div>
            <button @click="passo = 1" class="text-xs font-bold text-teal-600 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800">
              <i class="ph-bold ph-pencil-simple"></i> Editar
            </button>
          </div>
        </div>
        <router-link to="/dashboard" class="flex items-center gap-2 text-gray-500 hover:text-red-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm">
          <i class="ph-bold ph-x"></i> Cancelar
        </router-link>
      </header>

      <!-- ── PASSO 1 ─────────────────────────────────────────────────────── -->
      <div v-if="passo === 1" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/90 dark:bg-[#060a16]/90 backdrop-blur-sm p-4">
        <router-link to="/dashboard" class="absolute top-6 right-6 text-gray-500 hover:text-white bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg z-50">
          <i class="ph-bold ph-x text-xl"></i>
        </router-link>

        <div class="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800/50 p-8 animate-scale-in">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300 mb-4 shadow-inner">
              <i class="ph-fill ph-wave-sine text-3xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Coeficiente de Atrito</h2>
            <p class="text-[13px] text-gray-500 dark:text-gray-400 mt-1">Preencha os dados do lote</p>
          </div>

          <form @submit.prevent="iniciarInspecao" class="space-y-4">
            <div>
              <label class="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Linha</label>
              <select v-model="form.linha" required class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="" disabled>Selecione...</option>
                <option v-for="ln in linhasDisponiveis" :key="ln" :value="ln">{{ ln }}</option>
              </select>
            </div>

            <!-- Produto autocomplete -->
            <div class="relative">
              <label class="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Produto</label>
              <i class="ph-bold ph-magnifying-glass absolute left-3.5 top-[2.2rem] text-gray-400 text-lg"></i>
              <input type="text" v-model="form.produto" @focus="showProd = true" @blur="hideProd" required
                class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 pl-10 text-[15px] focus:ring-2 focus:ring-teal-500 outline-none uppercase placeholder:normal-case placeholder:text-gray-400"
                placeholder="Buscar Produto..." autocomplete="off">
              <div v-if="showProd && produtosFiltrados.length" class="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                <div v-for="p in produtosFiltrados" :key="p" @mousedown.prevent="selecionarProduto(p)"
                  class="p-3 text-sm cursor-pointer hover:bg-teal-50 dark:hover:bg-slate-700 dark:text-white text-gray-700 font-bold uppercase border-b border-gray-100 dark:border-slate-700 last:border-0">
                  {{ p }}
                </div>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Lote</label>
              <input type="text" v-model="form.lote" required
                class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-teal-500 outline-none uppercase font-bold placeholder:font-normal placeholder:text-gray-400"
                placeholder="EX: A123">
            </div>

            <!-- Classe AD -->
            <div>
              <label class="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Classe AD do Produto</label>
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="c in CLASSES_AD" :key="c" type="button"
                  @click="form.classeAD = c"
                  class="py-2.5 rounded-xl text-xs font-black border-2 transition-all min-h-[48px]"
                  :class="form.classeAD === c
                    ? corClasseAtivo(c)
                    : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:border-teal-300'"
                >{{ c }}</button>
              </div>
              <p v-if="!form.classeAD" class="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                <i class="ph-fill ph-warning"></i> Selecione uma classe para continuar
              </p>
              <div v-else-if="limiteClasse" class="mt-2 text-xs bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/30 px-3 py-2 rounded-lg text-teal-700 dark:text-teal-400 font-bold flex items-center gap-2">
                <i class="ph-fill ph-check-circle"></i>
                Range da {{ form.classeAD }}: {{ limiteClasse.min }} a {{ limiteClasse.max }}
              </div>
              <div v-else-if="form.classeAD && !carregandoLimites" class="mt-2 text-xs bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 px-3 py-2 rounded-lg text-yellow-700 dark:text-yellow-400 font-bold flex items-center gap-2">
                <i class="ph-fill ph-warning"></i> Classe sem range configurado. Configure no Admin.
              </div>
            </div>

            <div class="pt-4">
              <button type="submit" :disabled="!form.classeAD"
                class="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 text-lg disabled:opacity-40 disabled:cursor-not-allowed">
                <i class="ph-bold ph-play"></i> Iniciar Medição
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ── PASSO 2 ─────────────────────────────────────────────────────── -->
      <div v-if="passo === 2" class="max-w-2xl mx-auto animate-fade-in-up space-y-6">

        <!-- Medidas dinâmicas -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <h2 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 flex items-center justify-center text-xs">2</span>
              Medidas ({{ form.medidas.length }})
            </h2>
            <button type="button" @click="adicionarMedida"
              class="flex items-center gap-1.5 text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800/40 transition-all">
              <i class="ph-bold ph-plus-circle"></i> Adicionar
            </button>
          </div>

          <!-- Grid de medidas -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="(_, idx) in form.medidas" :key="idx"
              class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 p-4 transition-all"
              :class="statusMedida(idx) === 'aprovado'   ? 'border-emerald-300 dark:border-emerald-700'
                    : statusMedida(idx) === 'reprovado'  ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-200 dark:border-slate-700'"
            >
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold text-gray-500 dark:text-gray-400">Medida {{ idx + 1 }}</span>
                <div class="flex items-center gap-1">
                  <span v-if="statusMedida(idx) === 'aprovado'"  class="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">OK</span>
                  <span v-else-if="statusMedida(idx) === 'reprovado'" class="text-[10px] font-bold bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-full">Fora</span>
                  <!-- Botão remover -->
                  <button v-if="form.medidas.length > 1" type="button" @click="removerMedida(idx)"
                    class="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors ml-1">
                    <i class="ph-bold ph-minus-circle text-base"></i>
                  </button>
                </div>
              </div>
              <input
                type="number" inputmode="decimal" step="0.001"
                v-model.number="form.medidas[idx]"
                placeholder="0.000"
                class="w-full text-center text-xl font-bold bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white"
              />
            </div>

            <!-- Botão de adicionar inline -->
            <button type="button" @click="adicionarMedida"
              class="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-teal-500 hover:border-teal-400 transition-all">
              <i class="ph-bold ph-plus-circle text-2xl"></i>
              <span class="text-xs font-bold">Nova</span>
            </button>
          </div>
        </div>

        <!-- Resultado -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Média ({{ medidasValidas }} medida{{ medidasValidas !== 1 ? 's' : '' }})
              </p>
              <p class="text-5xl font-black"
                :class="statusMedia === 'aprovado'  ? 'text-emerald-600 dark:text-emerald-400'
                      : statusMedia === 'reprovado' ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-200 dark:text-slate-700'"
              >{{ mediaCalculada !== null ? mediaCalculada.toFixed(3) : '—' }}</p>
            </div>
            <div v-if="statusMedia !== 'pendente'" class="text-center">
              <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                :class="statusMedia === 'aprovado' ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-red-100 dark:bg-red-900/20'"
              >
                <i class="text-3xl" :class="statusMedia === 'aprovado' ? 'ph-fill ph-check-circle text-emerald-500' : 'ph-fill ph-x-circle text-red-500'"></i>
              </div>
              <p class="text-sm font-bold mt-1" :class="statusMedia === 'aprovado' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'">
                {{ statusMedia === 'aprovado' ? 'Aprovado' : 'Reprovado' }}
              </p>
            </div>
          </div>

          <!-- Barra de range -->
          <div v-if="limiteClasse && mediaCalculada !== null" class="mt-5">
            <div class="relative h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-visible">
              <div class="absolute h-full bg-emerald-200 dark:bg-emerald-900/40 rounded-full" :style="barraRangeStyle"></div>
              <div class="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-all"
                :class="statusMedia === 'aprovado' ? 'bg-emerald-500' : 'bg-red-500'"
                :style="barraIndicadorStyle"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-400 font-bold mt-1.5">
              <span>{{ limiteClasse.min }}</span>
              <span>{{ limiteClasse.max }}</span>
            </div>
          </div>
        </div>

        <!-- Observações + botão gravar -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5">
          <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Observações (opcional)</label>
          <textarea v-model="form.observacoes" rows="2" placeholder="Anotações opcionais..."
            class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          ></textarea>
        </div>

        <div class="flex justify-end pb-6">
          <button @click="confirmarEnvio" :disabled="mediaCalculada === null || salvando"
            class="flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            :class="statusMedia === 'reprovado' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20'"
          >
            <i v-if="salvando" class="ph-bold ph-spinner animate-spin"></i>
            <i v-else class="ph-bold ph-floppy-disk"></i>
            {{ salvando ? 'A guardar...' : 'Gravar Medição' }}
          </button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useReferenciasStore } from '../stores/referencias'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'
import Swal from 'sweetalert2'
import Sidebar from '../components/Sidebar.vue'

const router   = useRouter()
const passo    = ref(1)
const salvando = ref(false)
const carregandoLimites = ref(true)

const CLASSES_AD = ['AD', 'AD2', 'AD3', 'AD4', 'AD4+']

const produtosDisponiveis = ref([])
const linhasDisponiveis   = ref([])
const configClasses       = ref({}) // { AD: { min, max }, AD2: {...}, ... }

// ── Autocomplete ──────────────────────────────────────────────────────────────
const showProd = ref(false)
const produtosFiltrados = computed(() => {
  if (!form.value.produto) return refStore.produtos
  return refStore.produtos.filter(p => p.toLowerCase().includes(form.value.produto.toLowerCase()))
})
const selecionarProduto = (p) => { form.value.produto = p; showProd.value = false }
const hideProd = () => { setTimeout(() => { showProd.value = false }, 200) }

const extrairNome = (email = '') => {
  const base = email.split('@')[0]
  const partes = base.split('.')
  if (partes.length >= 2)
    return partes[0].charAt(0).toUpperCase() + partes[0].slice(1) + ' ' +
           partes[partes.length-1].charAt(0).toUpperCase() + partes[partes.length-1].slice(1)
  return base.toUpperCase()
}

const form = ref({
  produto: '', linha: '', lote: '', classeAD: '', observacoes: '',
  inspetor: extrairNome(auth.currentUser?.email),
  medidas: [null, null, null], // começa com 3, mas pode crescer
})

// ── Cores das classes ─────────────────────────────────────────────────────────
const corClasse = (nome) => {
  const mapa = {
    'AD':   'border-gray-300 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200',
    'AD2':  'border-blue-300 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'AD3':  'border-teal-300 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
    'AD4':  'border-orange-300 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    'AD4+': 'border-red-300 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  }
  return mapa[nome] || 'border-gray-300 bg-gray-100 text-gray-700'
}
const corClasseAtivo = (nome) => {
  const mapa = {
    'AD':   'border-gray-500 bg-gray-600 text-white',
    'AD2':  'border-blue-600 bg-blue-600 text-white',
    'AD3':  'border-teal-600 bg-teal-600 text-white',
    'AD4':  'border-orange-600 bg-orange-500 text-white',
    'AD4+': 'border-red-600 bg-red-600 text-white',
  }
  return mapa[nome] || 'border-teal-600 bg-teal-600 text-white'
}

// ── Limite da classe selecionada ──────────────────────────────────────────────
const limiteClasse = computed(() => {
  if (!form.value.classeAD) return null
  return configClasses.value[form.value.classeAD] ?? null
})

// ── Medidas dinâmicas ─────────────────────────────────────────────────────────
const adicionarMedida = () => form.value.medidas.push(null)
const removerMedida   = (idx) => { if (form.value.medidas.length > 1) form.value.medidas.splice(idx, 1) }

// ── Cálculo ───────────────────────────────────────────────────────────────────
const medidasValidas = computed(() =>
  form.value.medidas.filter(v => v !== null && v !== '' && !isNaN(Number(v))).length
)

const mediaCalculada = computed(() => {
  const vals = form.value.medidas.filter(v => v !== null && v !== '' && !isNaN(Number(v))).map(Number)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
})

const statusMedia = computed(() => {
  if (mediaCalculada.value === null || !limiteClasse.value) return 'pendente'
  return mediaCalculada.value >= limiteClasse.value.min && mediaCalculada.value <= limiteClasse.value.max
    ? 'aprovado' : 'reprovado'
})

const statusMedida = (idx) => {
  const v = form.value.medidas[idx]
  if (v === null || v === '' || isNaN(Number(v))) return 'pendente'
  if (!limiteClasse.value) return 'pendente'
  return Number(v) >= limiteClasse.value.min && Number(v) <= limiteClasse.value.max ? 'aprovado' : 'reprovado'
}

// ── Barra visual ──────────────────────────────────────────────────────────────
const barraRangeStyle = computed(() => {
  if (!limiteClasse.value) return {}
  const { min, max } = limiteClasse.value
  const total = max - min, margin = total * 0.3
  const vizMin = min - margin, vizTotal = (max + margin) - vizMin
  return { left: `${((min - vizMin) / vizTotal) * 100}%`, width: `${(total / vizTotal) * 100}%` }
})
const barraIndicadorStyle = computed(() => {
  if (!limiteClasse.value || mediaCalculada.value === null) return {}
  const { min, max } = limiteClasse.value
  const total = max - min, margin = total * 0.3
  const vizMin = min - margin, vizTotal = (max + margin) - vizMin
  const pos = Math.min(Math.max(((mediaCalculada.value - vizMin) / vizTotal) * 100, 0), 100)
  return { left: `${pos}%` }
})

// ── onMounted ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await refStore.carregar()
  configClasses.value = refStore.configAtrito?.classes || {}
  carregandoLimites.value = false
})

const iniciarInspecao = () => {
  if (!form.value.classeAD) return
  passo.value = 2
}

// ── Gravar ────────────────────────────────────────────────────────────────────
const confirmarEnvio = async () => {
  if (mediaCalculada.value === null) return
  const resultado = statusMedia.value === 'aprovado' ? 'Aprovado' : 'Reprovado'

  const { isConfirmed } = await Swal.fire({
    title: `Lote ${resultado}!`,
    html: `Classe: <strong>${form.value.classeAD}</strong> · Média: <strong>${mediaCalculada.value.toFixed(3)}</strong>`,
    icon: resultado === 'Aprovado' ? 'success' : 'warning',
    showCancelButton: true,
    confirmButtonText: 'Gravar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: resultado === 'Aprovado' ? '#0d9488' : '#ef4444',
  })
  if (!isConfirmed) return

  salvando.value = true
  try {
    await addDoc(collection(db, 'atrito'), {
      produto:     form.value.produto,
      lote:        form.value.lote,
      linha:       form.value.linha,
      inspetor:    form.value.inspetor,
      classeAD:    form.value.classeAD,
      observacoes: form.value.observacoes || '',
      medidas:     form.value.medidas.filter(v => v !== null && v !== '' && !isNaN(Number(v))).map(Number),
      media:       parseFloat(mediaCalculada.value.toFixed(4)),
      resultado,
      limitesSnapshot: limiteClasse.value
        ? { classeAD: form.value.classeAD, min: limiteClasse.value.min, max: limiteClasse.value.max }
        : null,
      dataHora: serverTimestamp(),
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR').slice(0, 5),
    })
  if (navigator.vibrate) navigator.vibrate(150)
    await Swal.fire({ title: 'Salvo!', text: 'Medição gravada com sucesso.', icon: 'success', timer: 2000, timerProgressBar: true, confirmButtonColor: '#0d9488' })
    router.push(authStore.userProfile === 'inspetor' ? '/home' : '/dashboard')
  } catch (e) {
    console.error(e)
    Swal.fire('Erro', 'Falha ao guardar a medição.', 'error')
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-scale-in { animation: scaleIn 0.25s ease-out forwards; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
</style>
