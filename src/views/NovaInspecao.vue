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
            <div class="flex justify-end gap-2 pt-2 pb-24 md:pb-4">
              <button type="button" @click="enviarWhatsApp"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 transition-all text-sm">
                <i class="ph-fill ph-whatsapp-logo text-base"></i> WhatsApp
              </button>
              <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 text-sm">
                <i class="ph-bold ph-floppy-disk"></i> Gravar Amostragem
              </button>
            </div>
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
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

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

// ── Texto para WhatsApp ───────────────────────────────────────────────────────
const enviarWhatsApp = () => {
  const cfg = configAtiva.value
  if (!cfg) { Swal.fire('Atenção', 'Selecione um formato válido.', 'warning'); return }

  const agora  = new Date()
  const data   = agora.toLocaleDateString('pt-BR')
  const hora   = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const fmtNum = (v) => v !== null && v !== '' && !isNaN(Number(v))
    ? Number(v).toFixed(2).replace('.', ',')
    : '--'
  const emoji  = (v, min, max) => validar(v, min, max) === 'aprovado' ? '🟢' : validar(v, min, max) === 'reprovado' ? '🔴' : '⚪'

  let txt = `*RELATÓRIO DE EMPENO*\n`
  txt += `*Data:* ${data} às ${hora}\n`
  txt += `*Responsável:* ${form.value.inspetor}\n`
  txt += `*Linha:* ${form.value.linha}\n`
  txt += `*Produto:* ${form.value.produto}\n`
  txt += `*Formato:* ${form.value.formatoNome}\n`
  txt += `*Lote:* ${form.value.lote}\n`
  txt += `\n`
  txt += `Range Lateral:(${fmtNum(cfg.latMin)} a ${fmtNum(cfg.latMax)})\n`
  txt += `Range Central:(${fmtNum(cfg.centMin)} a ${fmtNum(cfg.centMax)})\n`

  form.value.pecas.forEach((p, idx) => {
    txt += `\n*Peça ${idx + 1}*\n`
    txt += `${emoji(p.latA, cfg.latMin, cfg.latMax)} Lado A: ${fmtNum(p.latA)}\n`
    txt += `${emoji(p.latB, cfg.latMin, cfg.latMax)} Lado B: ${fmtNum(p.latB)}\n`
    txt += `${emoji(p.latC, cfg.latMin, cfg.latMax)} Lado C: ${fmtNum(p.latC)}\n`
    txt += `${emoji(p.latD, cfg.latMin, cfg.latMax)} Lado D: ${fmtNum(p.latD)}\n`
    txt += `*Central*\n`
    txt += `${emoji(p.cenA, cfg.centMin, cfg.centMax)} Lado A: ${fmtNum(p.cenA)}\n`
    txt += `${emoji(p.cenB, cfg.centMin, cfg.centMax)} Lado B: ${fmtNum(p.cenB)}\n`
  })

  window.open(`https://wa.me/?text=${encodeURIComponent(txt.trimEnd())}`, '_blank')
}

// ✅ CORRIGIDO: converte para Number antes de comparar para evitar bug de tipo string
const validar = (valor, min, max) => {
  if (valor === null || valor === '' || valor === undefined) return 'pendente'
  const v = Number(valor)
  if (isNaN(v) || min === undefined || max === undefined) return 'pendente'
  return (v >= Number(min) && v <= Number(max)) ? 'aprovado' : 'reprovado'
}

// ── Gerador de PDF da inspeção ────────────────────────────────────────────────
const gerarPDFInspecao = (statusGeral, agora) => {
  const cfg    = configAtiva.value
  const fmtNum = (v) => (v !== null && v !== '' && !isNaN(Number(v))) ? Number(v).toFixed(2) : '--'
  const foraLat  = (v) => validar(v, cfg.latMin, cfg.latMax)  === 'reprovado'
  const foraCent = (v) => validar(v, cfg.centMin, cfg.centMax) === 'reprovado'
  const CZ = [51, 65, 85]; const CB = [255,255,255]; const CV = [5,150,105]; const CR = [220,38,38]
  const CRL = [254,226,226]; const CVL = [209,250,229]
  const data = agora.toLocaleDateString('pt-BR')
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()

  // ── Cabeçalho ──
  doc.setFillColor(15, 23, 42); doc.rect(0, 0, W, 32, 'F')
  doc.setFillColor(37, 99, 235); doc.rect(0, 0, W, 1.5, 'F')
  // Logo
  doc.setFillColor(37, 99, 235); doc.roundedRect(10, 6, 16, 16, 3, 3, 'F')
  doc.setFontSize(10); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold')
  doc.text('QC', 18, 17, { align: 'center' })
  // Título
  doc.setFontSize(13); doc.text('QualityControl — Empeno Pro', 30, 13)
  doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(147,197,253)
  doc.text('Relatório de Inspeção de Empeno', 30, 19)
  doc.setFontSize(6.5); doc.setTextColor(100,116,139)
  doc.text(`Gerado em ${data} às ${hora}`, W - 10, 19, { align: 'right' })

  // Badge de resultado
  const badgeColor = statusGeral === 'Aprovado' ? CV : CR
  const badgeBg    = statusGeral === 'Aprovado' ? CVL : CRL
  doc.setFillColor(...badgeBg); doc.roundedRect(W - 46, 5, 36, 14, 2, 2, 'F')
  doc.setFillColor(...badgeColor); doc.rect(W - 46, 5, 2.5, 14, 'F')
  doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(...badgeColor)
  doc.text(statusGeral.toUpperCase(), W - 28, 14, { align: 'center' })

  // ── Dados do lote ──
  const ly = 38
  doc.setFillColor(248,250,252); doc.roundedRect(10, ly, W - 20, 36, 2, 2, 'F')
  doc.setDrawColor(226,232,240); doc.setLineWidth(0.3); doc.roundedRect(10, ly, W - 20, 36, 2, 2, 'D')

  const campos = [
    ['Inspetor', form.value.inspetor], ['Linha', form.value.linha],
    ['Produto', form.value.produto],   ['Formato', form.value.formatoNome],
    ['Lote', form.value.lote],         ['Pós Folga', form.value.posFolga],
  ]
  campos.forEach(([label, val], i) => {
    const col = i % 3; const row = Math.floor(i / 3)
    const cx = 14 + col * ((W - 28) / 3)
    const cy = ly + 8 + row * 14
    doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139)
    doc.text(label.toUpperCase(), cx, cy)
    doc.setFontSize(8.5); doc.setFont('helvetica','bold'); doc.setTextColor(30,41,59)
    doc.text(String(val || '—'), cx, cy + 6)
  })

  // Ranges
  const ry = ly + 38
  doc.setFillColor(219,234,254); doc.roundedRect(10, ry, (W - 24) / 2, 10, 2, 2, 'F')
  doc.setFillColor(220,252,231); doc.roundedRect(14 + (W - 24) / 2, ry, (W - 24) / 2, 10, 2, 2, 'F')
  doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(71,85,105)
  doc.text('RANGE LATERAL', 14, ry + 4); doc.text('RANGE CENTRAL', 18 + (W - 24) / 2, ry + 4)
  doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(30,41,59)
  doc.text(`${fmtNum(cfg.latMin)}  a  ${fmtNum(cfg.latMax)}`, 14, ry + 9)
  doc.text(`${fmtNum(cfg.centMin)}  a  ${fmtNum(cfg.centMax)}`, 18 + (W - 24) / 2, ry + 9)

  // ── Tabela de medições ──
  const head = [['Peça', 'Lat A', 'Lat B', 'Lat C', 'Lat D', 'Cent 1', 'Cent 2']]
  const body = form.value.pecas.map((p, idx) => [
    idx + 1, fmtNum(p.latA), fmtNum(p.latB), fmtNum(p.latC), fmtNum(p.latD), fmtNum(p.cenA), fmtNum(p.cenB)
  ])
  // Marcar células fora do range
  const celulasForaLat  = []
  const celulasForaCent = []
  form.value.pecas.forEach((p, ri) => {
    if (foraLat(p.latA))  celulasForaLat.push({ri, ci:1})
    if (foraLat(p.latB))  celulasForaLat.push({ri, ci:2})
    if (foraLat(p.latC))  celulasForaLat.push({ri, ci:3})
    if (foraLat(p.latD))  celulasForaLat.push({ri, ci:4})
    if (foraCent(p.cenA)) celulasForaCent.push({ri, ci:5})
    if (foraCent(p.cenB)) celulasForaCent.push({ri, ci:6})
  })

  autoTable(doc, {
    startY: ry + 14,
    head, body,
    styles: { fontSize: 8.5, cellPadding: 3, halign: 'center', textColor: CZ, lineColor: [226,232,240], lineWidth: 0.2 },
    headStyles: { fillColor: CZ, textColor: CB, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248,250,252] },
    columnStyles: { 0: { fontStyle: 'bold', fillColor: [241,245,249] } },
    margin: { left: 10, right: 10 },
    didParseCell(d) {
      if (d.section !== 'body') return
      const { ri, ci } = { ri: d.row.index, ci: d.column.index }
      if (celulasForaLat.some(c => c.ri===ri && c.ci===ci) || celulasForaCent.some(c => c.ri===ri && c.ci===ci)) {
        d.cell.styles.textColor = CR; d.cell.styles.fontStyle = 'bold'; d.cell.styles.fillColor = CRL
      } else if (ci >= 1) {
        d.cell.styles.textColor = CV
      }
    }
  })

  // ── Rodapé ──
  const H = doc.internal.pageSize.getHeight()
  doc.setFillColor(15,23,42); doc.rect(0, H-12, W, 12, 'F')
  doc.setFillColor(37,99,235); doc.rect(0, H-12, W, 0.8, 'F')
  doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(147,197,253)
  doc.text('QualityControl — Empeno Pro', 10, H-5.5)
  doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139)
  doc.text('* Vermelho = valor fora do range tolerado', W/2, H-5.5, { align:'center' })
  doc.text('1 / 1', W-10, H-5.5, { align:'right' })

  // Salva e retorna o blob para possível uso futuro
  const filename = `Empeno_${form.value.lote}_${data.replace(/\//g,'-')}.pdf`
  doc.save(filename)
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
    const pecasFormatadas = form.value.pecas.map(p => ({
      laterais: { A: Number(p.latA), B: Number(p.latB), C: Number(p.latC), D: Number(p.latD) },
      centrais: { '1': Number(p.cenA), '2': Number(p.cenB) }
    }))

    const limitesSnapshot = {
      latMin: cfg.latMin, latMax: cfg.latMax, centMin: cfg.centMin, centMax: cfg.centMax,
      tamanhoMin: cfg.tamanhoMin ?? null, tamanhoMax: cfg.tamanhoMax ?? null,
      esquadroMin: cfg.esquadroMin ?? null, esquadroMax: cfg.esquadroMax ?? null,
    }

    const formatoDoc = refStore.formatos.find(f => f.nome === form.value.formatoNome)
    const agora = new Date()

    await addDoc(collection(db, 'inspecoes'), {
      produto: form.value.produto, lote: form.value.lote, linha: form.value.linha,
      inspetor: form.value.inspetor, formatoNome: form.value.formatoNome,
      formatoId: formatoDoc?.id ?? null, posFolga: form.value.posFolga,
      observacoes: form.value.observacoes || '',
      pecas: pecasFormatadas, limitesSnapshot,
      temDadosEmpeno: true, pecasEspessura: [], medicoesTamanhoEsquadro: [], espessuraDeclarada: null,
      resultado: statusGeral, status: 'finalizado',
      dataHora: serverTimestamp(),
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR').slice(0, 5),
    })

    if (navigator.vibrate) navigator.vibrate(150)

    // ── Pergunta sobre WhatsApp ──
    const { isConfirmed: enviaWA } = await Swal.fire({
      title: 'Gravado com sucesso! 🎉',
      html: 'Deseja enviar o relatório pelo <strong>WhatsApp</strong>?',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: '<i class="ph-fill ph-whatsapp-logo"></i> Sim, enviar',
      cancelButtonText: 'Não, obrigado',
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
    })

    if (enviaWA) {
      // Gera e faz download do PDF
      gerarPDFInspecao(statusGeral, agora)

      // Pequena pausa para o download iniciar antes de abrir o WhatsApp
      await new Promise(r => setTimeout(r, 600))

      // Abre WhatsApp com o texto
      const fmtNum = (v) => (v !== null && v !== '' && !isNaN(Number(v))) ? Number(v).toFixed(2).replace('.', ',') : '--'
      const emoji  = (v, min, max) => validar(v, min, max) === 'aprovado' ? '🟢' : validar(v, min, max) === 'reprovado' ? '🔴' : '⚪'
      const data   = agora.toLocaleDateString('pt-BR')
      const hora   = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

      let txt = `*RELATÓRIO DE EMPENO*\n`
      txt += `*Data:* ${data} às ${hora}\n`
      txt += `*Responsável:* ${form.value.inspetor}\n`
      txt += `*Linha:* ${form.value.linha}\n`
      txt += `*Produto:* ${form.value.produto}\n`
      txt += `*Formato:* ${form.value.formatoNome}\n`
      txt += `*Lote:* ${form.value.lote}\n\n`
      txt += `Range Lateral:(${fmtNum(cfg.latMin)} a ${fmtNum(cfg.latMax)})\n`
      txt += `Range Central:(${fmtNum(cfg.centMin)} a ${fmtNum(cfg.centMax)})\n`

      form.value.pecas.forEach((p, idx) => {
        txt += `\n*Peça ${idx + 1}*\n`
        txt += `${emoji(p.latA, cfg.latMin, cfg.latMax)} Lado A: ${fmtNum(p.latA)}\n`
        txt += `${emoji(p.latB, cfg.latMin, cfg.latMax)} Lado B: ${fmtNum(p.latB)}\n`
        txt += `${emoji(p.latC, cfg.latMin, cfg.latMax)} Lado C: ${fmtNum(p.latC)}\n`
        txt += `${emoji(p.latD, cfg.latMin, cfg.latMax)} Lado D: ${fmtNum(p.latD)}\n`
        txt += `*Central*\n`
        txt += `${emoji(p.cenA, cfg.centMin, cfg.centMax)} Lado A: ${fmtNum(p.cenA)}\n`
        txt += `${emoji(p.cenB, cfg.centMin, cfg.centMax)} Lado B: ${fmtNum(p.cenB)}\n`
      })

      window.open(`https://wa.me/?text=${encodeURIComponent(txt.trimEnd())}`, '_blank')
    }

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