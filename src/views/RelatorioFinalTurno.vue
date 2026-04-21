<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
    <Sidebar />

    <main class="flex-1 overflow-y-auto w-full flex flex-col relative">

      <header class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
        <h1 class="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
          <i class="ph-fill ph-clipboard-text text-indigo-500"></i> Relatório Final de Turno
        </h1>
        <router-link to="/dashboard" class="flex items-center gap-2 text-gray-500 hover:text-red-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-bold transition-all">
          <i class="ph-bold ph-x"></i> Cancelar
        </router-link>
      </header>

      <div class="p-6 max-w-3xl mx-auto w-full space-y-5">

        <!-- Equipe (sem card de informações) -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-5">
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i class="ph-fill ph-users text-indigo-500"></i> Equipe
          </h2>
          <div class="flex gap-2">
            <button v-for="eq in ['1','2','3','4','ADM']" :key="eq" type="button"
              @click="equipe = eq"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
              :class="equipe === eq
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-indigo-300'"
            >{{ eq }}</button>
          </div>
        </div>

        <!-- Linhas de produção -->
        <div v-for="(linha, lIdx) in linhas" :key="linha._id"
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden"
        >
          <!-- Cabeçalho da linha -->
          <div class="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/20">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black shrink-0">{{ lIdx + 1 }}</span>
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Linha de Produção</p>
                <p class="font-bold text-gray-800 dark:text-white text-sm">
                  {{ linha.linha || '—' }}
                  <span v-if="linha.referencia" class="text-indigo-600 dark:text-indigo-400 font-normal ml-1">· {{ linha.referencia }}</span>
                  <span v-if="linha.formato" class="text-gray-400 font-normal ml-1 text-xs">({{ linha.formato }})</span>
                </p>
              </div>
            </div>
            <button v-if="linhas.length > 1" type="button" @click="removerLinha(lIdx)"
              class="text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg border border-gray-200 dark:border-slate-700 transition-all">
              <i class="ph-bold ph-trash"></i>
            </button>
          </div>

          <div class="p-5 space-y-4">

            <!-- Linha (select do banco) + Formato -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Linha</label>
                <select v-model="linha.linha"
                  class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="" disabled>Selecione...</option>
                  <option v-for="l in refStore.linhas" :key="l" :value="l">{{ l }}</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Formato</label>
                <select v-model="linha.formato"
                  class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Selecione...</option>
                  <option v-for="f in refStore.formatos" :key="f.id" :value="f.nome">{{ f.nome }}</option>
                </select>
              </div>
            </div>

            <!-- Referência (Produto) com autocomplete -->
            <div>
              <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Referência (Produto)</label>
              <div class="relative">
                <i class="ph-bold ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  v-model="linha.referencia"
                  type="text"
                  placeholder="Buscar produto..."
                  autocomplete="off"
                  @focus="linha._showProd = true"
                  @blur="() => setTimeout(() => { linha._showProd = false }, 200)"
                  class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-800 dark:text-white uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <!-- Dropdown autocomplete -->
                <div v-if="linha._showProd && produtosFiltradosPorLinha(linha.referencia).length"
                  class="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  <div
                    v-for="p in produtosFiltradosPorLinha(linha.referencia)" :key="p"
                    @mousedown.prevent="linha.referencia = p; linha._showProd = false"
                    class="px-4 py-2.5 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700 text-gray-700 dark:text-white font-bold uppercase border-b border-gray-50 dark:border-slate-700 last:border-0 transition-colors"
                  >{{ p }}</div>
                </div>
              </div>
            </div>

            <!-- Lotes -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="ph-fill ph-tag text-indigo-400"></i> Lotes ({{ linha.lotes.length }})
                </label>
                <button type="button" @click="adicionarLote(lIdx)"
                  class="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                  <i class="ph-bold ph-plus-circle"></i> Adicionar Lote
                </button>
              </div>

              <div class="space-y-3">
                <div v-for="(lote, lotIdx) in linha.lotes" :key="lote._id"
                  class="border-2 rounded-xl p-3 transition-all"
                  :class="borderSituacao(lote.situacao)"
                >
                  <div class="flex items-center gap-2 mb-3">
                    <span class="text-[10px] font-bold text-gray-400 uppercase">Lote {{ lotIdx + 1 }}</span>
                    <button v-if="linha.lotes.length > 1" type="button" @click="removerLote(lIdx, lotIdx)"
                      class="text-gray-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors ml-auto">
                      <i class="ph-bold ph-minus-circle"></i>
                    </button>
                  </div>

                  <div class="space-y-3">
                    <input v-model="lote.lote" type="text" placeholder="Número do lote (Ex: LF37)"
                      @input="lote.lote = lote.lote.toUpperCase()"
                      class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />

                    <!-- Situação por lote -->
                    <div class="grid grid-cols-2 gap-2">
                      <button v-for="s in situacoes" :key="s.valor" type="button"
                        @click="lote.situacao = s.valor"
                        class="flex items-center gap-2 px-2.5 py-2 rounded-lg border-2 text-xs font-bold transition-all min-h-[48px]"
                        :class="lote.situacao === s.valor ? s.classAtivo : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:border-gray-300'"
                      >
                        <span class="text-sm shrink-0">{{ s.emoji }}</span>
                        <span class="leading-tight text-left">{{ s.label }}</span>
                      </button>
                    </div>

                    <!-- Justificativa obrigatória para situações não-verdes -->
                    <div v-if="lote.situacao && lote.situacao !== 'verde'" class="animate-fade-in-up">
                      <label class="text-[11px] font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1"
                        :class="{
                          'text-yellow-600 dark:text-yellow-400': lote.situacao === 'amarela',
                          'text-orange-600 dark:text-orange-400': lote.situacao === 'laranja',
                          'text-red-600 dark:text-red-400':       lote.situacao === 'vermelha',
                        }">
                        <i class="ph-fill ph-warning"></i>
                        Justificativa
                        <span class="text-red-500">*</span>
                      </label>
                      <textarea v-model="lote.observacao" rows="2"
                        :placeholder="situacoes.find(s => s.valor === lote.situacao)?.placeholder || 'Descreva o motivo...'"
                        class="w-full bg-white dark:bg-slate-900 border-2 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none resize-none transition-all"
                        :class="{
                          'border-yellow-300 dark:border-yellow-700 focus:ring-2 focus:ring-yellow-400': lote.situacao === 'amarela',
                          'border-orange-300 dark:border-orange-700 focus:ring-2 focus:ring-orange-400': lote.situacao === 'laranja',
                          'border-red-300   dark:border-red-700   focus:ring-2 focus:ring-red-400':   lote.situacao === 'vermelha',
                        }"
                      />
                    </div>

                    <!-- Observação extra (opcional) — só verde -->
                    <input v-if="lote.situacao === 'verde' || !lote.situacao" v-model="lote.observacao" type="text"
                      :placeholder="`Obs. do lote ${lote.lote || lotIdx + 1} (opcional)`"
                      class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Botão adicionar linha -->
        <button type="button" @click="adicionarLinha"
          class="w-full py-4 border-2 border-dashed border-indigo-200 dark:border-indigo-800/40 rounded-2xl text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-400 font-bold transition-all flex items-center justify-center gap-2">
          <i class="ph-bold ph-plus-circle text-xl"></i> Adicionar Linha de Produção
        </button>

        <!-- Prévia -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <button @click="mostrarPrevia = !mostrarPrevia"
            class="w-full p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
            <span class="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <i class="ph-fill ph-eye text-indigo-500"></i> Pré-visualização do texto
            </span>
            <i class="ph-bold text-gray-400" :class="mostrarPrevia ? 'ph-caret-up' : 'ph-caret-down'"></i>
          </button>
          <div v-if="mostrarPrevia" class="px-5 pb-5">
            <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 leading-relaxed">{{ textoFormatado }}</pre>
          </div>
        </div>

        <!-- Botões finais -->
        <div class="flex flex-wrap gap-2 pb-28 md:pb-8 justify-end">
          <button @click="copiarTexto"
            class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold border-2 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 transition-all text-sm">
            <i class="ph-bold ph-copy"></i> Copiar
          </button>
          <button @click="salvarRelatorio" :disabled="salvando || !equipe"
            class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20">
            <i v-if="salvando" class="ph-bold ph-spinner animate-spin"></i>
            <i v-else class="ph-bold ph-floppy-disk"></i>
            {{ salvando ? 'A guardar...' : 'Guardar Relatório' }}
          </button>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useReferenciasStore } from '../stores/referencias'
import Swal from 'sweetalert2'
import Sidebar from '../components/Sidebar.vue'

const router   = useRouter()
const authStore = useAuthStore()
const salvando = ref(false)
const mostrarPrevia = ref(false)

// ── Dados do banco ────────────────────────────────────────────────────────────
const refStore = useReferenciasStore()

onMounted(async () => {
  await refStore.carregar()
  timer = setInterval(() => { agora.value = new Date() }, 60000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

// Autocomplete — filtra por linha
const produtosFiltradosPorLinha = (texto) => {
  if (!texto) return refStore.produtos
  return refStore.produtos.filter(p => p.toLowerCase().includes(texto.toLowerCase()))
}

// ── Situações ─────────────────────────────────────────────────────────────────
const situacoes = [
  { valor: 'verde',    emoji: '🟢', label: 'Liberado Normalmente',            classAtivo: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300', placeholder: '' },
  { valor: 'amarela',  emoji: '🟡', label: 'Ponto de Melhora',                classAtivo: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',   placeholder: 'Descreva o ponto de melhora identificado...' },
  { valor: 'laranja',  emoji: '🟠', label: 'Liberado com Documento',          classAtivo: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',   placeholder: 'Informe o documento e o motivo da liberação...' },
  { valor: 'vermelha', emoji: '🔴', label: 'Liberado com Restrição / Retido', classAtivo: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',                 placeholder: 'Descreva a restrição ou motivo da retenção...' },
]
const emojiSituacao = (valor) => situacoes.find(s => s.valor === valor)?.emoji ?? ''

const borderSituacao = (valor) => {
  const mapa = { verde: 'border-emerald-200 dark:border-emerald-800/40', amarela: 'border-yellow-200 dark:border-yellow-800/40', laranja: 'border-orange-200 dark:border-orange-800/40', vermelha: 'border-red-200 dark:border-red-800/40' }
  return mapa[valor] || 'border-gray-100 dark:border-slate-800'
}

// ── Responsável ───────────────────────────────────────────────────────────────
const nomeResponsavel = computed(() => {
  const email = auth.currentUser?.email || ''
  const base  = email.split('@')[0]
  const partes = base.split('.')
  if (partes.length >= 2)
    return partes[0].charAt(0).toUpperCase() + partes[0].slice(1) + ' ' +
           partes[partes.length-1].charAt(0).toUpperCase() + partes[partes.length-1].slice(1)
  return base.toUpperCase()
})

// ── Data/Hora ─────────────────────────────────────────────────────────────────
const agora = ref(new Date())
let timer = null
const dataHoraAtual = computed(() =>
  agora.value.toLocaleDateString('pt-BR') + ' · ' + agora.value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
)

// ── Equipe ────────────────────────────────────────────────────────────────────
const equipe = ref('')

// ── Linhas e Lotes ────────────────────────────────────────────────────────────
let _id = 0
const novoLote  = () => ({ _id: ++_id, lote: '', situacao: '', observacao: '' })
const novaLinha = () => ({ _id: ++_id, linha: '', referencia: '', formato: '', lotes: [novoLote()], _showProd: false })
const linhas    = ref([novaLinha()])

const adicionarLinha = ()             => linhas.value.push(novaLinha())
const removerLinha   = (lIdx)         => linhas.value.splice(lIdx, 1)
const adicionarLote  = (lIdx)         => linhas.value[lIdx].lotes.push(novoLote())
const removerLote    = (lIdx, lotIdx) => linhas.value[lIdx].lotes.splice(lotIdx, 1)

// ── Texto formatado ───────────────────────────────────────────────────────────
const textoFormatado = computed(() => {
  const data = agora.value.toLocaleDateString('pt-BR')
  let txt = `*Relatório Final*\n`
  txt += `*Responsável:* ${nomeResponsavel.value}\n`
  txt += `*Equipe:* ${equipe.value || '—'}\n`
  txt += `*Data:* ${data}\n`

  linhas.value.forEach(l => {
    txt += `\n____________________________________\n`
    txt += `*Linha:* ${l.linha || '—'}\n`
    txt += `*Referência:* ${l.referencia || '—'}\n`
    if (l.formato) txt += `*Formato:* ${l.formato}\n`
    txt += `*Situação:*\n`
    l.lotes.forEach(lt => {
      const emoji = emojiSituacao(lt.situacao)
      const obs   = lt.observacao ? ` - ${lt.observacao}` : ''
      txt += `${emoji} ${lt.lote || '(sem nº)'}${obs}\n`
    })
  })

  return txt.trimEnd()
})

// ── Copiar ────────────────────────────────────────────────────────────────────
const copiarTexto = async () => {
  try {
    await navigator.clipboard.writeText(textoFormatado.value)
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Copiado!', text: 'Pronto para colar no WhatsApp', showConfirmButton: false, timer: 2000 })
  } catch {
    Swal.fire('Erro', 'Não foi possível copiar. Use a pré-visualização manualmente.', 'error')
  }
}

// ── Enviar WhatsApp ───────────────────────────────────────────────────────────
const enviarWhatsApp = () => {
  const texto = encodeURIComponent(textoFormatado.value)
  // Abre o WhatsApp Web/app com o texto pré-preenchido (sem número definido — o utilizador escolhe o contato)
  window.open(`https://wa.me/?text=${texto}`, '_blank')
}

// ── Guardar ───────────────────────────────────────────────────────────────────
const salvarRelatorio = async () => {
  if (!equipe.value) {
    Swal.fire('Atenção', 'Selecione a equipe antes de guardar.', 'warning')
    return
  }

  // Validar justificativas obrigatórias
  for (const l of linhas.value) {
    for (const lt of l.lotes) {
      if (lt.situacao && lt.situacao !== 'verde' && !lt.observacao?.trim()) {
        Swal.fire('Atenção', `O lote "${lt.lote || 'sem nº'}" da linha "${l.linha || '—'}" precisa de uma justificativa.`, 'warning')
        return
      }
    }
  }

  const { isConfirmed } = await Swal.fire({
    title: 'Guardar relatório?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sim, guardar',
    cancelButtonText: 'Cancelar',
  })
  if (!isConfirmed) return

  salvando.value = true
  try {
    await addDoc(collection(db, 'relatorios_turno'), {
      responsavel:    nomeResponsavel.value,
      equipe:         equipe.value,
      data:           agora.value.toLocaleDateString('pt-BR'),
      linhas: linhas.value.map(l => ({
        linha:      l.linha,
        referencia: l.referencia,
        formato:    l.formato,
        lotes:      l.lotes.map(lt => ({
          lote:       lt.lote.toUpperCase(),
          situacao:   lt.situacao,
          observacao: lt.observacao,
        })),
      })),
      textoExportado: textoFormatado.value,
      criadoPor:      auth.currentUser?.email || '',
      dataHora:       serverTimestamp(),
    })

    if (navigator.vibrate) navigator.vibrate(150)

    // ── Pergunta WhatsApp ──────────────────────────────────────────────────────
    const { isConfirmed: enviaWA } = await Swal.fire({
      title: 'Guardado com sucesso! 🎉',
      html: 'Deseja enviar o relatório pelo <strong>WhatsApp</strong>?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: '<i class="ph-fill ph-whatsapp-logo"></i> Sim, enviar',
      cancelButtonText: 'Não, obrigado',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
    })

    if (enviaWA) {
      window.open(`https://wa.me/?text=${encodeURIComponent(textoFormatado.value)}`, '_blank')
    }

    router.push(authStore.userProfile === 'inspetor' ? '/home' : '/dashboard')
  } catch (e) {
    console.error(e)
    Swal.fire('Erro', 'Não foi possível guardar o relatório.', 'error')
  } finally {
    salvando.value = false
  }
}
</script>