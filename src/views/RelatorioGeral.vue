<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
    <Sidebar />
    <main class="flex-1 overflow-hidden flex flex-col">

      <header class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shadow-sm flex-shrink-0">
        <h1 class="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
          <i class="ph-fill ph-warning-circle text-red-500"></i> Relatório Geral de Não Conformidades
        </h1>
        <p class="text-xs text-gray-400 mt-0.5">Empeno · Dimensional · Atrito · Relatório de Turno</p>
      </header>

      <div class="flex flex-1 overflow-hidden">

        <!-- Painel lateral esquerdo -->
        <aside class="w-60 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 overflow-y-auto">
          <div class="p-4 space-y-4">

            <!-- Filtro período -->
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <i class="ph-fill ph-funnel text-red-500"></i> Período
              </p>
              <div class="space-y-2">
                <div>
                  <label class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Início</label>
                  <input v-model="filtro.dataInicio" type="date" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div>
                  <label class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Fim</label>
                  <input v-model="filtro.dataFim" type="date" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400" />
                </div>
              </div>
              <div class="flex flex-wrap gap-1 mt-2">
                <button v-for="a in atalhos" :key="a.label" @click="aplicarAtalho(a)"
                  class="px-2 py-1 text-[10px] font-bold rounded-md border transition-all"
                  :class="atalhoAtivo === a.label ? 'bg-red-600 text-white border-red-600' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-red-300'"
                >{{ a.label }}</button>
              </div>
              <button @click="buscar" :disabled="carregando || !filtro.dataInicio"
                class="mt-3 w-full py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 text-xs">
                <i v-if="carregando" class="ph-bold ph-spinner animate-spin"></i>
                <i v-else class="ph-fill ph-magnifying-glass"></i>
                {{ carregando ? 'Buscando...' : 'Buscar NCs' }}
              </button>
            </div>

            <!-- KPIs clicáveis -->
            <div v-if="buscaRealizada" class="space-y-1.5 border-t border-gray-100 dark:border-slate-800 pt-4">
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Filtrar por</p>

              <button @click="kpiFiltro = ''" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all"
                :class="kpiFiltro === '' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-red-300'">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">⚠️ Total NC</span>
                <span class="text-xl font-black text-red-600">{{ totalNCs }}</span>
              </button>
              <button @click="kpiFiltro = 'empeno'" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all"
                :class="kpiFiltro === 'empeno' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-orange-300'">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><i class="ph-fill ph-squares-four text-orange-500"></i> Empeno</span>
                <span class="text-xl font-black text-orange-500">{{ ncEmpeno.length }}</span>
              </button>
              <button @click="kpiFiltro = 'dimensional'" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all"
                :class="kpiFiltro === 'dimensional' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-violet-300'">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><i class="ph-fill ph-stack text-violet-500"></i> Dimensional</span>
                <span class="text-xl font-black text-violet-600">{{ ncDimensional.length }}</span>
              </button>
              <button @click="kpiFiltro = 'atrito'" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all"
                :class="kpiFiltro === 'atrito' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-teal-300'">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"><i class="ph-fill ph-wave-sine text-teal-500"></i> Atrito</span>
                <span class="text-xl font-black text-teal-600">{{ ncAtrito.length }}</span>
              </button>
              <button @click="kpiFiltro = 'documento'" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all"
                :class="kpiFiltro === 'documento' ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-orange-300'">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">🟠 Documento</span>
                <span class="text-xl font-black text-orange-500">{{ ncTurnoDocumento.length }}</span>
              </button>
              <button @click="kpiFiltro = 'restricao'" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all"
                :class="kpiFiltro === 'restricao' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-red-300'">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">🔴 Restrição</span>
                <span class="text-xl font-black text-red-600">{{ ncTurnoRestricao.length }}</span>
              </button>
              <button @click="kpiFiltro = 'posfolga'" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all"
                :class="kpiFiltro === 'posfolga' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-gray-200 dark:border-slate-700 hover:border-yellow-300'">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">⏱️ Pós Folga</span>
                <span class="text-xl font-black text-yellow-600">{{ ncPosFolga.length }}</span>
              </button>
            </div>

            <!-- Exportações -->
            <div v-if="buscaRealizada && totalNCs > 0" class="space-y-1.5 border-t border-gray-100 dark:border-slate-800 pt-4">
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Exportar</p>
              <button @click="exportarExcelGeral" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 transition-all"><i class="ph-bold ph-file-xls"></i> Excel</button>
              <button @click="exportarPDFGeral" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800/40 transition-all"><i class="ph-bold ph-file-pdf"></i> PDF</button>
              <button @click="enviarEmail" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800/40 transition-all"><i class="ph-bold ph-envelope"></i> E-mail</button>
            </div>
          </div>
        </aside>

        <!-- Área de conteúdo principal -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5 pb-24 md:pb-6">

          <!-- Estado inicial -->
          <div v-if="!buscaRealizada" class="flex flex-col items-center justify-center h-full text-center">
            <i class="ph-fill ph-magnifying-glass text-gray-300 dark:text-slate-700 text-6xl mb-4"></i>
            <p class="font-bold text-gray-500 dark:text-gray-400 text-lg">Selecione um período e clique em Buscar</p>
            <p class="text-sm text-gray-400 mt-1">Os resultados serão exibidos aqui</p>
          </div>

          <div v-else-if="totalNCs === 0" class="flex flex-col items-center justify-center h-full text-center">
            <i class="ph-fill ph-check-circle text-emerald-500 text-6xl mb-4"></i>
            <p class="font-bold text-gray-700 dark:text-gray-200 text-lg">Nenhuma não conformidade encontrada!</p>
            <p class="text-sm text-gray-400 mt-1">Todas as inspeções no período estão aprovadas.</p>
          </div>

          <template v-else>
            <!-- Label do filtro ativo -->
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold text-gray-700 dark:text-gray-200">{{ labelKpiFiltro }}</span>
              <span class="text-xs text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">{{ dadosFiltrados.total }} resultado{{ dadosFiltrados.total !== 1 ? 's' : '' }}</span>
              <button v-if="kpiFiltro" @click="kpiFiltro = ''" class="text-xs text-red-500 hover:underline font-bold flex items-center gap-1 ml-auto"><i class="ph-bold ph-x"></i> Limpar</button>
            </div>

            <!-- Tabela Empeno -->
            <div v-if="dadosFiltrados.empeno.length" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden">
              <div class="px-5 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-red-50/50 dark:bg-red-900/5">
                <i class="ph-fill ph-squares-four text-red-500"></i>
                <span class="font-bold text-gray-800 dark:text-white text-sm">Empeno Reprovado</span>
                <span class="text-xs font-black bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full">{{ dadosFiltrados.empeno.length }}</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th class="p-3">Data/Hora</th><th class="p-3">Inspetor</th><th class="p-3">Linha</th>
                      <th class="p-3">Produto / Lote</th><th class="p-3">Formato</th>
                      <th class="p-3 text-center" colspan="2">Lateral</th>
                      <th class="p-3 text-center" colspan="2">Central</th>
                      <th class="p-3">Tratativa</th><th class="p-3 text-center">Ver</th>
                    </tr>
                    <tr class="text-[10px]">
                      <th colspan="5"></th>
                      <th class="px-3 pb-2 text-center text-red-500">Menor</th>
                      <th class="px-3 pb-2 text-center text-blue-500">Maior</th>
                      <th class="px-3 pb-2 text-center text-red-500">Menor</th>
                      <th class="px-3 pb-2 text-center text-blue-500">Maior</th>
                      <th colspan="2"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr v-for="i in dadosFiltrados.empeno" :key="i.id" class="hover:bg-red-50/30 dark:hover:bg-red-900/5">
                      <td class="p-3 whitespace-nowrap"><span class="font-bold text-gray-700 dark:text-gray-300">{{ fmtData(i) }}</span><br><span class="text-xs text-gray-400">{{ fmtHora(i) }}</span></td>
                      <td class="p-3 text-gray-600 dark:text-gray-400 text-xs">{{ i.inspetor }}</td>
                      <td class="p-3 font-bold text-gray-800 dark:text-white">{{ i.linha }}</td>
                      <td class="p-3"><div class="text-gray-700 dark:text-gray-300 text-xs">{{ i.produto }}</div><span class="font-mono font-black text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">{{ i.lote }}</span></td>
                      <td class="p-3 text-xs text-gray-500">{{ i.formatoNome }}<div v-if="i.limitesSnapshot" class="text-[10px] text-gray-400 mt-0.5">Lat: {{ fmtV(i.limitesSnapshot.latMin) }}/{{ fmtV(i.limitesSnapshot.latMax) }}<br>Cent: {{ fmtV(i.limitesSnapshot.centMin) }}/{{ fmtV(i.limitesSnapshot.centMax) }}</div></td>
                      <template v-if="minMax(valoresLaterais(i))">
                        <td class="p-3 text-center"><span :class="classeValor(minMax(valoresLaterais(i)).min,i.limitesSnapshot,'lat')">{{ fmtV(minMax(valoresLaterais(i)).min) }}</span></td>
                        <td class="p-3 text-center"><span :class="classeValor(minMax(valoresLaterais(i)).max,i.limitesSnapshot,'lat')">{{ fmtV(minMax(valoresLaterais(i)).max) }}</span></td>
                      </template>
                      <template v-else><td class="p-3 text-center text-gray-300">—</td><td class="p-3 text-center text-gray-300">—</td></template>
                      <template v-if="minMax(valoresCentrais(i))">
                        <td class="p-3 text-center"><span :class="classeValor(minMax(valoresCentrais(i)).min,i.limitesSnapshot,'cent')">{{ fmtV(minMax(valoresCentrais(i)).min) }}</span></td>
                        <td class="p-3 text-center"><span :class="classeValor(minMax(valoresCentrais(i)).max,i.limitesSnapshot,'cent')">{{ fmtV(minMax(valoresCentrais(i)).max) }}</span></td>
                      </template>
                      <template v-else><td class="p-3 text-center text-gray-300">—</td><td class="p-3 text-center text-gray-300">—</td></template>
                      <td class="p-3">
                        <span v-if="i.tratativa" class="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full">{{ i.tratativa }}</span>
                        <span v-else class="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">Pendente</span>
                      </td>
                      <td class="p-3 text-center"><button @click="abrirDetalhe(i,'empeno')" class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"><i class="ph-bold ph-eye"></i></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tabela Dimensional -->
            <div v-if="dadosFiltrados.dimensional.length" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-violet-100 dark:border-violet-900/30 overflow-hidden">
              <div class="px-5 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-violet-50/50 dark:bg-violet-900/5">
                <i class="ph-fill ph-stack text-violet-500"></i>
                <span class="font-bold text-gray-800 dark:text-white text-sm">Dimensional Reprovado</span>
                <span class="text-xs font-black bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">{{ dadosFiltrados.dimensional.length }}</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <tr><th class="p-3">Data/Hora</th><th class="p-3">Inspetor</th><th class="p-3">Linha</th><th class="p-3">Produto / Lote</th><th class="p-3">Formato</th><th class="p-3 text-center">Ver</th></tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr v-for="d in dadosFiltrados.dimensional" :key="d.id" class="hover:bg-violet-50/30 dark:hover:bg-violet-900/5">
                      <td class="p-3 whitespace-nowrap"><span class="font-bold text-gray-700 dark:text-gray-300">{{ fmtData(d) }}</span><br><span class="text-xs text-gray-400">{{ fmtHora(d) }}</span></td>
                      <td class="p-3 text-gray-600 dark:text-gray-400 text-xs">{{ d.inspetor }}</td>
                      <td class="p-3 font-bold text-gray-800 dark:text-white">{{ d.linha }}</td>
                      <td class="p-3"><div class="text-gray-700 dark:text-gray-300 text-xs">{{ d.produto }}</div><span class="font-mono font-black text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">{{ d.lote }}</span></td>
                      <td class="p-3 text-gray-500 text-xs">{{ d.formatoNome }}</td>
                      <td class="p-3 text-center"><button @click="abrirDetalhe(d,'dimensional')" class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"><i class="ph-bold ph-eye"></i></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tabela Atrito -->
            <div v-if="dadosFiltrados.atrito.length" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-teal-100 dark:border-teal-900/30 overflow-hidden">
              <div class="px-5 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-teal-50/50 dark:bg-teal-900/5">
                <i class="ph-fill ph-wave-sine text-teal-500"></i>
                <span class="font-bold text-gray-800 dark:text-white text-sm">Atrito Reprovado</span>
                <span class="text-xs font-black bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">{{ dadosFiltrados.atrito.length }}</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <tr><th class="p-3">Data/Hora</th><th class="p-3">Inspetor</th><th class="p-3">Linha</th><th class="p-3">Produto / Lote</th><th class="p-3">Classe AD</th><th class="p-3">Média</th><th class="p-3 text-center">Ver</th></tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr v-for="a in dadosFiltrados.atrito" :key="a.id" class="hover:bg-teal-50/30 dark:hover:bg-teal-900/5">
                      <td class="p-3 whitespace-nowrap"><span class="font-bold text-gray-700 dark:text-gray-300">{{ fmtData(a) }}</span><br><span class="text-xs text-gray-400">{{ fmtHora(a) }}</span></td>
                      <td class="p-3 text-gray-600 dark:text-gray-400 text-xs">{{ a.inspetor }}</td>
                      <td class="p-3 font-bold text-gray-800 dark:text-white">{{ a.linha }}</td>
                      <td class="p-3"><div class="text-gray-700 dark:text-gray-300 text-xs">{{ a.produto }}</div><span class="font-mono font-black text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">{{ a.lote }}</span></td>
                      <td class="p-3 font-bold text-teal-600">{{ a.classeAD }}</td>
                      <td class="p-3 font-bold text-red-600">{{ a.media?.toFixed(3) }}</td>
                      <td class="p-3 text-center"><button @click="abrirDetalhe(a,'atrito')" class="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"><i class="ph-bold ph-eye"></i></button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tabela Turno -->
            <div v-if="dadosFiltrados.turno.length" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-orange-100 dark:border-orange-900/30 overflow-hidden">
              <div class="px-5 py-3 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 bg-orange-50/50 dark:bg-orange-900/5">
                <i class="ph-fill ph-clipboard-text text-orange-500"></i>
                <span class="font-bold text-gray-800 dark:text-white text-sm">Relatório de Turno (🔴🟠)</span>
                <span class="text-xs font-black bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">{{ dadosFiltrados.turno.length }}</span>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm text-left">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-slate-700">
                    <tr><th class="p-3">Data</th><th class="p-3">Responsável</th><th class="p-3">Eq.</th><th class="p-3">Linha</th><th class="p-3">Referência</th><th class="p-3">Lote</th><th class="p-3">Situação</th><th class="p-3">Justificativa</th></tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                    <tr v-for="(row,idx) in dadosFiltrados.turno" :key="idx" class="hover:bg-orange-50/30 dark:hover:bg-orange-900/5">
                      <td class="p-3 font-bold text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">{{ row.data }}</td>
                      <td class="p-3 text-gray-600 dark:text-gray-400 text-xs">{{ row.responsavel }}</td>
                      <td class="p-3 text-center font-bold text-xs">{{ row.equipe }}</td>
                      <td class="p-3 font-bold text-gray-800 dark:text-white text-xs">{{ row.linha }}</td>
                      <td class="p-3 text-gray-700 dark:text-gray-300 text-xs">{{ row.referencia }}</td>
                      <td class="p-3"><span class="font-mono font-black text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{{ row.lote }}</span></td>
                      <td class="p-3">
                        <span class="font-bold">{{ row.situacao === 'vermelha' ? '🔴' : '🟠' }}</span>
                        <span class="text-xs ml-1 font-bold" :class="row.situacao === 'vermelha' ? 'text-red-600' : 'text-orange-600'">{{ row.situacao === 'vermelha' ? 'Restrição' : 'Documento' }}</span>
                      </td>
                      <td class="p-3 text-gray-500 text-xs">{{ row.observacao || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal de Detalhes -->
  <Transition name="fade">
    <div v-if="modalAberto" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" @click.self="fecharModal">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto">

        <div class="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center"
              :class="{ 'bg-red-100 dark:bg-red-900/30': modalTipo==='empeno', 'bg-violet-100 dark:bg-violet-900/30': modalTipo==='dimensional', 'bg-teal-100 dark:bg-teal-900/30': modalTipo==='atrito' }">
              <i class="text-lg" :class="{ 'ph-fill ph-squares-four text-red-500': modalTipo==='empeno', 'ph-fill ph-stack text-violet-500': modalTipo==='dimensional', 'ph-fill ph-wave-sine text-teal-500': modalTipo==='atrito' }"></i>
            </div>
            <div>
              <h2 class="font-black text-gray-800 dark:text-white">{{ tituloModal }}</h2>
              <p class="text-xs text-gray-400">{{ fmtData(modalItem) }} às {{ fmtHora(modalItem) }} · {{ modalItem?.linha }}</p>
            </div>
          </div>
          <button @click="fecharModal" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors"><i class="ph-bold ph-x text-lg"></i></button>
        </div>

        <div class="p-6 space-y-5">
          <!-- Info base -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="(campo,idx) in camposBase" :key="idx" class="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{{ campo.label }}</p>
              <p class="font-bold text-gray-800 dark:text-white text-sm">{{ campo.valor || '—' }}</p>
            </div>
          </div>

          <!-- Detalhes Empeno -->
          <template v-if="modalTipo === 'empeno' && modalItem">
            <div v-if="modalItem.limitesSnapshot" class="grid grid-cols-2 gap-3">
              <div class="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 border border-blue-100 dark:border-blue-900/30">
                <p class="text-[10px] font-bold text-blue-500 uppercase mb-1">Range Lateral</p>
                <p class="font-black text-blue-700 dark:text-blue-300">{{ fmtV(modalItem.limitesSnapshot.latMin) }} a {{ fmtV(modalItem.limitesSnapshot.latMax) }}</p>
              </div>
              <div class="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900/30">
                <p class="text-[10px] font-bold text-indigo-500 uppercase mb-1">Range Central</p>
                <p class="font-black text-indigo-700 dark:text-indigo-300">{{ fmtV(modalItem.limitesSnapshot.centMin) }} a {{ fmtV(modalItem.limitesSnapshot.centMax) }}</p>
              </div>
            </div>
            <div v-for="(peca,pi) in (modalItem.pecas||[])" :key="pi" class="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div class="bg-gray-50 dark:bg-slate-800/50 px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Peça {{ pi + 1 }}</div>
              <div class="p-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div v-for="(val,key) in {'Lat A':peca.laterais?.A,'Lat B':peca.laterais?.B,'Lat C':peca.laterais?.C,'Lat D':peca.laterais?.D,'Cent 1':peca.centrais?.['1'],'Cent 2':peca.centrais?.['2']}" :key="key" class="text-center">
                  <p class="text-[10px] text-gray-400 font-bold mb-1">{{ key }}</p>
                  <span class="text-sm font-black px-2 py-1 rounded-lg block" :class="valorEmpenoClass(val, key.startsWith('Lat') ? 'lat' : 'cent', modalItem.limitesSnapshot)">{{ fmtV(val) }}</span>
                </div>
              </div>
            </div>
            <div v-if="modalItem.tratativa" class="bg-teal-50 dark:bg-teal-900/10 rounded-xl p-3 border border-teal-200 dark:border-teal-800/30">
              <p class="text-[10px] font-bold text-teal-600 uppercase mb-1">Tratativa</p>
              <p class="text-sm text-teal-700 dark:text-teal-300 font-medium">{{ modalItem.tratativa }}</p>
            </div>
          </template>

          <!-- Detalhes Dimensional -->
          <template v-if="modalTipo === 'dimensional' && modalItem">
            <div v-if="modalItem.espessuraDeclarada" class="bg-violet-50 dark:bg-violet-900/10 rounded-xl p-3 border border-violet-100 dark:border-violet-900/30">
              <p class="text-[10px] font-bold text-violet-500 uppercase mb-1">Espessura Declarada</p>
              <p class="font-black text-violet-700 dark:text-violet-300">{{ fmtV(modalItem.espessuraDeclarada) }} mm — Tol: {{ fmtV(modalItem.espessuraDeclarada * 0.95) }} a {{ fmtV(modalItem.espessuraDeclarada * 1.05) }}</p>
            </div>
            <div v-for="(peca,pi) in (modalItem.pecasEspessura||[])" :key="'esp'+pi" class="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div class="bg-gray-50 dark:bg-slate-800/50 px-4 py-2 text-xs font-bold text-gray-500 uppercase flex gap-3">
                <span>Peça {{ pi + 1 }}</span>
                <span v-if="peca.prensa" class="font-normal">Prensa {{ peca.prensa }}</span>
                <span v-if="peca.cavidade" class="font-normal">Cav. {{ peca.cavidade }}</span>
              </div>
              <div class="p-4 flex flex-wrap gap-2">
                <div v-for="(pt,pti) in (peca.pontos||[])" :key="pti" class="text-center min-w-[52px]">
                  <p class="text-[10px] text-gray-400 font-bold mb-1">Pt {{ pti + 1 }}</p>
                  <span class="text-sm font-black px-2 py-1 rounded-lg block" :class="validaEsp(pt, modalItem.espessuraDeclarada) ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'">{{ fmtV(pt) }}</span>
                </div>
              </div>
            </div>
            <div v-if="(modalItem.medicoesTE||[]).length" class="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div class="bg-gray-50 dark:bg-slate-800/50 px-4 py-2 text-xs font-bold text-gray-500 uppercase">Tamanho / Esquadro</div>
              <div class="p-4 space-y-2">
                <div v-for="(m,mi) in (modalItem.medicoesTE||[])" :key="mi" class="flex items-center gap-4 text-sm border-b border-gray-100 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
                  <span class="text-xs font-bold text-gray-400 w-24">Ret. {{ mi+1 }} {{ m.retifica ? '('+m.retifica+')' : '' }}</span>
                  <span class="text-xs"><span class="text-gray-400">Tam:</span> <span class="font-black ml-1" :class="validaTE(m.tamanho, modalItem.limitesSnapshot?.tamanhoMin, modalItem.limitesSnapshot?.tamanhoMax) ? 'text-emerald-600' : 'text-red-600'">{{ fmtV(m.tamanho) }}</span></span>
                  <span class="text-xs"><span class="text-gray-400">Esq:</span> <span class="font-black ml-1" :class="validaTE(m.esquadro, modalItem.limitesSnapshot?.esquadroMin, modalItem.limitesSnapshot?.esquadroMax) ? 'text-emerald-600' : 'text-red-600'">{{ fmtV(m.esquadro) }}</span></span>
                </div>
              </div>
            </div>
          </template>

          <!-- Detalhes Atrito -->
          <template v-if="modalTipo === 'atrito' && modalItem">
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-teal-50 dark:bg-teal-900/10 rounded-xl p-3 border border-teal-100 dark:border-teal-900/30">
                <p class="text-[10px] font-bold text-teal-500 uppercase mb-1">Classe AD</p>
                <p class="font-black text-teal-700 dark:text-teal-300 text-xl">{{ modalItem.classeAD }}</p>
              </div>
              <div v-if="modalItem.limitesSnapshot" class="bg-gray-50 dark:bg-slate-800 rounded-xl p-3 border border-gray-200 dark:border-slate-700">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Range</p>
                <p class="font-black text-gray-700 dark:text-gray-300">{{ fmtV(modalItem.limitesSnapshot.min) }} a {{ fmtV(modalItem.limitesSnapshot.max) }}</p>
              </div>
              <div v-if="modalItem.limitesSnapshot" class="rounded-xl p-3 border"
                :class="foraRange(modalItem.media, modalItem.limitesSnapshot.min, modalItem.limitesSnapshot.max) ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30' : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'">
                <p class="text-[10px] font-bold uppercase mb-1" :class="foraRange(modalItem.media, modalItem.limitesSnapshot.min, modalItem.limitesSnapshot.max) ? 'text-red-500' : 'text-emerald-500'">Média</p>
                <p class="font-black text-xl" :class="foraRange(modalItem.media, modalItem.limitesSnapshot.min, modalItem.limitesSnapshot.max) ? 'text-red-600' : 'text-emerald-600'">{{ modalItem.media?.toFixed(3) }}</p>
              </div>
            </div>
            <div class="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div class="bg-gray-50 dark:bg-slate-800/50 px-4 py-2 text-xs font-bold text-gray-500 uppercase">Medidas ({{ (modalItem.medidas||[]).length }})</div>
              <div class="p-4 flex flex-wrap gap-2">
                <div v-for="(m,mi) in (modalItem.medidas||[])" :key="mi" class="text-center min-w-[52px]">
                  <p class="text-[10px] text-gray-400 font-bold mb-1">{{ mi+1 }}</p>
                  <span class="text-sm font-black px-2 py-1 rounded-lg block"
                    :class="modalItem.limitesSnapshot && foraRange(m, modalItem.limitesSnapshot.min, modalItem.limitesSnapshot.max) ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'">
                    {{ Number(m).toFixed(3) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import Sidebar from '../components/Sidebar.vue'

const hoje = new Date().toISOString().split('T')[0]
const filtro = ref({ dataInicio: hoje, dataFim: hoje })
const atalhoAtivo = ref('Hoje')
const carregando = ref(false)
const buscaRealizada = ref(false)
const kpiFiltro = ref('')

const atalhos = [
  { label: 'Hoje', dias: 0 }, { label: 'Últimos 7d', dias: 7 },
  { label: 'Últimos 30d', dias: 30 }, { label: 'Últimos 90d', dias: 90 },
]
const aplicarAtalho = (a) => {
  const fim = new Date(), ini = new Date()
  ini.setDate(ini.getDate() - a.dias)
  filtro.value.dataInicio = ini.toISOString().split('T')[0]
  filtro.value.dataFim    = fim.toISOString().split('T')[0]
  atalhoAtivo.value = a.label
}

const ncEmpeno      = ref([])
const ncDimensional = ref([])
const ncAtrito      = ref([])
const ncTurno       = ref([])
const ncTurnoDocumento = computed(() => ncTurno.value.filter(r => r.situacao === 'laranja'))
const ncTurnoRestricao = computed(() => ncTurno.value.filter(r => r.situacao === 'vermelha'))
const ncPosFolga       = computed(() => ncEmpeno.value.filter(i => i.posFolga === 'Sim'))
const totalNCs = computed(() => ncEmpeno.value.length + ncDimensional.value.length + ncAtrito.value.length + ncTurno.value.length)

const dadosFiltrados = computed(() => {
  if (kpiFiltro.value === 'empeno')      return { empeno: ncEmpeno.value,         dimensional: [], atrito: [], turno: [], total: ncEmpeno.value.length }
  if (kpiFiltro.value === 'dimensional') return { empeno: [], dimensional: ncDimensional.value, atrito: [], turno: [], total: ncDimensional.value.length }
  if (kpiFiltro.value === 'atrito')      return { empeno: [], dimensional: [], atrito: ncAtrito.value,      turno: [], total: ncAtrito.value.length }
  if (kpiFiltro.value === 'documento')   return { empeno: [], dimensional: [], atrito: [], turno: ncTurnoDocumento.value, total: ncTurnoDocumento.value.length }
  if (kpiFiltro.value === 'restricao')   return { empeno: [], dimensional: [], atrito: [], turno: ncTurnoRestricao.value, total: ncTurnoRestricao.value.length }
  if (kpiFiltro.value === 'posfolga')    return { empeno: ncPosFolga.value, dimensional: [], atrito: [], turno: [], total: ncPosFolga.value.length }
  return { empeno: ncEmpeno.value, dimensional: ncDimensional.value, atrito: ncAtrito.value, turno: ncTurno.value, total: totalNCs.value }
})
const labelKpiFiltro = computed(() => {
  const m = { '': 'Todos os resultados', empeno: 'Empeno Reprovado', dimensional: 'Dimensional Reprovado', atrito: 'Atrito Reprovado', documento: '🟠 Liberado com Documento', restricao: '🔴 Restrição / Retido', posfolga: '⏱️ Inspeções Pós Folga' }
  return m[kpiFiltro.value] ?? 'Resultados'
})

const toDate  = (d) => { if (!d) return null; if (typeof d.toDate === 'function') return d.toDate(); if (d.seconds) return new Date(d.seconds*1000); return null }
const fmtData = (d) => toDate(d?.dataHora)?.toLocaleDateString('pt-BR') ?? d?.data ?? '--'
const fmtHora = (d) => toDate(d?.dataHora)?.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}) ?? d?.hora ?? '--'
const fmtV    = (v) => (v!==null&&v!==undefined&&v!==''&&!isNaN(Number(v))) ? Number(v).toFixed(2) : '--'
const foraRange = (v,min,max) => v!==null&&v!==undefined&&!isNaN(Number(v))&&(Number(v)<min||Number(v)>max)
const valoresLaterais = (i) => { const v=[]; (i.pecas||[]).forEach(p=>{const l=p.laterais||{};[l.A,l.B,l.C,l.D].forEach(x=>{if(x!==null&&x!==undefined&&x!==''&&!isNaN(Number(x)))v.push(Number(x))})}); return v }
const valoresCentrais = (i) => { const v=[]; (i.pecas||[]).forEach(p=>{const c=p.centrais||{};[c['1'],c['2']].forEach(x=>{if(x!==null&&x!==undefined&&x!==''&&!isNaN(Number(x)))v.push(Number(x))})}); return v }
const minMax = (vals) => vals.length ? { min: Math.min(...vals), max: Math.max(...vals) } : null
const classeValor = (v,lim,tipo) => { if(!lim)return'text-gray-500'; const[mn,mx]=tipo==='lat'?[lim.latMin,lim.latMax]:[lim.centMin,lim.centMax]; return foraRange(v,mn,mx)?'text-red-600 dark:text-red-400 font-black bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded':'text-emerald-600 dark:text-emerald-400 font-bold' }
const valorEmpenoClass = (v,tipo,lim) => { if(!lim)return'text-gray-500 bg-gray-50'; const[mn,mx]=tipo==='lat'?[lim.latMin,lim.latMax]:[lim.centMin,lim.centMax]; return foraRange(v,mn,mx)?'text-red-600 bg-red-50 dark:bg-red-900/20':'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' }
const validaEsp = (v,decl) => { if(!decl||v===null||v==='')return true; return Number(v)>=decl*0.95&&Number(v)<=decl*1.05 }
const validaTE  = (v,min,max) => { if(v===null||v===''||min===undefined)return true; return Number(v)>=min&&Number(v)<=max }

const modalAberto = ref(false)
const modalItem   = ref(null)
const modalTipo   = ref('')
const tituloModal = computed(() => ({empeno:'Detalhes — Empeno',dimensional:'Detalhes — Dimensional',atrito:'Detalhes — Atrito'}[modalTipo.value]??'Detalhes'))
const camposBase  = computed(() => {
  if (!modalItem.value) return []
  const i = modalItem.value
  const c = [{label:'Inspetor',valor:i.inspetor},{label:'Linha',valor:i.linha},{label:'Produto',valor:i.produto},{label:'Lote',valor:i.lote},{label:'Resultado',valor:i.resultado}]
  if (modalTipo.value==='atrito') c.splice(3,0,{label:'Classe AD',valor:i.classeAD})
  else c.splice(3,0,{label:'Formato',valor:i.formatoNome})
  return c
})
const abrirDetalhe = (item,tipo) => { modalItem.value=item; modalTipo.value=tipo; modalAberto.value=true }
const fecharModal  = () => { modalAberto.value=false; setTimeout(()=>{ modalItem.value=null; modalTipo.value='' },300) }

const buscar = async () => {
  if (!filtro.value.dataInicio) return
  carregando.value = true
  const ini = new Date(filtro.value.dataInicio+'T00:00:00')
  const fim = new Date((filtro.value.dataFim||filtro.value.dataInicio)+'T23:59:59')
  try {
    const [sE,sD,sA,sR] = await Promise.all([
      getDocs(query(collection(db,'inspecoes'),       orderBy('dataHora','desc'),where('dataHora','>=',ini),where('dataHora','<=',fim))),
      getDocs(query(collection(db,'dimensionais'),    orderBy('dataHora','desc'),where('dataHora','>=',ini),where('dataHora','<=',fim))),
      getDocs(query(collection(db,'atrito'),          orderBy('dataHora','desc'),where('dataHora','>=',ini),where('dataHora','<=',fim))),
      getDocs(query(collection(db,'relatorios_turno'),orderBy('dataHora','desc'),where('dataHora','>=',ini),where('dataHora','<=',fim))),
    ])
    ncEmpeno.value      = sE.docs.map(d=>({id:d.id,...d.data()})).filter(i=>i.resultado==='Reprovado')
    ncDimensional.value = sD.docs.map(d=>({id:d.id,...d.data()})).filter(i=>i.resultado==='Reprovado')
    ncAtrito.value      = sA.docs.map(d=>({id:d.id,...d.data()})).filter(i=>i.resultado==='Reprovado')
    const rows=[]
    sR.docs.forEach(doc=>{const r={id:doc.id,...doc.data()};(r.linhas||[]).forEach(l=>{(l.lotes||[]).forEach(lt=>{if(lt.situacao==='vermelha'||lt.situacao==='laranja')rows.push({data:r.data??fmtData(r),responsavel:r.responsavel??'',equipe:r.equipe??'',linha:l.linha??'',referencia:l.referencia??'',formato:l.formato??'',lote:lt.lote??'',situacao:lt.situacao,observacao:lt.observacao??''})})})})
    ncTurno.value = rows
    kpiFiltro.value = ''
  } finally { carregando.value=false; buscaRealizada.value=true }
}

const exportarExcelGeral = () => {
  const wb=XLSX.utils.book_new();const fv=v=>v??''
  if(ncEmpeno.value.length){const ws=XLSX.utils.json_to_sheet(ncEmpeno.value.map(i=>({'Data':fmtData(i),'Hora':fmtHora(i),'Inspetor':fv(i.inspetor),'Linha':fv(i.linha),'Produto':fv(i.produto),'Lote':fv(i.lote),'Formato':fv(i.formatoNome),'Pós Folga':fv(i.posFolga),'Tratativa':fv(i.tratativa)})));XLSX.utils.book_append_sheet(wb,ws,'Empeno')}
  if(ncDimensional.value.length){const ws=XLSX.utils.json_to_sheet(ncDimensional.value.map(d=>({'Data':fmtData(d),'Hora':fmtHora(d),'Inspetor':fv(d.inspetor),'Linha':fv(d.linha),'Produto':fv(d.produto),'Lote':fv(d.lote),'Formato':fv(d.formatoNome)})));XLSX.utils.book_append_sheet(wb,ws,'Dimensional')}
  if(ncAtrito.value.length){const ws=XLSX.utils.json_to_sheet(ncAtrito.value.map(a=>({'Data':fmtData(a),'Hora':fmtHora(a),'Inspetor':fv(a.inspetor),'Linha':fv(a.linha),'Produto':fv(a.produto),'Lote':fv(a.lote),'Classe AD':fv(a.classeAD),'Média':a.media?.toFixed(3)??''  })));XLSX.utils.book_append_sheet(wb,ws,'Atrito')}
  if(ncTurno.value.length){const ws=XLSX.utils.json_to_sheet(ncTurno.value.map(r=>({'Data':r.data,'Responsável':r.responsavel,'Equipe':r.equipe,'Linha':r.linha,'Referência':r.referencia,'Lote':r.lote,'Situação':r.situacao==='vermelha'?'🔴 Restrição':'🟠 Documento','Justificativa':r.observacao})));XLSX.utils.book_append_sheet(wb,ws,'Rel Turno')}
  const ini=filtro.value.dataInicio.replace(/-/g,'');const fim=(filtro.value.dataFim||filtro.value.dataInicio).replace(/-/g,'')
  XLSX.writeFile(wb,`NC_QualityControl_${ini}_${fim}.xlsx`)
}

const exportarPDFGeral = () => {
  const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'})
  const W=doc.internal.pageSize.getWidth();const CZ=[30,41,59];const CB=[255,255,255]
  doc.setFillColor(15,23,42);doc.rect(0,0,W,22,'F')
  doc.setFillColor(220,38,38);doc.rect(0,0,W,1.5,'F')
  doc.setFillColor(220,38,38);doc.roundedRect(10,5,16,12,2,2,'F')
  doc.setFontSize(9);doc.setTextColor(255,255,255);doc.setFont('helvetica','bold')
  doc.text('NC',18,13,{align:'center'})
  doc.setFontSize(13);doc.text('Relatório Geral de Não Conformidades',30,11)
  doc.setFontSize(7.5);doc.setFont('helvetica','normal');doc.setTextColor(252,165,165)
  const ini=new Date(filtro.value.dataInicio+'T12:00:00').toLocaleDateString('pt-BR')
  const fim=new Date((filtro.value.dataFim||filtro.value.dataInicio)+'T12:00:00').toLocaleDateString('pt-BR')
  doc.text(`Período: ${ini} a ${fim}  ·  Total: ${totalNCs.value}  ·  ${new Date().toLocaleString('pt-BR')}`,30,18)
  const kpis=[{l:'Empeno',v:ncEmpeno.value.length,c:[239,68,68]},{l:'Dimensional',v:ncDimensional.value.length,c:[167,139,250]},{l:'Atrito',v:ncAtrito.value.length,c:[20,184,166]},{l:'Documento',v:ncTurnoDocumento.value.length,c:[249,115,22]},{l:'Restrição',v:ncTurnoRestricao.value.length,c:[220,38,38]}]
  const kW=(W-20-12)/5
  kpis.forEach((k,i)=>{const cx=10+i*(kW+3);doc.setFillColor(248,250,252);doc.roundedRect(cx,25,kW,16,2,2,'F');doc.setFillColor(...k.c);doc.rect(cx,25,2.5,16,'F');doc.setFontSize(6);doc.setFont('helvetica','normal');doc.setTextColor(100,116,139);doc.text(k.l.toUpperCase(),cx+5,31);doc.setFontSize(14);doc.setFont('helvetica','bold');doc.setTextColor(...k.c);doc.text(String(k.v),cx+5,40)})
  let y=46
  const tbl=(titulo,dados,cols,cor)=>{if(!dados.length)return;doc.setFontSize(8);doc.setFont('helvetica','bold');doc.setTextColor(...cor);doc.text(`▸ ${titulo} (${dados.length})`,10,y+4);autoTable(doc,{startY:y+7,head:[cols.map(c=>c.l)],body:dados.map(r=>cols.map(c=>r[c.k]??'')),styles:{fontSize:6.5,cellPadding:2,textColor:CZ,lineColor:[226,232,240],lineWidth:0.15},headStyles:{fillColor:cor,textColor:CB,fontStyle:'bold'},alternateRowStyles:{fillColor:[248,250,252]},margin:{left:10,right:10}});y=(doc.lastAutoTable.finalY??y)+6}
  tbl('Empeno Reprovado',ncEmpeno.value.map(i=>({...i,_d:fmtData(i),_h:fmtHora(i),trat:i.tratativa||'Pendente'})),[{l:'Data',k:'_d'},{l:'Hora',k:'_h'},{l:'Inspetor',k:'inspetor'},{l:'Linha',k:'linha'},{l:'Produto',k:'produto'},{l:'Lote',k:'lote'},{l:'Formato',k:'formatoNome'},{l:'Tratativa',k:'trat'}],[220,38,38])
  tbl('Dimensional Reprovado',ncDimensional.value.map(d=>({...d,_d:fmtData(d),_h:fmtHora(d)})),[{l:'Data',k:'_d'},{l:'Hora',k:'_h'},{l:'Inspetor',k:'inspetor'},{l:'Linha',k:'linha'},{l:'Produto',k:'produto'},{l:'Lote',k:'lote'},{l:'Formato',k:'formatoNome'}],[109,40,217])
  tbl('Atrito Reprovado',ncAtrito.value.map(a=>({...a,_d:fmtData(a),_h:fmtHora(a)})),[{l:'Data',k:'_d'},{l:'Hora',k:'_h'},{l:'Inspetor',k:'inspetor'},{l:'Linha',k:'linha'},{l:'Produto',k:'produto'},{l:'Lote',k:'lote'},{l:'Classe AD',k:'classeAD'},{l:'Média',k:'media'}],[13,148,136])
  tbl('Turno — Lotes Críticos',ncTurno.value.map(r=>({...r,sit:r.situacao==='vermelha'?'🔴 Restrição':'🟠 Documento'})),[{l:'Data',k:'data'},{l:'Responsável',k:'responsavel'},{l:'Eq.',k:'equipe'},{l:'Linha',k:'linha'},{l:'Referência',k:'referencia'},{l:'Lote',k:'lote'},{l:'Situação',k:'sit'},{l:'Justificativa',k:'observacao'}],[234,88,12])
  const pg=doc.internal.getNumberOfPages();for(let i=1;i<=pg;i++){doc.setPage(i);const H=doc.internal.pageSize.getHeight();doc.setFillColor(15,23,42);doc.rect(0,H-10,W,10,'F');doc.setFillColor(220,38,38);doc.rect(0,H-10,W,0.8,'F');doc.setFontSize(6.5);doc.setFont('helvetica','bold');doc.setTextColor(252,165,165);doc.text('QualityControl — Não Conformidades',10,H-4.5);doc.setTextColor(100,116,139);doc.text(`${i} / ${pg}`,W-10,H-4.5,{align:'right'})}
  const i2=filtro.value.dataInicio.replace(/-/g,'');const f2=(filtro.value.dataFim||filtro.value.dataInicio).replace(/-/g,'')
  doc.save(`NC_QualityControl_${i2}_${f2}.pdf`)
}

const enviarEmail = () => {
  const ini=new Date(filtro.value.dataInicio+'T12:00:00').toLocaleDateString('pt-BR')
  const fim=new Date((filtro.value.dataFim||filtro.value.dataInicio)+'T12:00:00').toLocaleDateString('pt-BR')
  const assunto=encodeURIComponent(`Relatório de Não Conformidades — ${ini} a ${fim}`)
  let c=`RELATÓRIO GERAL DE NÃO CONFORMIDADES\n${"=".repeat(50)}\nPeríodo: ${ini} a ${fim}\nTotal NC: ${totalNCs.value} (Empeno: ${ncEmpeno.value.length} | Dimensional: ${ncDimensional.value.length} | Atrito: ${ncAtrito.value.length} | Documento: ${ncTurnoDocumento.value.length} | Restrição: ${ncTurnoRestricao.value.length})\nGerado em: ${new Date().toLocaleString('pt-BR')}\n\n`
  if(ncEmpeno.value.length){c+=`${"=".repeat(50)}\nEMPENO REPROVADO (${ncEmpeno.value.length})\n${"=".repeat(50)}\n`;ncEmpeno.value.forEach((i,x)=>{const lim=i.limitesSnapshot||{};const mmL=minMax(valoresLaterais(i));const mmC=minMax(valoresCentrais(i));const flag=(v,t)=>{if(v===null||v===undefined)return'';const[mn,mx]=t==='lat'?[lim.latMin,lim.latMax]:[lim.centMin,lim.centMax];return(mn!==undefined&&foraRange(v,mn,mx))?'  *** FORA DO RANGE ***':''};c+=`\n[${x+1}] ${fmtData(i)} ${fmtHora(i)}\n    Linha: ${i.linha||'—'} | Produto: ${i.produto||'—'} | Lote: ${(i.lote||'—').toUpperCase()}\n    Formato: ${i.formatoNome||'—'}\n`;if(lim.latMin!==undefined)c+=`    Range Lateral: ${fmtV(lim.latMin)} a ${fmtV(lim.latMax)}\n`;if(lim.centMin!==undefined)c+=`    Range Central: ${fmtV(lim.centMin)} a ${fmtV(lim.centMax)}\n`;if(mmL)c+=`    Lateral Menor: ${fmtV(mmL.min)}${flag(mmL.min,'lat')}\n    Lateral Maior: ${fmtV(mmL.max)}${flag(mmL.max,'lat')}\n`;if(mmC)c+=`    Central Menor: ${fmtV(mmC.min)}${flag(mmC.min,'cent')}\n    Central Maior: ${fmtV(mmC.max)}${flag(mmC.max,'cent')}\n`;c+=`    Tratativa: ${i.tratativa||'PENDENTE'}\n`});c+='\n'}
  if(ncDimensional.value.length){c+=`${"=".repeat(50)}\nDIMENSIONAL REPROVADO (${ncDimensional.value.length})\n${"=".repeat(50)}\n`;ncDimensional.value.forEach((d,x)=>{const lim=d.limitesSnapshot||{};const eMin=d.espessuraDeclarada?d.espessuraDeclarada*0.95:null;c+=`\n[${x+1}] ${fmtData(d)} ${fmtHora(d)}\n    Linha: ${d.linha||'—'} | Produto: ${d.produto||'—'} | Lote: ${(d.lote||'—').toUpperCase()}\n`;if(d.espessuraDeclarada)c+=`    Esp. Declarada: ${fmtV(d.espessuraDeclarada)} mm (tol. ${fmtV(eMin)} a ${fmtV(d.espessuraDeclarada*1.05)})\n`;const ef=[];(d.pecasEspessura||[]).forEach((p,pi)=>{(p.pontos||[]).forEach((pt,pti)=>{if(pt!==null&&pt!==''&&eMin!==null&&foraRange(Number(pt),eMin,d.espessuraDeclarada*1.05))ef.push(`P${pi+1}/Pt${pti+1}:${fmtV(pt)}`)})});if(ef.length)c+=`    Espessura FORA: ${ef.join(' | ')}  *** FORA DO RANGE ***\n`;const tf=[];const esf=[];(d.medicoesTE||[]).forEach((m,mi)=>{if(m.tamanho!==null&&lim.tamanhoMin!==undefined&&foraRange(Number(m.tamanho),lim.tamanhoMin,lim.tamanhoMax))tf.push(`R${mi+1}:${fmtV(m.tamanho)}`);if(m.esquadro!==null&&lim.esquadroMin!==undefined&&foraRange(Number(m.esquadro),lim.esquadroMin,lim.esquadroMax))esf.push(`R${mi+1}:${fmtV(m.esquadro)}`)});if(tf.length)c+=`    Tamanho FORA: ${tf.join(' | ')}  *** FORA DO RANGE ***\n`;if(esf.length)c+=`    Esquadro FORA: ${esf.join(' | ')}  *** FORA DO RANGE ***\n`});c+='\n'}
  if(ncAtrito.value.length){c+=`${"=".repeat(50)}\nATRITO REPROVADO (${ncAtrito.value.length})\n${"=".repeat(50)}\n`;ncAtrito.value.forEach((a,x)=>{const lim=a.limitesSnapshot||{};c+=`\n[${x+1}] ${fmtData(a)} ${fmtHora(a)}\n    Linha: ${a.linha||'—'} | Produto: ${a.produto||'—'} | Lote: ${(a.lote||'—').toUpperCase()}\n    Classe AD: ${a.classeAD||'—'}`;if(lim.min!==undefined)c+=` | Range: ${fmtV(lim.min)} a ${fmtV(lim.max)}`;c+=`\n    Média: ${a.media?.toFixed(3)||'—'}${lim.min!==undefined&&foraRange(a.media,lim.min,lim.max)?'  *** FORA DO RANGE ***':''}\n`});c+='\n'}
  if(ncTurno.value.length){c+=`${"=".repeat(50)}\nRELATÓRIO DE TURNO — LOTES CRÍTICOS (${ncTurno.value.length})\n${"=".repeat(50)}\n`;ncTurno.value.forEach((r,x)=>{c+=`\n[${x+1}] ${r.data} | ${r.responsavel} | Equipe ${r.equipe}\n    Linha: ${r.linha||'—'} | Referência: ${r.referencia||'—'} | Lote: ${(r.lote||'—').toUpperCase()}\n    Situação: ${r.situacao==='vermelha'?'🔴 RESTRIÇÃO/RETIDO':'🟠 LIBERADO COM DOCUMENTO'}\n`;if(r.observacao)c+=`    Justificativa: ${r.observacao}\n`})}
  c+=`\n${"─".repeat(50)}\nQualityControl — Empeno Pro\nGerado em ${new Date().toLocaleString('pt-BR')}`
  window.location.href=`mailto:?subject=${assunto}&body=${encodeURIComponent(c)}`
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>