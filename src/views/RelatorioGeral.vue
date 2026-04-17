<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
    <Sidebar />
    <main class="flex-1 overflow-y-auto w-full flex flex-col">

      <header class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shadow-sm sticky top-0 z-20">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
              <i class="ph-fill ph-warning-circle text-red-500"></i> Relatório Geral de Não Conformidades
            </h1>
            <p class="text-xs text-gray-400 mt-0.5">Empeno · Dimensional · Atrito · Relatório de Turno</p>
          </div>
        </div>
      </header>

      <div class="p-6 max-w-4xl mx-auto w-full space-y-6 pb-28 md:pb-8">

        <!-- Filtros -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-5">
          <h2 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <i class="ph-fill ph-funnel text-red-500"></i> Período de Análise
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Data Início</label>
              <input v-model="filtro.dataInicio" type="date"
                class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <div>
              <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Data Fim</label>
              <input v-model="filtro.dataFim" type="date"
                class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
          </div>

          <!-- Atalhos de período -->
          <div class="flex flex-wrap gap-2 mt-3">
            <button v-for="a in atalhos" :key="a.label" @click="aplicarAtalho(a)"
              class="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all"
              :class="atalhoAtivo === a.label
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-red-300'"
            >{{ a.label }}</button>
          </div>

          <button @click="buscar" :disabled="carregando || !filtro.dataInicio"
            class="mt-4 w-full py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <i v-if="carregando" class="ph-bold ph-spinner animate-spin"></i>
            <i v-else class="ph-fill ph-magnifying-glass"></i>
            {{ carregando ? 'Buscando...' : 'Buscar Não Conformidades' }}
          </button>
        </div>

        <!-- Resultados -->
        <div v-if="buscaRealizada" class="space-y-4">

          <!-- KPIs -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 text-center">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total NC</p>
              <p class="text-3xl font-black text-red-600">{{ totalNCs }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 text-center">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Empeno</p>
              <p class="text-3xl font-black text-orange-500">{{ ncEmpeno.length }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 text-center">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dim + Atrito</p>
              <p class="text-3xl font-black text-yellow-600">{{ ncDimensional.length + ncAtrito.length }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 text-center">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Turno</p>
              <p class="text-3xl font-black text-red-500">{{ ncTurno.length }}</p>
            </div>
          </div>

          <!-- Sem resultados -->
          <div v-if="totalNCs === 0" class="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center">
            <i class="ph-fill ph-check-circle text-emerald-500 text-5xl mb-3 block"></i>
            <p class="font-bold text-gray-700 dark:text-gray-200 text-lg">Nenhuma não conformidade encontrada!</p>
            <p class="text-sm text-gray-400 mt-1">Todas as inspeções no período estão aprovadas.</p>
          </div>

          <!-- Tabelas por tipo -->
          <template v-if="totalNCs > 0">

            <!-- Empeno -->
            <div v-if="ncEmpeno.length" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
              <div class="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-red-50/50 dark:bg-red-900/5">
                <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <i class="ph-fill ph-squares-four text-red-500"></i> Empeno Reprovado
                  <span class="text-xs font-black bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">{{ ncEmpeno.length }}</span>
                </h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th class="p-3">Data/Hora</th>
                      <th class="p-3">Inspetor</th>
                      <th class="p-3">Linha</th>
                      <th class="p-3">Produto / Lote</th>
                      <th class="p-3">Formato</th>
                      <th class="p-3 text-center" colspan="2">Lateral (Range: mín / máx)</th>
                      <th class="p-3 text-center" colspan="2">Central (Range: mín / máx)</th>
                      <th class="p-3">Tratativa</th>
                    </tr>
                    <tr class="text-[10px]">
                      <th colspan="5"></th>
                      <th class="px-3 pb-2 text-center text-red-500">Menor valor</th>
                      <th class="px-3 pb-2 text-center text-blue-500">Maior valor</th>
                      <th class="px-3 pb-2 text-center text-red-500">Menor valor</th>
                      <th class="px-3 pb-2 text-center text-blue-500">Maior valor</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr v-for="i in ncEmpeno" :key="i.id" class="hover:bg-red-50/30 dark:hover:bg-red-900/5">
                      <td class="p-3 whitespace-nowrap">
                        <span class="font-bold text-gray-700 dark:text-gray-300">{{ fmtData(i) }}</span><br>
                        <span class="text-xs text-gray-400">{{ fmtHora(i) }}</span>
                      </td>
                      <td class="p-3 text-gray-600 dark:text-gray-400 text-xs">{{ i.inspetor }}</td>
                      <td class="p-3 font-bold text-gray-800 dark:text-white">{{ i.linha }}</td>
                      <td class="p-3">
                        <div class="text-gray-700 dark:text-gray-300 text-xs">{{ i.produto }}</div>
                        <span class="font-mono font-black text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">{{ i.lote }}</span>
                      </td>
                      <td class="p-3 text-xs text-gray-500">
                        {{ i.formatoNome }}
                        <div v-if="i.limitesSnapshot" class="text-[10px] text-gray-400 mt-0.5">
                          Lat: {{ fmtV(i.limitesSnapshot.latMin) }} / {{ fmtV(i.limitesSnapshot.latMax) }}<br>
                          Cent: {{ fmtV(i.limitesSnapshot.centMin) }} / {{ fmtV(i.limitesSnapshot.centMax) }}
                        </div>
                      </td>
                      <!-- Laterais min/max -->
                      <template v-if="minMax(valoresLaterais(i))">
                        <td class="p-3 text-center">
                          <span :class="classeValor(minMax(valoresLaterais(i)).min, i.limitesSnapshot, 'lat')">
                            {{ fmtV(minMax(valoresLaterais(i)).min) }}
                          </span>
                        </td>
                        <td class="p-3 text-center">
                          <span :class="classeValor(minMax(valoresLaterais(i)).max, i.limitesSnapshot, 'lat')">
                            {{ fmtV(minMax(valoresLaterais(i)).max) }}
                          </span>
                        </td>
                      </template>
                      <template v-else>
                        <td class="p-3 text-center text-gray-300">—</td>
                        <td class="p-3 text-center text-gray-300">—</td>
                      </template>
                      <!-- Centrais min/max -->
                      <template v-if="minMax(valoresCentrais(i))">
                        <td class="p-3 text-center">
                          <span :class="classeValor(minMax(valoresCentrais(i)).min, i.limitesSnapshot, 'cent')">
                            {{ fmtV(minMax(valoresCentrais(i)).min) }}
                          </span>
                        </td>
                        <td class="p-3 text-center">
                          <span :class="classeValor(minMax(valoresCentrais(i)).max, i.limitesSnapshot, 'cent')">
                            {{ fmtV(minMax(valoresCentrais(i)).max) }}
                          </span>
                        </td>
                      </template>
                      <template v-else>
                        <td class="p-3 text-center text-gray-300">—</td>
                        <td class="p-3 text-center text-gray-300">—</td>
                      </template>
                      <td class="p-3">
                        <span v-if="i.tratativa" class="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full">{{ i.tratativa }}</span>
                        <span v-else class="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">Pendente</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Dimensional -->
            <div v-if="ncDimensional.length" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-violet-100 dark:border-violet-900/30 overflow-hidden">
              <div class="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-violet-50/50 dark:bg-violet-900/5">
                <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <i class="ph-fill ph-stack text-violet-500"></i> Dimensional Reprovado
                  <span class="text-xs font-black bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">{{ ncDimensional.length }}</span>
                </h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th class="p-3">Data/Hora</th>
                      <th class="p-3">Inspetor</th>
                      <th class="p-3">Linha</th>
                      <th class="p-3">Produto</th>
                      <th class="p-3">Lote</th>
                      <th class="p-3">Formato</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr v-for="d in ncDimensional" :key="d.id" class="hover:bg-violet-50/30 dark:hover:bg-violet-900/5">
                      <td class="p-3 font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ fmtData(d) }}<br><span class="text-xs text-gray-400 font-normal">{{ fmtHora(d) }}</span></td>
                      <td class="p-3 text-gray-600 dark:text-gray-400">{{ d.inspetor }}</td>
                      <td class="p-3 font-bold text-gray-800 dark:text-white">{{ d.linha }}</td>
                      <td class="p-3 text-gray-700 dark:text-gray-300">{{ d.produto }}</td>
                      <td class="p-3"><span class="font-mono font-bold text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">{{ d.lote }}</span></td>
                      <td class="p-3 text-gray-500">{{ d.formatoNome }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Atrito -->
            <div v-if="ncAtrito.length" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-teal-100 dark:border-teal-900/30 overflow-hidden">
              <div class="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-teal-50/50 dark:bg-teal-900/5">
                <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <i class="ph-fill ph-wave-sine text-teal-500"></i> Atrito Reprovado
                  <span class="text-xs font-black bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">{{ ncAtrito.length }}</span>
                </h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th class="p-3">Data/Hora</th>
                      <th class="p-3">Inspetor</th>
                      <th class="p-3">Linha</th>
                      <th class="p-3">Produto</th>
                      <th class="p-3">Lote</th>
                      <th class="p-3">Classe AD</th>
                      <th class="p-3">Média</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr v-for="a in ncAtrito" :key="a.id" class="hover:bg-teal-50/30 dark:hover:bg-teal-900/5">
                      <td class="p-3 font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ fmtData(a) }}<br><span class="text-xs text-gray-400 font-normal">{{ fmtHora(a) }}</span></td>
                      <td class="p-3 text-gray-600 dark:text-gray-400">{{ a.inspetor }}</td>
                      <td class="p-3 font-bold text-gray-800 dark:text-white">{{ a.linha }}</td>
                      <td class="p-3 text-gray-700 dark:text-gray-300">{{ a.produto }}</td>
                      <td class="p-3"><span class="font-mono font-bold text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">{{ a.lote }}</span></td>
                      <td class="p-3 font-bold text-teal-600">{{ a.classeAD }}</td>
                      <td class="p-3 font-bold text-red-600">{{ a.media?.toFixed(3) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Relatório de Turno -->
            <div v-if="ncTurno.length" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/30 overflow-hidden">
              <div class="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-orange-50/50 dark:bg-orange-900/5">
                <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <i class="ph-fill ph-clipboard-text text-orange-500"></i> Relatório de Turno (🔴🟠)
                  <span class="text-xs font-black bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">{{ ncTurno.length }}</span>
                </h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th class="p-3">Data</th>
                      <th class="p-3">Responsável</th>
                      <th class="p-3">Eq.</th>
                      <th class="p-3">Linha</th>
                      <th class="p-3">Referência</th>
                      <th class="p-3">Lote</th>
                      <th class="p-3">Situação</th>
                      <th class="p-3">Observação</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr v-for="(row, idx) in ncTurno" :key="idx" class="hover:bg-orange-50/30 dark:hover:bg-orange-900/5">
                      <td class="p-3 font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ row.data }}</td>
                      <td class="p-3 text-gray-600 dark:text-gray-400">{{ row.responsavel }}</td>
                      <td class="p-3 text-center font-bold text-gray-700 dark:text-gray-300">{{ row.equipe }}</td>
                      <td class="p-3 font-bold text-gray-800 dark:text-white">{{ row.linha }}</td>
                      <td class="p-3 text-gray-700 dark:text-gray-300">{{ row.referencia }}</td>
                      <td class="p-3"><span class="font-mono font-bold text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">{{ row.lote }}</span></td>
                      <td class="p-3">
                        <span class="font-bold text-base">{{ row.situacao === 'vermelha' ? '🔴' : '🟠' }}</span>
                        <span class="text-xs ml-1 font-bold" :class="row.situacao === 'vermelha' ? 'text-red-600' : 'text-orange-600'">
                          {{ row.situacao === 'vermelha' ? 'Restrição' : 'Documento' }}
                        </span>
                      </td>
                      <td class="p-3 text-gray-500 text-xs">{{ row.observacao || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Botões de exportação -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-5">
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <i class="ph-fill ph-export text-gray-500"></i> Exportar Relatório
              </h3>
              <div class="flex flex-wrap gap-3">
                <button @click="exportarExcelGeral"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 transition-all text-sm">
                  <i class="ph-bold ph-file-xls text-lg"></i> Exportar Excel
                </button>
                <button @click="exportarPDFGeral"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800/40 transition-all text-sm">
                  <i class="ph-bold ph-file-pdf text-lg"></i> Exportar PDF
                </button>
                <button @click="enviarEmail"
                  class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800/40 transition-all text-sm">
                  <i class="ph-bold ph-envelope text-lg"></i> Enviar por E-mail
                </button>
              </div>
            </div>

          </template>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import Sidebar from '../components/Sidebar.vue'

// ── Filtros ───────────────────────────────────────────────────────────────────
const hoje = new Date().toISOString().split('T')[0]
const filtro = ref({ dataInicio: hoje, dataFim: hoje })
const atalhoAtivo = ref('Hoje')
const carregando  = ref(false)
const buscaRealizada = ref(false)

const atalhos = [
  { label: 'Hoje',        dias: 0  },
  { label: 'Últimos 7d',  dias: 7  },
  { label: 'Últimos 30d', dias: 30 },
  { label: 'Últimos 90d', dias: 90 },
]

const aplicarAtalho = (a) => {
  const fim   = new Date()
  const ini   = new Date()
  ini.setDate(ini.getDate() - a.dias)
  filtro.value.dataInicio = ini.toISOString().split('T')[0]
  filtro.value.dataFim    = fim.toISOString().split('T')[0]
  atalhoAtivo.value = a.label
}

// ── Resultados ────────────────────────────────────────────────────────────────
const ncEmpeno     = ref([])
const ncDimensional= ref([])
const ncAtrito     = ref([])
const ncTurno      = ref([])

const totalNCs = computed(() => ncEmpeno.value.length + ncDimensional.value.length + ncAtrito.value.length + ncTurno.value.length)

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDate = (d) => {
  if (!d) return null
  if (typeof d.toDate === 'function') return d.toDate()
  if (d.seconds) return new Date(d.seconds * 1000)
  return null
}
const fmtData = (d) => toDate(d.dataHora)?.toLocaleDateString('pt-BR') ?? d.data ?? '--'
const fmtHora = (d) => toDate(d.dataHora)?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) ?? d.hora ?? '--'
const fmtV = (v) => (v !== null && v !== '' && !isNaN(Number(v))) ? Number(v).toFixed(2) : '--'

// ── Análise de valores de empeno ──────────────────────────────────────────────
const valoresLaterais = (inspecao) => {
  const vals = []
  ;(inspecao.pecas || []).forEach(p => {
    const lat = p.laterais || {}
    ;[lat.A, lat.B, lat.C, lat.D].forEach(v => {
      if (v !== null && v !== undefined && v !== '' && !isNaN(Number(v))) vals.push(Number(v))
    })
  })
  return vals
}
const valoresCentrais = (inspecao) => {
  const vals = []
  ;(inspecao.pecas || []).forEach(p => {
    const cen = p.centrais || {}
    ;[cen['1'], cen['2']].forEach(v => {
      if (v !== null && v !== undefined && v !== '' && !isNaN(Number(v))) vals.push(Number(v))
    })
  })
  return vals
}
const minMax = (vals) => vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : null
const foraRange = (v, min, max) => v < min || v > max
const classeValor = (v, lim, tipo) => {
  if (!lim) return ''
  const [mn, mx] = tipo === 'lat' ? [lim.latMin, lim.latMax] : [lim.centMin, lim.centMax]
  return foraRange(v, mn, mx) ? 'text-red-600 dark:text-red-400 font-black bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded' : 'text-emerald-600 dark:text-emerald-400 font-bold'
}

// ── Busca ─────────────────────────────────────────────────────────────────────
const buscar = async () => {
  if (!filtro.value.dataInicio) return
  carregando.value = true

  const ini = new Date(filtro.value.dataInicio + 'T00:00:00')
  const fim = new Date((filtro.value.dataFim || filtro.value.dataInicio) + 'T23:59:59')

  try {
    const [snapEmp, snapDim, snapAt, snapRel] = await Promise.all([
      getDocs(query(collection(db, 'inspecoes'),    orderBy('dataHora','desc'), where('dataHora','>=',ini), where('dataHora','<=',fim))),
      getDocs(query(collection(db, 'dimensionais'), orderBy('dataHora','desc'), where('dataHora','>=',ini), where('dataHora','<=',fim))),
      getDocs(query(collection(db, 'atrito'),       orderBy('dataHora','desc'), where('dataHora','>=',ini), where('dataHora','<=',fim))),
      getDocs(query(collection(db, 'relatorios_turno'), orderBy('dataHora','desc'), where('dataHora','>=',ini), where('dataHora','<=',fim))),
    ])

    ncEmpeno.value      = snapEmp.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.resultado === 'Reprovado')
    ncDimensional.value = snapDim.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.resultado === 'Reprovado')
    ncAtrito.value      = snapAt.docs.map(d => ({ id: d.id, ...d.data() })).filter(i => i.resultado === 'Reprovado')

    // Expandir lotes vermelhos/laranja dos relatórios de turno
    const turnoRows = []
    snapRel.docs.forEach(doc => {
      const r = { id: doc.id, ...doc.data() }
      ;(r.linhas || []).forEach(l => {
        ;(l.lotes || []).forEach(lt => {
          if (lt.situacao === 'vermelha' || lt.situacao === 'laranja') {
            turnoRows.push({
              data: r.data ?? fmtData(r),
              responsavel: r.responsavel ?? '',
              equipe: r.equipe ?? '',
              linha: l.linha ?? '',
              referencia: l.referencia ?? '',
              formato: l.formato ?? '',
              lote: lt.lote ?? '',
              situacao: lt.situacao,
              observacao: lt.observacao ?? '',
            })
          }
        })
      })
    })
    ncTurno.value = turnoRows
  } finally {
    carregando.value    = false
    buscaRealizada.value = true
  }
}

// ── Excel ─────────────────────────────────────────────────────────────────────
const exportarExcelGeral = () => {
  const wb = XLSX.utils.book_new()
  const fv = (v) => v ?? ''

  if (ncEmpeno.value.length) {
    const ws = XLSX.utils.json_to_sheet(ncEmpeno.value.map(i => ({
      'Data': fmtData(i), 'Hora': fmtHora(i), 'Inspetor': fv(i.inspetor),
      'Linha': fv(i.linha), 'Produto': fv(i.produto), 'Lote': fv(i.lote),
      'Formato': fv(i.formatoNome), 'Pós Folga': fv(i.posFolga), 'Tratativa': fv(i.tratativa),
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Empeno')
  }
  if (ncDimensional.value.length) {
    const ws = XLSX.utils.json_to_sheet(ncDimensional.value.map(d => ({
      'Data': fmtData(d), 'Hora': fmtHora(d), 'Inspetor': fv(d.inspetor),
      'Linha': fv(d.linha), 'Produto': fv(d.produto), 'Lote': fv(d.lote), 'Formato': fv(d.formatoNome),
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Dimensional')
  }
  if (ncAtrito.value.length) {
    const ws = XLSX.utils.json_to_sheet(ncAtrito.value.map(a => ({
      'Data': fmtData(a), 'Hora': fmtHora(a), 'Inspetor': fv(a.inspetor),
      'Linha': fv(a.linha), 'Produto': fv(a.produto), 'Lote': fv(a.lote),
      'Classe AD': fv(a.classeAD), 'Média': a.media?.toFixed(3) ?? '',
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Atrito')
  }
  if (ncTurno.value.length) {
    const ws = XLSX.utils.json_to_sheet(ncTurno.value.map(r => ({
      'Data': r.data, 'Responsável': r.responsavel, 'Equipe': r.equipe,
      'Linha': r.linha, 'Referência': r.referencia, 'Formato': r.formato,
      'Lote': r.lote, 'Situação': r.situacao === 'vermelha' ? '🔴 Restrição' : '🟠 Documento',
      'Observação': r.observacao,
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Rel Turno')
  }

  const ini = filtro.value.dataInicio.replace(/-/g, '')
  const fim = (filtro.value.dataFim || filtro.value.dataInicio).replace(/-/g, '')
  XLSX.writeFile(wb, `NC_QualityControl_${ini}_${fim}.xlsx`)
}

// ── PDF ───────────────────────────────────────────────────────────────────────
const exportarPDFGeral = () => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const CZ = [30,41,59]; const CB = [255,255,255]; const CR = [220,38,38]; const CA = [234,88,12]

  // Cabeçalho
  doc.setFillColor(15,23,42); doc.rect(0,0,W,22,'F')
  doc.setFillColor(220,38,38); doc.rect(0,0,W,1.5,'F')
  doc.setFillColor(220,38,38); doc.roundedRect(10,5,16,12,2,2,'F')
  doc.setFontSize(9); doc.setTextColor(255,255,255); doc.setFont('helvetica','bold')
  doc.text('NC', 18, 13, {align:'center'})
  doc.setFontSize(13); doc.text('Relatório Geral de Não Conformidades', 30, 11)
  doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(252,165,165)
  const ini = new Date(filtro.value.dataInicio+'T12:00:00').toLocaleDateString('pt-BR')
  const fim = new Date((filtro.value.dataFim||filtro.value.dataInicio)+'T12:00:00').toLocaleDateString('pt-BR')
  doc.text(`Período: ${ini} a ${fim}  ·  Total de NCs: ${totalNCs.value}  ·  Gerado em: ${new Date().toLocaleString('pt-BR')}`, 30, 18)

  // KPIs
  const kpis = [
    { l:'Empeno',     v:ncEmpeno.value.length,      c:[239,68,68] },
    { l:'Dimensional',v:ncDimensional.value.length, c:[167,139,250]},
    { l:'Atrito',     v:ncAtrito.value.length,      c:[20,184,166] },
    { l:'Rel. Turno', v:ncTurno.value.length,       c:[249,115,22] },
  ]
  const kW = (W-20-9)/4
  kpis.forEach((k,i) => {
    const cx = 10 + i*(kW+3)
    doc.setFillColor(248,250,252); doc.roundedRect(cx,25,kW,16,2,2,'F')
    doc.setFillColor(...k.c); doc.rect(cx,25,2.5,16,'F')
    doc.setFontSize(6); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139)
    doc.text(k.l.toUpperCase(), cx+5, 31)
    doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(...k.c)
    doc.text(String(k.v), cx+5, 40)
  })

  let y = 46
  const secao = (titulo, dados, colunas, corHeader) => {
    if (!dados.length) return
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(...corHeader)
    doc.text(`▸ ${titulo} (${dados.length})`, 10, y+4)
    autoTable(doc, {
      startY: y+7, head:[colunas.map(c=>c.label)], body: dados.map(r => colunas.map(c=>r[c.key]??'')),
      styles:{fontSize:6.5,cellPadding:2,textColor:CZ,lineColor:[226,232,240],lineWidth:0.15},
      headStyles:{fillColor:corHeader,textColor:CB,fontStyle:'bold',fontSize:6.5},
      alternateRowStyles:{fillColor:[248,250,252]},
      margin:{left:10,right:10},
    })
    y = (doc.lastAutoTable.finalY ?? y) + 6
  }

  secao('Empeno Reprovado', ncEmpeno.value, [
    {label:'Data',k:'_data'},{label:'Hora',k:'_hora'},{label:'Inspetor',k:'inspetor'},
    {label:'Linha',k:'linha'},{label:'Produto',k:'produto'},{label:'Lote',k:'lote'},
    {label:'Formato',k:'formatoNome'},{label:'Tratativa',k:'tratativa'},
  ].map ? (() => { return [
    {label:'Data',k:'_d'},{label:'Hora',k:'_h'},{label:'Inspetor',k:'inspetor'},
    {label:'Linha',k:'linha'},{label:'Produto',k:'produto'},{label:'Lote',k:'lote'},
    {label:'Formato',k:'formatoNome'},{label:'Tratativa',k:'tratativa'},
  ]})() : [], [239,68,68])

  // Empeno
  if (ncEmpeno.value.length) {
    const dados = ncEmpeno.value.map(i => ({...i, _d:fmtData(i), _h:fmtHora(i), tratativa:i.tratativa||'Pendente'}))
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(220,38,38)
    doc.text(`▸ Empeno Reprovado (${dados.length})`, 10, y+4)
    autoTable(doc, { startY:y+7, head:[['Data','Hora','Inspetor','Linha','Produto','Lote','Formato','Tratativa']],
      body:dados.map(i=>[i._d,i._h,i.inspetor||'',i.linha||'',i.produto||'',i.lote||'',i.formatoNome||'',i.tratativa]),
      styles:{fontSize:6.5,cellPadding:2,textColor:CZ,lineColor:[226,232,240],lineWidth:0.15},
      headStyles:{fillColor:[220,38,38],textColor:CB,fontStyle:'bold'},
      alternateRowStyles:{fillColor:[248,250,252]},margin:{left:10,right:10}})
    y = (doc.lastAutoTable.finalY??y)+6
  }
  // Dimensional
  if (ncDimensional.value.length) {
    const dados = ncDimensional.value.map(d => ({...d, _d:fmtData(d), _h:fmtHora(d)}))
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(109,40,217)
    doc.text(`▸ Dimensional Reprovado (${dados.length})`, 10, y+4)
    autoTable(doc, { startY:y+7, head:[['Data','Hora','Inspetor','Linha','Produto','Lote','Formato']],
      body:dados.map(d=>[d._d,d._h,d.inspetor||'',d.linha||'',d.produto||'',d.lote||'',d.formatoNome||'']),
      styles:{fontSize:6.5,cellPadding:2,textColor:CZ,lineColor:[226,232,240],lineWidth:0.15},
      headStyles:{fillColor:[109,40,217],textColor:CB,fontStyle:'bold'},
      alternateRowStyles:{fillColor:[248,250,252]},margin:{left:10,right:10}})
    y = (doc.lastAutoTable.finalY??y)+6
  }
  // Atrito
  if (ncAtrito.value.length) {
    const dados = ncAtrito.value.map(a => ({...a, _d:fmtData(a), _h:fmtHora(a)}))
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(13,148,136)
    doc.text(`▸ Atrito Reprovado (${dados.length})`, 10, y+4)
    autoTable(doc, { startY:y+7, head:[['Data','Hora','Inspetor','Linha','Produto','Lote','Classe AD','Média']],
      body:dados.map(a=>[a._d,a._h,a.inspetor||'',a.linha||'',a.produto||'',a.lote||'',a.classeAD||'',a.media?.toFixed(3)||'']),
      styles:{fontSize:6.5,cellPadding:2,textColor:CZ,lineColor:[226,232,240],lineWidth:0.15},
      headStyles:{fillColor:[13,148,136],textColor:CB,fontStyle:'bold'},
      alternateRowStyles:{fillColor:[248,250,252]},margin:{left:10,right:10}})
    y = (doc.lastAutoTable.finalY??y)+6
  }
  // Turno
  if (ncTurno.value.length) {
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(234,88,12)
    doc.text(`▸ Relatório de Turno — Lotes Críticos (${ncTurno.value.length})`, 10, y+4)
    autoTable(doc, { startY:y+7, head:[['Data','Responsável','Eq.','Linha','Referência','Lote','Situação','Observação']],
      body:ncTurno.value.map(r=>[r.data,r.responsavel,r.equipe,r.linha,r.referencia,r.lote,r.situacao==='vermelha'?'🔴 Restrição':'🟠 Documento',r.observacao||'']),
      styles:{fontSize:6.5,cellPadding:2,textColor:CZ,lineColor:[226,232,240],lineWidth:0.15},
      headStyles:{fillColor:[234,88,12],textColor:CB,fontStyle:'bold'},
      alternateRowStyles:{fillColor:[248,250,252]},margin:{left:10,right:10}})
    y = (doc.lastAutoTable.finalY??y)+6
  }

  // Rodapé
  const totalPgs = doc.internal.getNumberOfPages()
  for (let i=1;i<=totalPgs;i++) {
    doc.setPage(i)
    const H = doc.internal.pageSize.getHeight()
    doc.setFillColor(15,23,42); doc.rect(0,H-10,W,10,'F')
    doc.setFillColor(220,38,38); doc.rect(0,H-10,W,0.8,'F')
    doc.setFontSize(6.5); doc.setFont('helvetica','bold'); doc.setTextColor(252,165,165)
    doc.text('QualityControl — Relatório de Não Conformidades', 10, H-4.5)
    doc.setTextColor(100,116,139)
    doc.text(`${i} / ${totalPgs}`, W-10, H-4.5, {align:'right'})
  }

  const ini2 = filtro.value.dataInicio.replace(/-/g,'')
  const fim2 = (filtro.value.dataFim||filtro.value.dataInicio).replace(/-/g,'')
  doc.save(`NC_QualityControl_${ini2}_${fim2}.pdf`)
}

// ── Email ─────────────────────────────────────────────────────────────────────
const enviarEmail = () => {
  const ini = new Date(filtro.value.dataInicio+'T12:00:00').toLocaleDateString('pt-BR')
  const fim = new Date((filtro.value.dataFim||filtro.value.dataInicio)+'T12:00:00').toLocaleDateString('pt-BR')

  const assunto = encodeURIComponent(`Relatório de Não Conformidades — ${ini} a ${fim}`)

  let corpo = `RELATÓRIO GERAL DE NÃO CONFORMIDADES\n`
  corpo += `${'='.repeat(50)}\n`
  corpo += `Período : ${ini} a ${fim}\n`
  corpo += `Total NC : ${totalNCs.value} (Empeno: ${ncEmpeno.value.length} | Dimensional: ${ncDimensional.value.length} | Atrito: ${ncAtrito.value.length} | Turno: ${ncTurno.value.length})\n`
  corpo += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n\n`

  if (ncEmpeno.value.length) {
    corpo += `${'='.repeat(50)}\n`
    corpo += `EMPENO REPROVADO (${ncEmpeno.value.length} registro${ncEmpeno.value.length !== 1 ? 's' : ''})\n`
    corpo += `${'='.repeat(50)}\n`
    ncEmpeno.value.forEach((i, idx) => {
      const lim  = i.limitesSnapshot || {}
      const vLat = valoresLaterais(i)
      const vCen = valoresCentrais(i)
      const mmLat = minMax(vLat)
      const mmCen = minMax(vCen)

      const flagLat = (v, tipo = 'lat') => {
        if (v === null || v === undefined) return ''
        const [mn, mx] = tipo === 'lat' ? [lim.latMin, lim.latMax] : [lim.centMin, lim.centMax]
        return (mn !== undefined && mx !== undefined && foraRange(v, mn, mx)) ? ' *** FORA DO RANGE ***' : ''
      }

      corpo += `\n[${idx + 1}] ${fmtData(i)} ${fmtHora(i)}\n`
      corpo += `    Linha   : ${i.linha || '—'}\n`
      corpo += `    Produto : ${i.produto || '—'}\n`
      corpo += `    Lote    : ${i.lote || '—'}\n`
      corpo += `    Formato : ${i.formatoNome || '—'}\n`
      if (lim.latMin !== undefined) {
        corpo += `    Range Lateral : ${fmtV(lim.latMin)} a ${fmtV(lim.latMax)}\n`
      }
      if (lim.centMin !== undefined) {
        corpo += `    Range Central : ${fmtV(lim.centMin)} a ${fmtV(lim.centMax)}\n`
      }
      if (mmLat) {
        corpo += `    Lateral Menor : ${fmtV(mmLat.min)}${flagLat(mmLat.min, 'lat')}\n`
        corpo += `    Lateral Maior : ${fmtV(mmLat.max)}${flagLat(mmLat.max, 'lat')}\n`
      }
      if (mmCen) {
        corpo += `    Central Menor : ${fmtV(mmCen.min)}${flagLat(mmCen.min, 'cent')}\n`
        corpo += `    Central Maior : ${fmtV(mmCen.max)}${flagLat(mmCen.max, 'cent')}\n`
      }
      corpo += `    Tratativa : ${i.tratativa || 'PENDENTE'}\n`
    })
    corpo += '\n'
  }

  if (ncDimensional.value.length) {
    corpo += `${'='.repeat(50)}\n`
    corpo += `DIMENSIONAL REPROVADO (${ncDimensional.value.length} registro${ncDimensional.value.length !== 1 ? 's' : ''})\n`
    corpo += `${'='.repeat(50)}\n`
    ncDimensional.value.forEach((d, idx) => {
      const lim    = d.limitesSnapshot || {}
      const espMin = d.espessuraDeclarada ? d.espessuraDeclarada * 0.95 : null
      const espMax = d.espessuraDeclarada ? d.espessuraDeclarada * 1.05 : null

      corpo += `\n[${idx + 1}] ${fmtData(d)} ${fmtHora(d)}\n`
      corpo += `    Linha   : ${d.linha || '—'}\n`
      corpo += `    Produto : ${d.produto || '—'}\n`
      corpo += `    Lote    : ${d.lote || '—'}\n`
      corpo += `    Formato : ${d.formatoNome || '—'}\n`
      if (d.espessuraDeclarada) {
        corpo += `    Esp. Declarada : ${fmtV(d.espessuraDeclarada)} mm  (tol. ${fmtV(espMin)} a ${fmtV(espMax)})\n`
      }
      if (lim.tamanhoMin !== undefined) {
        corpo += `    Range Tamanho  : ${fmtV(lim.tamanhoMin)} a ${fmtV(lim.tamanhoMax)} mm\n`
      }
      if (lim.esquadroMin !== undefined) {
        corpo += `    Range Esquadro : ${fmtV(lim.esquadroMin)} a ${fmtV(lim.esquadroMax)} mm\n`
      }

      // Espessura — pontos fora do range
      const espFora = []
      ;(d.pecasEspessura || []).forEach((p, pi) => {
        ;(p.pontos || []).forEach((pt, pti) => {
          if (pt !== null && pt !== '' && !isNaN(Number(pt)) && espMin !== null && foraRange(Number(pt), espMin, espMax)) {
            espFora.push(`P${pi+1}/Pt${pti+1}: ${fmtV(pt)}`)
          }
        })
      })
      if (espFora.length) {
        corpo += `    Espessura FORA : ${espFora.join(' | ')} *** FORA DO RANGE ***\n`
      }

      // Tamanho e esquadro fora do range
      const tamFora = []; const esqFora = []
      ;(d.medicoesTE || []).forEach((m, mi) => {
        if (m.tamanho !== null && lim.tamanhoMin !== undefined && foraRange(Number(m.tamanho), lim.tamanhoMin, lim.tamanhoMax)) {
          tamFora.push(`R${mi+1}: ${fmtV(m.tamanho)}`)
        }
        if (m.esquadro !== null && lim.esquadroMin !== undefined && foraRange(Number(m.esquadro), lim.esquadroMin, lim.esquadroMax)) {
          esqFora.push(`R${mi+1}: ${fmtV(m.esquadro)}`)
        }
      })
      if (tamFora.length) corpo += `    Tamanho FORA   : ${tamFora.join(' | ')} *** FORA DO RANGE ***\n`
      if (esqFora.length) corpo += `    Esquadro FORA  : ${esqFora.join(' | ')} *** FORA DO RANGE ***\n`
    })
    corpo += '\n'
  }

  if (ncAtrito.value.length) {
    corpo += `${'='.repeat(50)}\n`
    corpo += `ATRITO REPROVADO (${ncAtrito.value.length} registro${ncAtrito.value.length !== 1 ? 's' : ''})\n`
    corpo += `${'='.repeat(50)}\n`
    ncAtrito.value.forEach((a, idx) => {
      const lim = a.limitesSnapshot || {}
      const fora = lim.min !== undefined && foraRange(a.media, lim.min, lim.max)
      corpo += `\n[${idx + 1}] ${fmtData(a)} ${fmtHora(a)}\n`
      corpo += `    Linha    : ${a.linha || '—'}\n`
      corpo += `    Produto  : ${a.produto || '—'}\n`
      corpo += `    Lote     : ${a.lote || '—'}\n`
      corpo += `    Classe AD: ${a.classeAD || '—'}\n`
      if (lim.min !== undefined) corpo += `    Range    : ${fmtV(lim.min)} a ${fmtV(lim.max)}\n`
      corpo += `    Média    : ${a.media?.toFixed(3) || '—'}${fora ? ' *** FORA DO RANGE ***' : ''}\n`
    })
    corpo += '\n'
  }

  if (ncTurno.value.length) {
    corpo += `${'='.repeat(50)}\n`
    corpo += `RELATÓRIO DE TURNO — LOTES CRÍTICOS (${ncTurno.value.length})\n`
    corpo += `${'='.repeat(50)}\n`
    ncTurno.value.forEach((r, idx) => {
      const sit = r.situacao === 'vermelha' ? '🔴 RESTRIÇÃO / RETIDO' : '🟠 LIBERADO COM DOCUMENTO'
      corpo += `\n[${idx + 1}] ${r.data}\n`
      corpo += `    Responsável : ${r.responsavel || '—'} | Equipe: ${r.equipe || '—'}\n`
      corpo += `    Linha       : ${r.linha || '—'}\n`
      corpo += `    Referência  : ${r.referencia || '—'}\n`
      corpo += `    Formato     : ${r.formato || '—'}\n`
      corpo += `    Lote        : ${r.lote || '—'}\n`
      corpo += `    Situação    : ${sit}\n`
      if (r.observacao) corpo += `    Observação  : ${r.observacao}\n`
    })
  }

  corpo += `\n${'─'.repeat(50)}\n`
  corpo += `QualityControl — Empeno Pro\n`
  corpo += `Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`

  window.location.href = `mailto:?subject=${assunto}&body=${encodeURIComponent(corpo)}`
}
</script>