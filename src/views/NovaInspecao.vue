<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
    <Sidebar />

    <main class="flex-1 overflow-y-auto w-full p-6 relative">
      <header v-if="passo === 2" class="flex justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><i class="ph-bold ph-ruler text-blue-600"></i> Controle de Empeno</h1>
          <div class="mt-3 flex items-center gap-3">
            <div class="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-800/30"><i class="ph-fill ph-identification-card text-base"></i> Inspetor: {{ form.inspetor }}</div>
            <button @click="passo = 1" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800"><i class="ph-bold ph-pencil-simple"></i> Editar Lote</button>
          </div>
        </div>
        <router-link to="/dashboard" class="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm"><i class="ph-bold ph-x"></i> Cancelar</router-link>
      </header>

      <div class="max-w-5xl mx-auto space-y-6">
        
        <!-- PASSO 1: Dados do lote -->
        <div v-if="passo === 1" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/90 dark:bg-[#060a16]/90 backdrop-blur-sm p-4">
          <router-link to="/dashboard" class="absolute top-6 right-6 text-gray-500 hover:text-white bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg transition-colors z-50"><i class="ph-bold ph-x text-xl"></i></router-link>

          <div class="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800/50 p-8 animate-scale-in">
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 dark:bg-[#1e3a8a] dark:text-blue-300 mb-4 shadow-inner"><i class="ph-fill ph-clipboard-text text-3xl"></i></div>
              <h2 class="text-2xl font-bold text-gray-800 dark:text-white tracking-wide">Empeno</h2>
              <p class="text-[13px] text-gray-500 dark:text-gray-400 mt-1">Preencha os dados do lote para começar</p>
            </div>

            <form @submit.prevent="iniciarInspecao" class="space-y-4">
              <div>
                <label class="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Linha</label>
                <select v-model="form.linha" class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-blue-500 outline-none" required><option value="" disabled>Selecione...</option><option v-for="ln in refStore.linhas" :key="ln" :value="ln">{{ ln }}</option></select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Formato</label>
                <select v-model="form.formatoNome" @change="carregarLimites" class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-blue-500 outline-none" required><option value="" disabled>Selecione...</option><option v-for="f in refStore.formatos" :key="f.id" :value="f.nome">{{ f.nome }}</option></select>
              </div>

              <div class="relative">
                <label class="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Produto</label>
                <i class="ph-bold ph-magnifying-glass absolute left-3.5 top-[2.2rem] text-gray-400 text-lg"></i>
                <input type="text" autocapitalize="characters" v-model="form.produto" @focus="showProd = true" @blur="hideProd" class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 pl-10 text-[15px] focus:ring-2 focus:ring-blue-500 outline-none uppercase placeholder:normal-case placeholder:text-gray-400" required placeholder="Buscar Produto..." autocomplete="off">
                
                <div v-if="showProd && produtosFiltrados.length" class="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  <div v-for="p in produtosFiltrados" :key="p" @mousedown.prevent="selecionarProduto(p)" class="p-3 text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 dark:text-white text-gray-700 font-bold uppercase border-b border-gray-100 dark:border-slate-700 last:border-0 transition-colors">
                    {{ p }}
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Lote</label>
                <input type="text" autocapitalize="characters" v-model="form.lote" class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold placeholder:font-normal placeholder:text-gray-400" required placeholder="EX: A123">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Pós Folga?</label>
                <select v-model="form.posFolga" class="w-full bg-blue-50 dark:bg-[#1e3a8a] text-blue-800 dark:text-blue-50 border border-blue-200 dark:border-[#1e40af] rounded-lg p-3 text-[15px] focus:ring-2 focus:ring-blue-500 outline-none font-bold" required><option value="Não">Selecione...</option><option value="Sim">Sim</option><option value="Não">Não</option></select>
              </div>

              <div class="pt-4"><button type="submit" class="w-full py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-lg"><i class="ph-bold ph-play"></i> Iniciar Análise</button></div>
            </form>
          </div>
        </div>

        <!-- PASSO 2: Lançamento de medidas -->
        <div v-if="passo === 2" class="animate-fade-in-up space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <div class="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
              <h2 class="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center text-xs">2</span>
                Lançamento de Medidas de Empeno (mm)
              </h2>
              <!-- ✅ CORRIGIDO: usa latMin/latMax/centMin/centMax -->
              <div v-if="configAtiva" class="text-[10px] bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-500 p-2 rounded border border-yellow-200 dark:border-yellow-800/30 flex gap-4 font-medium">
                <span><strong class="uppercase">Ref:</strong> {{ form.formatoNome }}</span>
                <span><strong>Lat:</strong> {{ configAtiva.latMin }} a {{ configAtiva.latMax }}</span>
                <span><strong>Cen:</strong> {{ configAtiva.centMin }} a {{ configAtiva.centMax }}</span>
              </div>
            </div>
          </div>

          <form @submit.prevent="confirmarEnvio" class="space-y-6">
            <div v-for="(peca, index) in form.pecas" :key="peca.id" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 relative">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2"><i class="ph-fill ph-check-square-offset text-blue-500"></i> Peça {{ index + 1 }}</h3>
                <button type="button" @click="removerPeca(index)" v-if="form.pecas.length > 1" class="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg"><i class="ph-bold ph-trash"></i> Remover</button>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Empeno Lateral: ✅ usa latMin/latMax -->
                <div>
                  <h4 class="text-xs font-bold text-blue-500 uppercase mb-3"><i class="ph-bold ph-frame-corners"></i> Empeno Lateral</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div v-for="lado in ['A', 'B', 'C', 'D']" :key="'lat'+lado" class="p-3 bg-gray-50 dark:bg-slate-950/50 rounded-lg border border-gray-200 dark:border-slate-800">
                      <div class="flex justify-between items-center mb-1">
                        <label class="text-[10px] font-bold text-gray-500 uppercase">Lado {{ lado }}</label>
                        <StatusBadge :status="validar(peca[`lat${lado}`], configAtiva.latMin, configAtiva.latMax)" />
                      </div>
                      <input type="number" inputmode="decimal" step="0.01" v-model.number="peca[`lat${lado}`]" class="w-full input-clean text-center font-bold bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700" placeholder="0.00" required>
                    </div>
                  </div>
                </div>
                <!-- Empeno Central: ✅ usa centMin/centMax -->
                <div>
                  <h4 class="text-xs font-bold text-indigo-500 uppercase mb-3"><i class="ph-bold ph-crosshair"></i> Empeno Central</h4>
                  <div class="grid grid-cols-1 gap-3">
                    <div v-for="lado in ['A', 'B']" :key="'cen'+lado" class="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-200 dark:border-indigo-800/30">
                      <div class="flex justify-between items-center mb-2">
                        <label class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Lado {{ lado }} (Centro)</label>
                        <StatusBadge :status="validar(peca[`cen${lado}`], configAtiva.centMin, configAtiva.centMax)" />
                      </div>
                      <input type="number" inputmode="decimal" step="0.01" v-model.number="peca[`cen${lado}`]" class="w-full input-clean border-indigo-300 dark:bg-slate-900 text-center text-lg font-bold text-indigo-700 dark:text-indigo-300" placeholder="0.00" required>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-6 items-start">
              <div class="w-full md:w-1/3"><button type="button" @click="adicionarPeca" class="w-full border-2 border-dashed border-gray-300 dark:border-slate-700 text-gray-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800 py-6 rounded-xl font-bold transition-all flex flex-col items-center gap-2"><i class="ph-bold ph-plus-circle text-2xl"></i> Adicionar Nova Peça</button></div>
              <div class="w-full md:w-2/3"><h3 class="text-xs font-bold text-gray-500 uppercase mb-2"><i class="ph-bold ph-chat-text"></i> Observações do Lote</h3><textarea v-model="form.observacoes" rows="3" class="w-full input-clean resize-none bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700" placeholder="Anotações opcionais..."></textarea></div>
            </div>
            <div class="flex justify-end pt-2"><button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 text-lg"><i class="ph-bold ph-floppy-disk"></i> Gravar Amostragem</button></div>
          </form>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useReferenciasStore } from '../stores/referencias'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'
import Swal from 'sweetalert2'
import Sidebar from '../components/Sidebar.vue'
import StatusBadge from '../components/StatusBadge.vue'

const router = useRouter()
const authStore = useAuthStore()
const passo = ref(1)

const refStore  = useReferenciasStore()
const configAtiva = ref(null)

// ─── Autocomplete de produto ──────────────────────────────────────────────────
const showProd = ref(false)
const produtosFiltrados = computed(() => {
  if (!form.value.produto) return refStore.produtos
  return refStore.produtos.filter(p => p.toLowerCase().includes(form.value.produto.toLowerCase()))
})
const selecionarProduto = (p) => { form.value.produto = p; showProd.value = false }
const hideProd = () => { setTimeout(() => { showProd.value = false }, 200) }

const extrairNomeInspetor = (emailStr) => {
  if (!emailStr) return ''
  const base = emailStr.split('@')[0]
  const partes = base.split('.')
  if (partes.length >= 2) {
    const primeiro = partes[0].charAt(0).toUpperCase() + partes[0].slice(1)
    const ultimo = partes[partes.length - 1].charAt(0).toUpperCase() + partes[partes.length - 1].slice(1)
    return `${primeiro} ${ultimo}`
  }
  return base.toUpperCase()
}

const form = ref({
  produto: '', linha: '', inspetor: extrairNomeInspetor(auth.currentUser?.email),
  lote: '', formatoNome: '', posFolga: 'Não', observacoes: '',
  pecas: [{ id: Date.now(), latA: null, latB: null, latC: null, latD: null, cenA: null, cenB: null }]
})

onMounted(async () => { await refStore.carregar() })

const carregarLimites = () => {
  configAtiva.value = refStore.formatos.find(f => f.nome === form.value.formatoNome) || null
}

const iniciarInspecao = () => {
  if (configAtiva.value) passo.value = 2
  else Swal.fire('Atenção', 'Selecione um formato válido.', 'warning')
}

const adicionarPeca = () => {
  form.value.pecas.push({ id: Date.now(), latA: null, latB: null, latC: null, latD: null, cenA: null, cenB: null })
}
const removerPeca = (index) => { form.value.pecas.splice(index, 1) }

// ✅ CORRIGIDO: converte para Number antes de comparar para evitar bug de tipo string
const validar = (valor, min, max) => {
  if (valor === null || valor === '' || valor === undefined) return 'pendente'
  const v = Number(valor)
  if (isNaN(v) || min === undefined || max === undefined) return 'pendente'
  return (v >= Number(min) && v <= Number(max)) ? 'aprovado' : 'reprovado'
}

const confirmarEnvio = async () => {
  const cfg = configAtiva.value

  // Determina resultado geral
  let aprovado = true
  form.value.pecas.forEach(peca => {
    const statuses = [
      validar(peca.latA, cfg.latMin, cfg.latMax),
      validar(peca.latB, cfg.latMin, cfg.latMax),
      validar(peca.latC, cfg.latMin, cfg.latMax),
      validar(peca.latD, cfg.latMin, cfg.latMax),
      validar(peca.cenA, cfg.centMin, cfg.centMax),
      validar(peca.cenB, cfg.centMin, cfg.centMax),
    ]
    if (statuses.includes('reprovado')) aprovado = false
  })

  const statusGeral = aprovado ? 'Aprovado' : 'Reprovado'

  const result = await Swal.fire({
    title: `Lote ${statusGeral}!`,
    text: 'Deseja gravar a amostragem?',
    icon: aprovado ? 'success' : 'warning',
    showCancelButton: true,
    confirmButtonText: 'Gravar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: aprovado ? '#10b981' : '#ef4444'
  })

  if (!result.isConfirmed) return

  try {
    // ✅ CORRIGIDO: transforma pecas para o formato correto do banco
    const pecasFormatadas = form.value.pecas.map(p => ({
      laterais: {
        A: Number(p.latA),
        B: Number(p.latB),
        C: Number(p.latC),
        D: Number(p.latD),
      },
      centrais: {
        '1': Number(p.cenA),
        '2': Number(p.cenB),
      }
    }))

    // ✅ CORRIGIDO: limitesSnapshot com os nomes corretos do banco
    const limitesSnapshot = {
      latMin:       cfg.latMin,
      latMax:       cfg.latMax,
      centMin:      cfg.centMin,
      centMax:      cfg.centMax,
      tamanhoMin:   cfg.tamanhoMin   ?? null,
      tamanhoMax:   cfg.tamanhoMax   ?? null,
      esquadroMin:  cfg.esquadroMin  ?? null,
      esquadroMax:  cfg.esquadroMax  ?? null,
    }

    // ✅ CORRIGIDO: formatoId correto e dataHora (não dataHoa)
    const formatoDoc = refStore.formatos.find(f => f.nome === form.value.formatoNome)

    await addDoc(collection(db, 'inspecoes'), {
      // Dados do lote
      produto:      form.value.produto,
      lote:         form.value.lote,
      linha:        form.value.linha,
      inspetor:     form.value.inspetor,
      formatoNome:  form.value.formatoNome,
      formatoId:    formatoDoc?.id ?? null,
      posFolga:     form.value.posFolga,
      observacoes:  form.value.observacoes || '',

      // Medições
      pecas:        pecasFormatadas,
      limitesSnapshot,
      temDadosEmpeno:           true,
      pecasEspessura:           [],
      medicoesTamanhoEsquadro:  [],
      espessuraDeclarada:       null,

      // Resultado
      resultado:    statusGeral,
      status:       'finalizado',

      // ✅ CORRIGIDO: era "dataHoa" (typo), agora "dataHora"
      dataHora:     serverTimestamp(),
      data:         new Date().toLocaleDateString('pt-BR'),
      hora:         new Date().toLocaleTimeString('pt-BR').slice(0, 5),
    })

  if (navigator.vibrate) navigator.vibrate(150)
    await Swal.fire({ title: 'Salvo!', text: 'Amostragem gravada com sucesso.', icon: 'success', timer: 2000, timerProgressBar: true, confirmButtonColor: '#3B82F6' })
    router.push(authStore.userProfile === 'inspetor' ? '/home' : '/dashboard')
  } catch (e) {
    console.error('Erro ao guardar inspeção:', e)
    Swal.fire('Erro', 'Falha ao guardar a inspeção. Verifique a consola.', 'error')
  }
}
</script>

<style scoped>
.input-clean { border-radius: 0.5rem; transition: all 0.2s; outline: none; }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-scale-in { animation: scaleIn 0.25s ease-out forwards; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
</style>
