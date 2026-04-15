<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
    <Sidebar />
    <main class="flex-1 overflow-y-auto w-full p-6 relative">
      
      <header v-if="passo === 2" class="flex justify-between items-start mb-8 animate-fade-in-up">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><i class="ph-bold ph-stack text-violet-600"></i> Análise Dimensional</h1>
          <div class="mt-3 flex items-center gap-3">
            <div class="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-violet-100 dark:border-violet-800/30"><i class="ph-fill ph-identification-card text-base"></i> Inspetor: {{ form.inspetor }}</div>
            <button @click="passo = 1" class="text-xs font-bold text-violet-600 hover:text-violet-800 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800"><i class="ph-bold ph-pencil-simple"></i> Editar Lote</button>
          </div>
        </div>
        <router-link to="/dashboard" class="flex items-center gap-2 text-gray-500 hover:text-red-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-800 shadow-sm"><i class="ph-bold ph-x"></i> Cancelar</router-link>
      </header>

      <div v-if="passo === 1" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/90 dark:bg-[#060a16]/90 backdrop-blur-sm p-4">
        <router-link to="/dashboard" class="absolute top-6 right-6 text-gray-500 hover:text-white bg-white dark:bg-slate-800 p-3 rounded-full shadow-lg"><i class="ph-bold ph-x text-xl"></i></router-link>
        
        <div class="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800/50 p-8 animate-scale-in">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300 mb-4 shadow-inner"><i class="ph-fill ph-stack text-3xl"></i></div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Dimensional</h2>
            <p class="text-[13px] text-gray-500">Espessura, Tamanho e Esquadro</p>
          </div>
          
          <form @submit.prevent="iniciarInspecao" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Linha</label>
                <select v-model="form.linha" class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-[15px] outline-none focus:ring-2 focus:ring-violet-500" required><option value="" disabled>Sel...</option><option v-for="ln in refStore.linhas" :key="ln" :value="ln">{{ ln }}</option></select>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Formato</label>
                <select v-model="form.formatoNome" @change="carregarLimites" class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-[15px] outline-none focus:ring-2 focus:ring-violet-500" required><option value="" disabled>Sel...</option><option v-for="f in refStore.formatos" :key="f.id" :value="f.nome">{{ f.nome }}</option></select>
              </div>
            </div>

            <div class="relative">
              <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Produto</label>
              <i class="ph-bold ph-magnifying-glass absolute left-3.5 top-[2.2rem] text-gray-400 text-lg"></i>
              <input type="text" autocapitalize="characters" v-model="form.produto" @focus="showProd = true" @blur="hideProd" class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 pl-10 text-[15px] outline-none focus:ring-2 focus:ring-violet-500 uppercase placeholder:normal-case placeholder:text-gray-400" required placeholder="Buscar Produto..." autocomplete="off">
              
              <div v-if="showProd && produtosFiltrados.length" class="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                <div v-for="p in produtosFiltrados" :key="p" @mousedown.prevent="selecionarProduto(p)" class="p-3 text-sm cursor-pointer hover:bg-violet-50 dark:hover:bg-slate-700 dark:text-white text-gray-700 font-bold uppercase border-b border-gray-100 dark:border-slate-700 last:border-0 transition-colors">
                  {{ p }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Lote</label>
                <input type="text" autocapitalize="characters" v-model="form.lote" class="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-lg p-3 text-[15px] uppercase font-bold outline-none focus:ring-2 focus:ring-violet-500 placeholder:font-normal placeholder:text-gray-400" required placeholder="EX: A123">
              </div>
              <div>
                <label class="block text-[11px] font-bold text-violet-500 uppercase mb-1.5">Espessura (mm)</label>
                <input type="number" inputmode="decimal" step="0.01" v-model="form.espessuraDeclarada" class="w-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 rounded-lg p-3 text-[15px] font-bold outline-none focus:ring-2 focus:ring-violet-500 placeholder:font-normal placeholder:text-violet-300" required placeholder="Ex: 10.00">
              </div>
            </div>
            <div class="pt-4"><button type="submit" class="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 text-lg"><i class="ph-bold ph-play"></i> Iniciar Medições</button></div>
          </form>
        </div>
      </div>

      <div v-if="passo === 2" class="animate-fade-in-up space-y-6">
        <div class="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <div class="flex gap-4">
            <button @click="abaAtiva = 'espessura'" :class="abaAtiva === 'espessura' ? 'bg-violet-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'" class="flex-1 py-3 rounded-lg font-bold flex justify-center items-center gap-2"><i class="ph-bold ph-stack"></i> Espessura</button>
            <button @click="abaAtiva = 'tamanho'" :class="abaAtiva === 'tamanho' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'" class="flex-1 py-3 rounded-lg font-bold flex justify-center items-center gap-2"><i class="ph-bold ph-ruler"></i> Tamanho e Esquadro</button>
          </div>
        </div>

        <form @submit.prevent="confirmarEnvio">
          <div v-if="abaAtiva === 'espessura'" class="space-y-6">
            <div class="bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900 p-4 rounded-xl flex gap-6 text-sm">
              <div><span class="text-[10px] text-gray-500 uppercase font-bold block">Declarada</span><span class="font-bold text-violet-700 dark:text-violet-400">{{ form.espessuraDeclarada }} mm</span></div>
              <div><span class="text-[10px] text-gray-500 uppercase font-bold block">Mínimo (-5%)</span><span class="font-bold text-red-500">{{ espessuraMin.toFixed(2) }}</span></div>
              <div><span class="text-[10px] text-gray-500 uppercase font-bold block">Máximo (+5%)</span><span class="font-bold text-red-500">{{ espessuraMax.toFixed(2) }}</span></div>
            </div>

            <div v-for="(peca, idx) in form.pecasEspessura" :key="idx" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div class="bg-gray-50 dark:bg-slate-800/50 p-3 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                <div class="flex items-center gap-4">
                  <span class="font-bold text-violet-600 dark:text-violet-400">Peça {{ idx + 1 }}</span>
                  <input v-model="peca.prensa" placeholder="Prensa Nº" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-2 py-1 rounded outline-none w-20">
                  <input v-model="peca.cavidade" placeholder="Cav. Nº" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-2 py-1 rounded outline-none w-20">
                </div>
                <div class="flex items-center gap-3">
                  <span v-if="media(peca) > 0" :class="validaEspessura(media(peca)) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="text-xs font-bold px-2 py-1 rounded-lg">Média: {{ media(peca).toFixed(2) }} mm</span>
                  <button type="button" @click="form.pecasEspessura.splice(idx, 1)" class="text-red-400 hover:text-red-600"><i class="ph-bold ph-trash"></i></button>
                </div>
              </div>
              <div class="p-4 flex flex-wrap gap-3">
                <div v-for="(pt, pIdx) in peca.pontos" :key="pIdx" class="relative">
                  <span class="absolute -top-2 left-2 bg-white dark:bg-slate-900 text-[10px] text-gray-400 font-bold px-1">P{{ pIdx + 1 }}</span>
                  <div class="flex items-center">
                    <input type="number" inputmode="decimal" step="0.01" v-model="peca.pontos[pIdx]" class="w-20 text-center bg-transparent border border-gray-200 dark:border-slate-700 rounded-lg p-2 font-bold outline-none focus:border-violet-500 text-gray-900 dark:text-white">
                    <button type="button" @click="peca.pontos.splice(pIdx, 1)" class="ml-1 text-gray-400 hover:text-red-500"><i class="ph-bold ph-minus-circle"></i></button>
                  </div>
                </div>
                <button type="button" @click="peca.pontos.push(null)" class="text-xs text-violet-500 font-bold flex items-center gap-1 hover:underline"><i class="ph-bold ph-plus-circle"></i> Ponto</button>
              </div>
            </div>
            <button type="button" @click="form.pecasEspessura.push({ prensa: '', cavidade: '', pontos: [null] })" class="w-full py-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-gray-500 hover:text-violet-600 font-bold"><i class="ph-bold ph-plus-circle"></i> Adicionar Peça (Espessura)</button>
          </div>

          <div v-if="abaAtiva === 'tamanho'" class="space-y-6">
            <div class="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900 p-4 rounded-xl flex gap-6 text-sm">
               <div><span class="text-[10px] text-gray-500 uppercase font-bold block">Tamanho (Min-Max)</span><span class="font-bold text-orange-700 dark:text-orange-400">{{ configAtiva?.tamanhoMin }} a {{ configAtiva?.tamanhoMax }} mm</span></div>
               <div><span class="text-[10px] text-gray-500 uppercase font-bold block">Esquadro (Min-Max)</span><span class="font-bold text-orange-700 dark:text-orange-400">{{ configAtiva?.esquadroMin }} a {{ configAtiva?.esquadroMax }} mm</span></div>
            </div>

            <div v-for="(med, idx) in form.medicoesTE" :key="idx" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
               <div class="bg-gray-50 dark:bg-slate-800/50 p-3 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                 <div class="flex items-center gap-4">
                   <span class="font-bold text-orange-600 dark:text-orange-400">Medição {{ idx + 1 }}</span>
                   <input v-model="med.retifica" placeholder="Retífica Nº" class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-xs px-2 py-1 rounded outline-none w-24">
                 </div>
                 <button type="button" @click="form.medicoesTE.splice(idx, 1)" class="text-red-400 hover:text-red-600"><i class="ph-bold ph-trash"></i></button>
               </div>
               <div class="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Tamanho</label>
                    <input type="number" inputmode="decimal" step="0.01" v-model="med.tamanho" class="w-full text-center bg-transparent border border-gray-200 dark:border-slate-700 rounded-lg p-2 font-bold outline-none focus:border-orange-500 text-gray-900 dark:text-white">
                  </div>
                  <div>
                    <label class="text-[10px] text-gray-400 font-bold uppercase mb-1 block">Esquadro</label>
                    <input type="number" inputmode="decimal" step="0.01" v-model="med.esquadro" class="w-full text-center bg-transparent border border-gray-200 dark:border-slate-700 rounded-lg p-2 font-bold outline-none focus:border-orange-500 text-gray-900 dark:text-white">
                  </div>
               </div>
            </div>
            <button type="button" @click="form.medicoesTE.push({ retifica: '', tamanho: null, esquadro: null })" class="w-full py-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl text-gray-500 hover:text-orange-600 font-bold"><i class="ph-bold ph-plus-circle"></i> Adicionar Medição</button>
          </div>

          <div class="mt-8 flex justify-end">
            <button type="submit" class="bg-violet-600 hover:bg-violet-700 text-white px-10 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 text-lg"><i class="ph-bold ph-floppy-disk"></i> Gravar Lote</button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useReferenciasStore } from '../stores/referencias'
import Swal from 'sweetalert2'
import Sidebar from '../components/Sidebar.vue'

const router = useRouter()
const authStore = useAuthStore()
const passo = ref(1)
const abaAtiva = ref('espessura')

const refStore = useReferenciasStore()
const configAtiva = ref(null)

// Lógica Autocomplete
const showProd = ref(false)
const produtosFiltrados = computed(() => {
  if (!form.value.produto) return refStore.produtos
  return refStore.produtos.filter(p => p.toLowerCase().includes(form.value.produto.toLowerCase()))
})
const selecionarProduto = (p) => { form.value.produto = p; showProd.value = false }
const hideProd = () => { setTimeout(() => { showProd.value = false }, 200) }

const form = ref({
  linha: '', produto: '', formatoNome: '', lote: '', espessuraDeclarada: null,
  inspetor: auth.currentUser?.email.split('@')[0].toUpperCase(),
  pecasEspessura: [{ prensa: '', cavidade: '', pontos: [null] }],
  medicoesTE: [{ retifica: '', tamanho: null, esquadro: null }]
})

onMounted(async () => { await refStore.carregar() })

const carregarLimites = () => { configAtiva.value = refStore.formatos.find(f => f.nome === form.value.formatoNome) }
const iniciarInspecao = () => { passo.value = 2 }

const espessuraMin = computed(() => form.value.espessuraDeclarada ? form.value.espessuraDeclarada * 0.95 : 0)
const espessuraMax = computed(() => form.value.espessuraDeclarada ? form.value.espessuraDeclarada * 1.05 : 0)
const media = (peca) => { const pts = peca.pontos.filter(v => v !== null && v !== ''); if (!pts.length) return 0; return pts.reduce((a, b) => a + Number(b), 0) / pts.length }
const validaEspessura = (val) => val >= espessuraMin.value && val <= espessuraMax.value
const validaTE = (val, min, max) => val === null || val === '' || (Number(val) >= min && Number(val) <= max)

const confirmarEnvio = async () => {
  let aprovado = true
  form.value.pecasEspessura.forEach(p => { const m = media(p); if(m > 0 && !validaEspessura(m)) aprovado = false })
  form.value.medicoesTE.forEach(m => {
    if(!validaTE(m.tamanho, configAtiva.value.tamanhoMin, configAtiva.value.tamanhoMax)) aprovado = false
    if(!validaTE(m.esquadro, configAtiva.value.esquadroMin, configAtiva.value.esquadroMax)) aprovado = false
  })
  const statusGeral = aprovado ? 'Aprovado' : 'Reprovado'
  const result = await Swal.fire({ title: `Lote ${statusGeral}!`, icon: aprovado ? 'success' : 'warning', showCancelButton: true, confirmButtonText: 'Gravar', confirmButtonColor: aprovado ? '#8b5cf6' : '#ef4444' })

  if (result.isConfirmed) {
    try {
      await addDoc(collection(db, "dimensionais"), {
        tipo: 'dimensional', ...form.value, dataHora: serverTimestamp(), resultado: statusGeral,
        limitesSnapshot: { tamanhoMin: configAtiva.value.tamanhoMin, tamanhoMax: configAtiva.value.tamanhoMax, esquadroMin: configAtiva.value.esquadroMin, esquadroMax: configAtiva.value.esquadroMax }
      })
      Swal.fire('Salvo!', 'Amostragem guardada com sucesso.', 'success')
      router.push(authStore.userProfile === 'inspetor' ? '/home' : '/dashboard')
    } catch (e) { Swal.fire('Erro', 'Falha ao guardar os dados.', 'error') }
  }
}
</script>

<style scoped>
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-scale-in { animation: scaleIn 0.25s ease-out forwards; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
</style>
