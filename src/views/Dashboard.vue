<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
    
    <Sidebar />

    <main class="flex-1 overflow-y-auto w-full flex flex-col relative">
      
      <header class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
        <h1 class="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
          <i class="ph-fill ph-chart-pie-slice text-blue-500"></i> Dashboard de Qualidade
        </h1>
        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <div class="font-bold text-gray-800 dark:text-white text-sm">{{ authStore.user?.email || 'A carregar...' }}</div>
            <div class="text-blue-500 uppercase tracking-widest text-[10px] font-bold">{{ authStore.userProfile }}</div>
          </div>

          <!-- Sino de Pendências: apenas admin -->
          <button
            v-if="authStore.userProfile === 'admin'"
            @click="gavetaPendenciasAberta = true"
            class="relative p-2.5 rounded-xl transition-all"
            :class="inspecoesPendentes.length > 0
              ? 'text-orange-500 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 animate-bell'
              : 'text-gray-400 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700'"
            title="Pendências"
          >
            <i class="ph-fill ph-bell text-xl"></i>
            <span
              v-if="inspecoesPendentes.length > 0"
              class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md"
            >{{ inspecoesPendentes.length }}</span>
          </button>

          <button @click="sairDoSistema" class="text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/20 p-2.5 rounded-xl transition-all" title="Terminar Sessão">
            <i class="ph-bold ph-sign-out text-xl"></i>
          </button>
        </div>
      </header>

      <!-- Navegação de Abas -->
      <div class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 sticky top-[73px] z-10">
        <div class="flex gap-1 max-w-7xl mx-auto">
          <button
            @click="abaAtiva = 'graficos'"
            class="flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all"
            :class="abaAtiva === 'graficos'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            <i class="ph-fill ph-chart-pie-slice text-base"></i> Dashboard
          </button>
          <button
            @click="abaAtiva = 'medicoes'"
            class="flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all"
            :class="abaAtiva === 'medicoes'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            <i class="ph-fill ph-list-bullets text-base"></i> Medições
            <span v-if="filtrosAtivos > 0" class="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{{ filtrosAtivos }}</span>
          </button>
        </div>
      </div>

      <div class="p-6 max-w-7xl mx-auto w-full space-y-6">

        <!-- ======================== ABA DASHBOARD ======================== -->
        <div v-show="abaAtiva === 'graficos'" class="space-y-6">

        <!-- Cards de Estatísticas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><i class="ph-fill ph-check-square text-lg"></i> Total de Lotes</div>
            <div class="text-3xl font-bold text-gray-800 dark:text-white">
              <span v-if="carregando" class="animate-pulse text-gray-300">...</span>
              <span v-else>{{ stats.total }}</span>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><i class="ph-fill ph-calendar-star text-lg"></i> Lotes Hoje</div>
            <div class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              <span v-if="carregando" class="animate-pulse text-emerald-200">...</span>
              <span v-else>{{ stats.hoje }}</span>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><i class="ph-fill ph-clock text-lg"></i> Pós Folga</div>
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
              <span v-if="carregando" class="animate-pulse text-blue-200">...</span>
              <span v-else>{{ stats.posFolga }}</span>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div class="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><i class="ph-fill ph-warning-circle text-lg"></i> Reprovados</div>
            <div class="text-3xl font-bold text-red-600 dark:text-red-400">
              <span v-if="carregando" class="animate-pulse text-red-200">...</span>
              <span v-else>{{ stats.reprovados }}</span>
            </div>
          </div>
        </div>

        <!-- Gráficos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h3 class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-6"><i class="ph-fill ph-chart-pie-slice text-blue-500 text-xl"></i> Taxa de Aprovação Geral</h3>
            <div v-if="carregando" class="h-64 flex items-center justify-center text-gray-400 animate-pulse">A calcular dados...</div>
            <div v-else-if="inspecoes.length === 0" class="h-64 flex items-center justify-center text-gray-400">Sem dados suficientes</div>
            <div v-else class="h-64 flex justify-center"><apexchart type="donut" height="100%" :options="graficoAprovacaoOptions" :series="graficoAprovacaoSeries"></apexchart></div>
          </div>
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
            <h3 class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 mb-6"><i class="ph-fill ph-factory text-emerald-500 text-xl"></i> Inspeções por Linha</h3>
            <div v-if="carregando" class="h-64 flex items-center justify-center text-gray-400 animate-pulse">A processar linhas...</div>
            <div v-else-if="inspecoes.length === 0" class="h-64 flex items-center justify-center text-gray-400">Sem dados suficientes</div>
            <div v-else class="h-64"><apexchart type="bar" height="100%" :options="graficoLinhasOptions" :series="graficoLinhasSeries"></apexchart></div>
          </div>
        </div>

        <!-- Gráficos de Picos e Vales -->
        <div>
          <!-- Filtro de formato -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 text-sm">
              <i class="ph-fill ph-chart-line-up text-blue-500"></i> Análise de Range — Picos e Vales
            </h3>
            <div class="flex items-center gap-2">
              <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Formato</label>
              <select
                v-model="filtroFormatoGrafico"
                class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
              >
                <option value="">Todos os formatos</option>
                <option v-for="fmt in formatosParaGrafico" :key="fmt" :value="fmt">{{ fmt }}</option>
              </select>
              <button v-if="filtroFormatoGrafico" @click="filtroFormatoGrafico = ''" class="text-gray-400 hover:text-red-500 transition-colors" title="Limpar filtro">
                <i class="ph-bold ph-x-circle text-lg"></i>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Range Lateral -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <i class="ph-fill ph-chart-line-up text-orange-500 text-xl"></i> Range Lateral (Picos e Vales)
                </h3>
                <span class="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-700">
                  {{ filtroFormatoGrafico ? filtroFormatoGrafico : 'Últimos 20' }}
                </span>
              </div>
              <div v-if="carregando" class="h-72 flex items-center justify-center text-gray-400 animate-pulse">A calcular dados...</div>
              <div v-else-if="dadosRangeLateral.pontos.length === 0" class="h-72 flex flex-col items-center justify-center gap-2 text-gray-400">
                <i class="ph-fill ph-chart-line-up text-3xl"></i>
                <p class="text-sm font-bold">Sem dados para o formato selecionado</p>
              </div>
              <div v-else class="h-72"><apexchart type="line" height="100%" :options="graficoRangeLateralOptions" :series="graficoRangeLateralSeries"></apexchart></div>
            </div>

            <!-- Range Central -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <i class="ph-fill ph-chart-line-up text-emerald-500 text-xl"></i> Range Central (Picos e Vales)
                </h3>
                <span class="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-700">
                  {{ filtroFormatoGrafico ? filtroFormatoGrafico : 'Últimos 20' }}
                </span>
              </div>
              <div v-if="carregando" class="h-72 flex items-center justify-center text-gray-400 animate-pulse">A calcular dados...</div>
              <div v-else-if="dadosRangeCentral.pontos.length === 0" class="h-72 flex flex-col items-center justify-center gap-2 text-gray-400">
                <i class="ph-fill ph-chart-line-up text-3xl"></i>
                <p class="text-sm font-bold">Sem dados para o formato selecionado</p>
              </div>
              <div v-else class="h-72"><apexchart type="line" height="100%" :options="graficoRangeCentralOptions" :series="graficoRangeCentralSeries"></apexchart></div>
            </div>
          </div>
        </div>

        </div>
        <!-- ======================== FIM ABA DASHBOARD ======================== -->

        <!-- ======================== ABA MEDIÇÕES ======================== -->
        <div v-show="abaAtiva === 'medicoes'" class="space-y-6">

        <!-- Sub-abas: Empeno / Dimensional -->
        <div class="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          <button
            @click="subAbaAtiva = 'empeno'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all"
            :class="subAbaAtiva === 'empeno'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            <i class="ph-fill ph-squares-four"></i> Empeno
            <span class="text-[10px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full">{{ inspecoesFiltradas.length }}</span>
          </button>
          <button
            @click="subAbaAtiva = 'dimensional'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all"
            :class="subAbaAtiva === 'dimensional'
              ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            <i class="ph-fill ph-stack"></i> Dimensional
            <span class="text-[10px] font-black bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-full">{{ dimensionaisFiltrados.length }}</span>
          </button>
          <button
            @click="subAbaAtiva = 'atrito'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all"
            :class="subAbaAtiva === 'atrito'
              ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            <i class="ph-fill ph-wave-sine"></i> Atrito
            <span class="text-[10px] font-black bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 px-1.5 py-0.5 rounded-full">{{ atritoFiltrados.length }}</span>
          </button>
          <button
            @click="subAbaAtiva = 'relatorios'"
            class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all"
            :class="subAbaAtiva === 'relatorios'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
          >
            <i class="ph-fill ph-clipboard-text"></i> Rel. Turno
            <span class="text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">{{ relatoriosFiltrados.length }}</span>
          </button>
        </div>

        <!-- ── Barra de Período Global + Filtros por Aba ─────────────────────── -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <!-- Linha 1: Período -->
          <div class="p-4 flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/20">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <i class="ph-fill ph-calendar text-blue-500"></i> Período
            </span>
            <div class="flex gap-1.5 flex-wrap">
              <button v-for="p in periodos" :key="p.valor"
                @click="selecionarPeriodo(p.valor)"
                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                :class="filtroGlobal.periodo === p.valor
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-blue-300'"
              >{{ p.label }}</button>
            </div>
            <!-- Datas customizadas -->
            <div v-if="filtroGlobal.periodo === 'custom'" class="flex items-center gap-2 flex-wrap">
              <input type="date" v-model="filtroGlobal.dataInicio"
                class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span class="text-xs text-gray-400 font-bold">até</span>
              <input type="date" v-model="filtroGlobal.dataFim"
                class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button @click="aplicarPeriodoCustom"
                class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all">
                <i class="ph-bold ph-magnifying-glass"></i> Buscar
              </button>
            </div>
            <!-- Indicador de carregamento -->
            <div v-if="carregandoSec" class="flex items-center gap-1.5 text-xs text-blue-500 font-bold ml-auto">
              <i class="ph-bold ph-spinner animate-spin"></i> Atualizando...
            </div>
            <div v-else-if="ultimaAtualizacao" class="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
              <i class="ph-fill ph-clock"></i>
              {{ ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
              <button @click="recarregarTudo" class="text-blue-500 hover:underline font-bold ml-1 flex items-center gap-1">
                <i class="ph-bold ph-arrows-clockwise"></i> Atualizar
              </button>
            </div>
          </div>

          <!-- Linha 2: Filtros específicos da aba ativa -->

          <!-- Filtros Empeno: já tem gaveta própria, só mostra resumo -->
          <div v-if="subAbaAtiva === 'empeno'" class="px-4 py-3 flex items-center gap-3 flex-wrap">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtros</span>
            <input v-model="filtros.texto" type="text" placeholder="Lote, produto ou inspetor..."
              class="flex-1 min-w-[180px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select v-model="filtros.status" class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos status</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Reprovado">Reprovado</option>
            </select>
            <select v-model="filtros.linha" class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas linhas</option>
              <option v-for="l in linhasUnicas" :key="l" :value="l">{{ l }}</option>
            </select>
            <select v-model="filtros.formato" class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos formatos</option>
              <option v-for="f in formatosUnicos" :key="f" :value="f">{{ f }}</option>
            </select>
            <button v-if="filtrosAtivos > 0" @click="limparFiltros" class="text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
              <i class="ph-bold ph-x"></i> Limpar
            </button>
          </div>

          <!-- Filtros Dimensional -->
          <div v-if="subAbaAtiva === 'dimensional'" class="px-4 py-3 flex items-center gap-3 flex-wrap">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtros</span>
            <input v-model="filtrosDim.texto" type="text" placeholder="Lote, produto ou inspetor..."
              class="flex-1 min-w-[180px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <select v-model="filtrosDim.linha" class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">Todas linhas</option>
              <option v-for="l in linhasUnicasDim" :key="l" :value="l">{{ l }}</option>
            </select>
            <select v-model="filtrosDim.status" class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="">Todos status</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Reprovado">Reprovado</option>
            </select>
            <button v-if="filtrosDim.texto || filtrosDim.linha || filtrosDim.status" @click="filtrosDim = { texto: '', linha: '', status: '' }" class="text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
              <i class="ph-bold ph-x"></i> Limpar
            </button>
          </div>

          <!-- Filtros Atrito -->
          <div v-if="subAbaAtiva === 'atrito'" class="px-4 py-3 flex items-center gap-3 flex-wrap">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtros</span>
            <input v-model="filtrosAt.texto" type="text" placeholder="Lote, produto ou inspetor..."
              class="flex-1 min-w-[180px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <select v-model="filtrosAt.linha" class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Todas linhas</option>
              <option v-for="l in linhasUnicasAt" :key="l" :value="l">{{ l }}</option>
            </select>
            <select v-model="filtrosAt.classeAD" class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Todas classes</option>
              <option v-for="c in ['AD','AD2','AD3','AD4','AD4+']" :key="c" :value="c">{{ c }}</option>
            </select>
            <select v-model="filtrosAt.status" class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Todos status</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Reprovado">Reprovado</option>
            </select>
            <button v-if="filtrosAt.texto || filtrosAt.linha || filtrosAt.classeAD || filtrosAt.status" @click="filtrosAt = { texto: '', linha: '', classeAD: '', status: '' }" class="text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
              <i class="ph-bold ph-x"></i> Limpar
            </button>
          </div>

          <!-- Filtros Relatórios -->
          <div v-if="subAbaAtiva === 'relatorios'" class="px-4 py-3 flex items-center gap-3 flex-wrap">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Filtros</span>
            <input v-model="filtrosRel.texto" type="text" placeholder="Responsável ou produto..."
              class="flex-1 min-w-[180px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select v-model="filtrosRel.equipe" class="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Todas equipes</option>
              <option v-for="e in ['1','2','3','4','ADM']" :key="e" :value="e">Equipe {{ e }}</option>
            </select>
            <button v-if="filtrosRel.texto || filtrosRel.equipe" @click="filtrosRel = { texto: '', equipe: '' }" class="text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
              <i class="ph-bold ph-x"></i> Limpar
            </button>
          </div>
        </div>

        <!-- Tabela Empeno -->
        <div v-show="subAbaAtiva === 'empeno'" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          
          <!-- Cabeçalho da tabela com botão de filtros -->
          <div class="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/20">
            <div class="flex items-center gap-3">
              <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ph-fill ph-list-bullets text-blue-500 text-xl"></i>
                <span v-if="filtrosAtivos === 0">Últimas 24 Horas</span>
                <span v-else>Resultados Filtrados</span>
              </h3>
              <!-- Badge contador -->
              <span class="text-xs font-bold px-2.5 py-1 rounded-full"
                :class="filtrosAtivos > 0
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'"
              >
                {{ inspecoesFiltradas.length }} resultado{{ inspecoesFiltradas.length !== 1 ? 's' : '' }}
              </span>
            </div>

            <!-- Botão de abrir filtros + Exportação -->
            <div class="flex items-center gap-2">
              <!-- Exportação -->
              <div class="flex items-center gap-1">
                <button @click="exportarExcel(inspecoesFiltradas, 'empeno', filtroGlobal)"
                  :disabled="!inspecoesFiltradas.length"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <i class="ph-bold ph-file-xls text-base"></i> Excel
                </button>
                <button @click="exportarPDF(inspecoesFiltradas, 'empeno', filtroGlobal)"
                  :disabled="!inspecoesFiltradas.length"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <i class="ph-bold ph-file-pdf text-base"></i> PDF
                </button>
              </div>
              <!-- Botão de abrir filtros avançados -->
              <button
                @click="gavetaAberta = true"
                class="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                :class="filtrosAtivos > 0
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'"
              >
                <i class="ph-bold ph-funnel text-base"></i>
                Filtros
                <span
                  v-if="filtrosAtivos > 0"
                  class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow"
                >{{ filtrosAtivos }}</span>
              </button>
            </div>
          </div>

          <!-- Tags de filtros ativos -->
          <div v-if="filtrosAtivos > 0" class="px-5 py-3 flex flex-wrap gap-2 border-b border-gray-100 dark:border-slate-800 bg-blue-50/30 dark:bg-blue-900/5">
            <span v-if="filtros.texto" class="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
              <i class="ph-bold ph-magnifying-glass"></i> "{{ filtros.texto }}"
              <button @click="filtros.texto = ''" class="ml-1 hover:text-red-500 transition-colors"><i class="ph-bold ph-x text-xs"></i></button>
            </span>
            <span v-if="filtros.status" class="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
              <i class="ph-bold ph-check-circle"></i> {{ filtros.status }}
              <button @click="filtros.status = ''" class="ml-1 hover:text-red-500 transition-colors"><i class="ph-bold ph-x text-xs"></i></button>
            </span>
            <span v-if="filtros.linha" class="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
              <i class="ph-bold ph-factory"></i> {{ filtros.linha }}
              <button @click="filtros.linha = ''" class="ml-1 hover:text-red-500 transition-colors"><i class="ph-bold ph-x text-xs"></i></button>
            </span>
            <span v-if="filtros.posFolga" class="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
              <i class="ph-bold ph-clock"></i> Pós Folga: {{ filtros.posFolga }}
              <button @click="filtros.posFolga = ''" class="ml-1 hover:text-red-500 transition-colors"><i class="ph-bold ph-x text-xs"></i></button>
            </span>
            <span v-if="filtros.formato" class="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
              <i class="ph-bold ph-tag"></i> {{ filtros.formato }}
              <button @click="filtros.formato = ''" class="ml-1 hover:text-red-500 transition-colors"><i class="ph-bold ph-x text-xs"></i></button>
            </span>
            <button @click="limparFiltros" class="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-full transition-all border border-red-200 dark:border-red-800/40">
              <i class="ph-bold ph-x-circle"></i> Limpar tudo
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th class="p-4 font-bold">Data/Hora</th>
                  <th class="p-4 font-bold">Status</th>
                  <th class="p-4 font-bold">Inspetor</th>
                  <th class="p-4 font-bold">Linha & Prod.</th>
                  <th class="p-4 font-bold">Lote</th>
                  <th class="p-4 font-bold text-center">Detalhes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                <tr v-if="carregando"><td colspan="6" class="p-8 text-center text-gray-400 animate-pulse">A sincronizar com a fábrica...</td></tr>
                <tr v-else-if="inspecoesFiltradas.length === 0">
                  <td colspan="6" class="p-12 text-center">
                    <div class="flex flex-col items-center gap-2 text-gray-400">
                      <i class="ph-fill ph-magnifying-glass text-4xl"></i>
                      <p v-if="filtrosAtivos === 0" class="font-bold text-gray-500 dark:text-gray-400">Nenhuma inspeção nas últimas 24 horas</p>
                      <p v-else class="font-bold text-gray-500 dark:text-gray-400">Nenhuma inspeção encontrada</p>
                      <p v-if="filtrosAtivos > 0" class="text-xs">Tenta ajustar ou <button @click="limparFiltros" class="text-blue-500 hover:underline font-bold">limpar os filtros</button></p>
                      <p v-else class="text-xs">Usa os <button @click="gavetaAberta = true" class="text-blue-500 hover:underline font-bold">filtros avançados</button> para pesquisar períodos anteriores</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="rel in inspecoesFiltradas" :key="rel.id" class="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 group transition-colors">
                  <td class="p-4 text-gray-600 dark:text-gray-300">
                    <div class="font-bold">{{ formatarData(rel) }}</div>
                    <div class="text-xs text-gray-400">{{ formatarHora(rel) }}</div>
                  </td>
                  <td class="p-4">
                    <div class="flex flex-col gap-1.5">
                      <span v-if="rel.resultado === 'Aprovado'" class="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"><i class="ph-bold ph-check"></i> Aprovado</span>
                      <span v-else class="text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"><i class="ph-bold ph-x"></i> Reprovado</span>
                      <span v-if="rel.posFolga === 'Sim'" class="text-violet-700 dark:text-violet-300 font-bold bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/30 px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1">
                        <i class="ph-fill ph-moon"></i> Pós Folga
                      </span>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="font-bold text-gray-700 dark:text-gray-300">{{ rel.inspetor || 'N/A' }}</div>
                    <span v-if="!rel.tratativa && (rel.posFolga === 'Sim' || rel.resultado === 'Reprovado')" class="text-orange-500 dark:text-orange-400 text-[10px] font-bold inline-flex items-center gap-1 mt-0.5">
                      <i class="ph-fill ph-warning"></i> Tratativa pendente
                    </span>
                    <span v-else-if="rel.tratativa" class="text-teal-600 dark:text-teal-400 text-[10px] font-bold inline-flex items-center gap-1 mt-0.5">
                      <i class="ph-fill ph-check-circle"></i> {{ rel.tratativa }}
                    </span>
                  </td>
                  <td class="p-4">
                    <div class="font-bold">{{ rel.produto || 'N/A' }} <span class="text-xs font-normal text-gray-400">({{ rel.formatoNome || 'N/A' }})</span></div>
                    <div class="text-xs text-blue-600 font-bold mt-0.5">{{ rel.linha || 'N/A' }}</div>
                  </td>
                  <td class="p-4"><span class="font-mono bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-1 rounded font-bold text-xs">{{ rel.lote || 'N/A' }}</span></td>
                  <td class="p-4 text-center">
                    <button @click="abrirDetalhes(rel)" class="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white p-2 rounded-lg transition-colors"><i class="ph-bold ph-eye text-lg"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Tabela Dimensional -->
        <div v-show="subAbaAtiva === 'dimensional'" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div class="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-violet-50/50 dark:bg-violet-900/5">
            <div class="flex items-center gap-3">
              <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ph-fill ph-stack text-violet-500 text-xl"></i> Inspeções Dimensionais
              </h3>
              <span class="text-xs font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full">
                {{ dimensionaisFiltrados.length }} resultado{{ dimensionaisFiltrados.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button @click="exportarExcel(dimensionaisFiltrados, 'dimensional', filtroGlobal)" :disabled="!dimensionaisFiltrados.length"
                class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <i class="ph-bold ph-file-xls text-base"></i> Excel
              </button>
              <button @click="exportarPDF(dimensionaisFiltrados, 'dimensional', filtroGlobal)" :disabled="!dimensionaisFiltrados.length"
                class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <i class="ph-bold ph-file-pdf text-base"></i> PDF
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th class="p-4 font-bold">Data/Hora</th>
                  <th class="p-4 font-bold">Status</th>
                  <th class="p-4 font-bold">Inspetor</th>
                  <th class="p-4 font-bold">Linha & Prod.</th>
                  <th class="p-4 font-bold">Lote</th>
                  <th class="p-4 font-bold text-center">Espessura</th>
                  <th class="p-4 font-bold text-center">Detalhes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                <tr v-if="carregando"><td colspan="7" class="p-8 text-center text-gray-400 animate-pulse">A sincronizar dados dimensionais...</td></tr>
                <tr v-else-if="dimensionaisFiltrados.length === 0">
                  <td colspan="7" class="p-12 text-center">
                    <div class="flex flex-col items-center gap-2 text-gray-400">
                      <i class="ph-fill ph-stack text-4xl"></i>
                      <p class="font-bold text-gray-500">Nenhuma inspeção dimensional nas últimas 24 horas</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="dim in dimensionaisFiltrados" :key="dim.id" class="hover:bg-violet-50/30 dark:hover:bg-violet-900/5 transition-colors">
                  <td class="p-4 text-gray-600 dark:text-gray-300">
                    <div class="font-bold">{{ formatarData(dim) }}</div>
                    <div class="text-xs text-gray-400">{{ formatarHora(dim) }}</div>
                  </td>
                  <td class="p-4">
                    <span v-if="dim.resultado === 'Aprovado'" class="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"><i class="ph-bold ph-check"></i> Aprovado</span>
                    <span v-else class="text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"><i class="ph-bold ph-x"></i> Reprovado</span>
                  </td>
                  <td class="p-4 font-bold text-gray-700 dark:text-gray-300">{{ dim.inspetor || 'N/A' }}</td>
                  <td class="p-4">
                    <div class="font-bold">{{ dim.produto || 'N/A' }} <span class="text-xs font-normal text-gray-400">({{ dim.formatoNome || 'N/A' }})</span></div>
                    <div class="text-xs text-violet-600 font-bold mt-0.5">{{ dim.linha || 'N/A' }}</div>
                  </td>
                  <td class="p-4"><span class="font-mono bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-1 rounded font-bold text-xs">{{ dim.lote || 'N/A' }}</span></td>
                  <td class="p-4 text-center">
                    <span class="font-bold text-violet-700 dark:text-violet-300 text-sm">{{ dim.espessuraDeclarada ? dim.espessuraDeclarada + ' mm' : 'N/A' }}</span>
                  </td>
                  <td class="p-4 text-center">
                    <button @click="abrirDetalhesDimensional(dim)" class="text-violet-600 hover:text-white bg-violet-50 hover:bg-violet-600 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-600 dark:hover:text-white p-2 rounded-lg transition-colors">
                      <i class="ph-bold ph-eye text-lg"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabela Atrito -->
        <div v-show="subAbaAtiva === 'atrito'" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div class="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-teal-50/50 dark:bg-teal-900/5">
            <div class="flex items-center gap-3">
              <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ph-fill ph-wave-sine text-teal-500 text-xl"></i> Coeficiente de Atrito
              </h3>
              <span class="text-xs font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-full">
                {{ atritoFiltrados.length }} resultado{{ atritoFiltrados.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <button @click="exportarExcel(atritoFiltrados, 'atrito', filtroGlobal)" :disabled="!atritoFiltrados.length"
                class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <i class="ph-bold ph-file-xls text-base"></i> Excel
              </button>
              <button @click="exportarPDF(atritoFiltrados, 'atrito', filtroGlobal)" :disabled="!atritoFiltrados.length"
                class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <i class="ph-bold ph-file-pdf text-base"></i> PDF
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th class="p-4 font-bold">Data/Hora</th>
                  <th class="p-4 font-bold">Status</th>
                  <th class="p-4 font-bold">Inspetor</th>
                  <th class="p-4 font-bold">Linha & Prod.</th>
                  <th class="p-4 font-bold">Lote</th>
                  <th class="p-4 font-bold text-center">Classe AD</th>
                  <th class="p-4 font-bold text-center">Média</th>
                  <th class="p-4 font-bold text-center">Detalhes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                <tr v-if="carregando"><td colspan="7" class="p-8 text-center text-gray-400 animate-pulse">A sincronizar dados de atrito...</td></tr>
                <tr v-else-if="atritoFiltrados.length === 0">
                  <td colspan="7" class="p-12 text-center">
                    <div class="flex flex-col items-center gap-2 text-gray-400">
                      <i class="ph-fill ph-wave-sine text-4xl"></i>
                      <p class="font-bold text-gray-500">Nenhuma medição de atrito nas últimas 24 horas</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="at in atritoFiltrados" :key="at.id" class="hover:bg-teal-50/30 dark:hover:bg-teal-900/5 transition-colors">
                  <td class="p-4 text-gray-600 dark:text-gray-300">
                    <div class="font-bold">{{ formatarData(at) }}</div>
                    <div class="text-xs text-gray-400">{{ formatarHora(at) }}</div>
                  </td>
                  <td class="p-4">
                    <span v-if="at.resultado === 'Aprovado'" class="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"><i class="ph-bold ph-check"></i> Aprovado</span>
                    <span v-else class="text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 px-3 py-1 rounded-lg text-xs inline-flex items-center gap-1"><i class="ph-bold ph-x"></i> Reprovado</span>
                  </td>
                  <td class="p-4 font-bold text-gray-700 dark:text-gray-300">{{ at.inspetor || 'N/A' }}</td>
                  <td class="p-4">
                    <div class="font-bold">{{ at.produto || 'N/A' }}</div>
                    <div class="text-xs text-teal-600 font-bold mt-0.5">{{ at.linha || 'N/A' }}</div>
                  </td>
                  <td class="p-4"><span class="font-mono bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-1 rounded font-bold text-xs">{{ at.lote || 'N/A' }}</span></td>
                  <td class="p-4 text-center">
                    <span v-if="at.classeAD" class="text-xs font-black px-2.5 py-1 rounded-full border" :class="corClasseAD(at.classeAD)">
                      {{ at.classeAD }}
                    </span>
                    <span v-else class="text-gray-400 text-xs">—</span>
                  </td>
                  <td class="p-4 text-center">
                    <span class="font-bold text-lg"
                      :class="at.resultado === 'Aprovado' ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'"
                    >{{ at.media?.toFixed(3) ?? 'N/A' }}</span>
                  </td>
                  <td class="p-4 text-center">
                    <button @click="abrirDetalhesAtrito(at)" class="text-teal-600 hover:text-white bg-teal-50 hover:bg-teal-600 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-600 dark:hover:text-white p-2 rounded-lg transition-colors">
                      <i class="ph-bold ph-eye text-lg"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabela Relatórios de Turno -->
        <div v-show="subAbaAtiva === 'relatorios'" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div class="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/5">
            <div class="flex items-center gap-3">
              <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ph-fill ph-clipboard-text text-indigo-500 text-xl"></i> Relatórios Finais de Turno
              </h3>
              <span class="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full">
                {{ relatoriosFiltrados.length }} resultado{{ relatoriosFiltrados.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1">
                <button @click="exportarExcel(relatoriosFiltrados, 'relatorios', filtroGlobal)" :disabled="!relatoriosFiltrados.length"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <i class="ph-bold ph-file-xls text-base"></i> Excel
                </button>
                <button @click="exportarPDF(relatoriosFiltrados, 'relatorios', filtroGlobal)" :disabled="!relatoriosFiltrados.length"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <i class="ph-bold ph-file-pdf text-base"></i> PDF
                </button>
              </div>
              <router-link v-if="authStore.userProfile !== 'analista'" to="/relatorio-turno"
                class="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-all">
                <i class="ph-bold ph-plus-circle"></i> Novo Relatório
              </router-link>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th class="p-4 font-bold">Data</th>
                  <th class="p-4 font-bold">Responsável</th>
                  <th class="p-4 font-bold">Equipe / Turno</th>
                  <th class="p-4 font-bold text-center">Linhas</th>
                  <th class="p-4 font-bold">Situações</th>
                  <th class="p-4 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                <tr v-if="carregando"><td colspan="6" class="p-8 text-center text-gray-400 animate-pulse">A carregar relatórios...</td></tr>
                <tr v-else-if="relatoriosFiltrados.length === 0">
                  <td colspan="6" class="p-12 text-center">
                    <div class="flex flex-col items-center gap-2 text-gray-400">
                      <i class="ph-fill ph-clipboard-text text-4xl"></i>
                      <p class="font-bold text-gray-500">Nenhum relatório nos últimos 7 dias</p>
                      <router-link to="/relatorio-turno" class="text-indigo-500 hover:underline text-xs font-bold">Criar novo relatório</router-link>
                    </div>
                  </td>
                </tr>
                <tr v-for="rel in relatoriosFiltrados" :key="rel.id" class="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/5 transition-colors">
                  <td class="p-4">
                    <div class="font-bold text-gray-800 dark:text-white">{{ rel.data }}</div>
                    <div class="text-xs text-gray-400">{{ formatarHora(rel) }}</div>
                  </td>
                  <td class="p-4 font-bold text-gray-700 dark:text-gray-300">{{ rel.responsavel }}</td>
                  <td class="p-4">
                    <span v-if="rel.equipe" class="font-bold text-gray-700 dark:text-gray-300">Eq. {{ rel.equipe }}</span>
                    <span v-if="rel.turno" class="ml-2 text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold border border-indigo-100 dark:border-indigo-800/30">{{ rel.turno }}</span>
                  </td>
                  <td class="p-4 text-center font-bold text-gray-700 dark:text-gray-300">{{ rel.linhas?.length ?? 0 }}</td>
                  <td class="p-4">
                    <div class="flex flex-wrap gap-0.5">
                      <template v-for="l in (rel.linhas || [])" :key="l.linha">
                        <span v-for="lt in (l.lotes || [])" :key="lt.lote + l.linha"
                          :title="l.linha + ' · ' + lt.lote + ': ' + labelSituacaoDash(lt.situacao)"
                          class="text-base cursor-default">{{ emojiSituacaoDash(lt.situacao) }}</span>
                      </template>
                    </div>
                  </td>
                  <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="abrirModalRelatorio(rel)"
                        class="text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white p-2 rounded-lg transition-colors">
                        <i class="ph-bold ph-eye text-lg"></i>
                      </button>
                      <button @click="copiarRelatorio(rel)"
                        class="text-gray-500 hover:text-white bg-gray-50 hover:bg-gray-600 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-600 p-2 rounded-lg transition-colors" title="Copiar texto">
                        <i class="ph-bold ph-copy text-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        </div>
        <!-- ======================== FIM ABA MEDIÇÕES ======================== -->

      </div>

      <!-- ===================== MODAL RELATÓRIO TURNO ===================== -->
      <div v-if="modalRelatorioAberto && relatorioSelecionado" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
          <div class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/10">
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ph-bold ph-clipboard-text text-indigo-500"></i> Relatório Final de Turno
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                {{ relatorioSelecionado.data }} · {{ relatorioSelecionado.responsavel }}
                <span v-if="relatorioSelecionado.equipe" class="ml-2 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">Eq. {{ relatorioSelecionado.equipe }}</span>
              </p>
            </div>
            <button @click="fecharModalRelatorio" class="text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
              <i class="ph-bold ph-x text-xl"></i>
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-4">
            <!-- Linhas com lotes -->
            <div v-for="(l, idx) in relatorioSelecionado.linhas" :key="idx"
              class="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden"
            >
              <!-- Cabeçalho da linha -->
              <div class="px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2">
                <i class="ph-fill ph-factory text-indigo-500 text-sm"></i>
                <span class="font-bold text-gray-800 dark:text-white text-sm">Linha {{ l.linha }}</span>
                <span class="text-gray-500 dark:text-gray-400 text-sm">— {{ l.referencia }}</span>
              </div>

              <!-- Lotes -->
              <div class="divide-y divide-gray-100 dark:divide-slate-800">
                <div v-for="(lt, lotIdx) in (l.lotes || [])" :key="lotIdx"
                  class="px-4 py-3 flex items-start gap-3"
                >
                  <span class="text-lg mt-0.5 shrink-0">{{ emojiSituacaoDash(lt.situacao) }}</span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-mono font-bold text-sm text-gray-800 dark:text-white">{{ lt.lote || '(sem nº)' }}</span>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        :class="bgLabelSituacao(lt.situacao)"
                      >{{ labelSituacaoDash(lt.situacao) }}</span>
                    </div>
                    <p v-if="lt.observacao" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ lt.observacao }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Texto exportável -->
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Texto para copiar</p>
              <pre class="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 max-h-48 overflow-y-auto">{{ relatorioSelecionado.textoExportado }}</pre>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 flex gap-3 justify-end">
            <button @click="copiarRelatorio(relatorioSelecionado)"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-200 dark:border-indigo-800/40 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all">
              <i class="ph-bold ph-copy"></i> Copiar
            </button>
            <button @click="fecharModalRelatorio"
              class="px-4 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-all">
              Fechar
            </button>
          </div>
        </div>
      </div>

      <!-- ===================== MODAL DIMENSIONAL ===================== -->
      <div v-if="modalAtritoAberto && atritoSelecionado" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">

          <!-- Cabeçalho -->
          <div class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-teal-50 dark:bg-teal-900/10">
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ph-bold ph-wave-sine text-teal-500"></i> Coeficiente de Atrito
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                Lote: <strong class="text-gray-800 dark:text-gray-200">{{ atritoSelecionado.lote }}</strong>
                · {{ atritoSelecionado.produto }}
                · <span class="text-teal-600 font-bold">{{ atritoSelecionado.linha }}</span>
                <span v-if="atritoSelecionado.classeAD" class="ml-2 text-xs font-black px-2 py-0.5 rounded-full border" :class="corClasseAD(atritoSelecionado.classeAD)">{{ atritoSelecionado.classeAD }}</span>
              </p>
            </div>
            <button @click="fecharModalAtrito" class="text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
              <i class="ph-bold ph-x text-xl"></i>
            </button>
          </div>

          <!-- Corpo -->
          <div class="p-6 space-y-5 overflow-y-auto">

            <!-- Info geral -->
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Inspetor</span>
                <span class="font-bold text-gray-800 dark:text-white text-sm">{{ atritoSelecionado.inspetor }}</span>
              </div>
              <div class="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Data/Hora</span>
                <span class="font-bold text-gray-800 dark:text-white text-sm">{{ formatarData(atritoSelecionado) }}</span>
                <span class="text-xs text-gray-400 block">{{ formatarHora(atritoSelecionado) }}</span>
              </div>
              <div class="p-3 rounded-xl border text-center"
                :class="atritoSelecionado.resultado === 'Aprovado'
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40'"
              >
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Resultado</span>
                <span class="font-bold text-sm" :class="atritoSelecionado.resultado === 'Aprovado' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">
                  {{ atritoSelecionado.resultado }}
                </span>
              </div>
            </div>

            <!-- Limites usados -->
            <div v-if="atritoSelecionado.limitesSnapshot" class="bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/30 p-4 rounded-xl flex justify-around">
              <div class="text-center">
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Limite Mínimo</span>
                <span class="font-bold text-teal-700 dark:text-teal-400 text-lg">{{ atritoSelecionado.limitesSnapshot.atritoMin }}</span>
              </div>
              <div class="w-px bg-teal-200 dark:bg-teal-800/50"></div>
              <div class="text-center">
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Limite Máximo</span>
                <span class="font-bold text-teal-700 dark:text-teal-400 text-lg">{{ atritoSelecionado.limitesSnapshot.atritoMax }}</span>
              </div>
            </div>

            <!-- As 3 medidas + média -->
            <div>
              <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Medidas Inseridas</h3>
              <div class="grid grid-cols-3 gap-3 mb-4">
                <div v-for="(m, idx) in atritoSelecionado.medidas" :key="idx" class="text-center border-2 rounded-xl p-3"
                  :class="atritoSelecionado.limitesSnapshot && m !== null
                    ? (m >= atritoSelecionado.limitesSnapshot.atritoMin && m <= atritoSelecionado.limitesSnapshot.atritoMax)
                      ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/10'
                      : 'border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50'"
                >
                  <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Medida {{ idx + 1 }}</span>
                  <span class="text-xl font-black"
                    :class="atritoSelecionado.limitesSnapshot && m !== null
                      ? (m >= atritoSelecionado.limitesSnapshot.atritoMin && m <= atritoSelecionado.limitesSnapshot.atritoMax)
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-red-700 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300'"
                  >{{ m?.toFixed(3) ?? '—' }}</span>
                </div>
              </div>

              <!-- Média em destaque -->
              <div class="rounded-xl p-4 text-center border-2"
                :class="atritoSelecionado.resultado === 'Aprovado'
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700'"
              >
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Média Final</span>
                <span class="text-4xl font-black"
                  :class="atritoSelecionado.resultado === 'Aprovado' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
                >{{ atritoSelecionado.media?.toFixed(3) }}</span>
              </div>
            </div>

            <!-- Observações -->
            <div v-if="atritoSelecionado.observacoes" class="bg-gray-50 dark:bg-slate-800/30 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
              <span class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Observações</span>
              <p class="text-sm text-gray-700 dark:text-gray-300 italic">"{{ atritoSelecionado.observacoes }}"</p>
            </div>

          </div>

          <div class="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 flex justify-end">
            <button @click="fecharModalAtrito" class="px-5 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-all">
              Fechar
            </button>
          </div>
        </div>
      </div>
      <div v-if="modalDimensionalAberto && dimensionalSelecionada" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">

          <!-- Cabeçalho -->
          <div class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-violet-50 dark:bg-violet-900/10">
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <i class="ph-bold ph-stack text-violet-500"></i> Inspeção Dimensional
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                Lote: <strong class="text-gray-800 dark:text-gray-200">{{ dimensionalSelecionada.lote }}</strong>
                · Produto: {{ dimensionalSelecionada.produto }}
                · Linha: <span class="text-violet-600 font-bold">{{ dimensionalSelecionada.linha }}</span>
              </p>
            </div>
            <button @click="fecharModalDimensional" class="text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
              <i class="ph-bold ph-x text-xl"></i>
            </button>
          </div>

          <!-- Corpo -->
          <div class="p-6 overflow-y-auto space-y-6">

            <!-- Info geral -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Formato</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ dimensionalSelecionada.formatoNome }}</span>
              </div>
              <div class="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Inspetor</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ dimensionalSelecionada.inspetor }}</span>
              </div>
              <div class="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Data / Hora</span>
                <span class="font-bold text-gray-800 dark:text-white">{{ formatarData(dimensionalSelecionada) }} {{ formatarHora(dimensionalSelecionada) }}</span>
              </div>
              <div class="p-3 rounded-xl border" :class="dimensionalSelecionada.resultado === 'Aprovado' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/40' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40'">
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Resultado</span>
                <span class="font-bold" :class="dimensionalSelecionada.resultado === 'Aprovado' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'">
                  {{ dimensionalSelecionada.resultado }}
                </span>
              </div>
            </div>

            <!-- Limites do formato -->
            <div v-if="dimensionalSelecionada.limitesSnapshot" class="bg-orange-50/50 dark:bg-orange-900/5 border border-orange-100 dark:border-orange-800/30 p-4 rounded-xl flex flex-wrap gap-6">
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Espessura Declarada</span>
                <span class="font-bold text-violet-700 dark:text-violet-400 text-lg">{{ dimensionalSelecionada.espessuraDeclarada }} mm</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tolerância Espessura</span>
                <span class="font-bold text-gray-700 dark:text-gray-300">{{ (dimensionalSelecionada.espessuraDeclarada * 0.95).toFixed(2) }} a {{ (dimensionalSelecionada.espessuraDeclarada * 1.05).toFixed(2) }} mm <span class="text-xs font-normal text-gray-400">(±5%)</span></span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tolerância Tamanho</span>
                <span class="font-bold text-gray-700 dark:text-gray-300">{{ dimensionalSelecionada.limitesSnapshot.tamanhoMin }} a {{ dimensionalSelecionada.limitesSnapshot.tamanhoMax }} mm</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tolerância Esquadro</span>
                <span class="font-bold text-gray-700 dark:text-gray-300">{{ dimensionalSelecionada.limitesSnapshot.esquadroMin }} a {{ dimensionalSelecionada.limitesSnapshot.esquadroMax }} mm</span>
              </div>
            </div>

            <!-- Espessura por peça -->
            <div v-if="dimensionalSelecionada.pecasEspessura?.length">
              <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i class="ph-fill ph-stack text-violet-500"></i> Espessura por Peça
              </h3>
              <div class="space-y-4">
                <div v-for="(peca, idx) in dimensionalSelecionada.pecasEspessura" :key="idx" class="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <!-- Header da peça -->
                  <div class="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-slate-700">
                    <div class="flex items-center gap-4">
                      <span class="font-bold text-violet-600 dark:text-violet-400">Peça {{ idx + 1 }}</span>
                      <span v-if="peca.prensa" class="text-xs text-gray-500 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded">Prensa {{ peca.prensa }}</span>
                      <span v-if="peca.cavidade" class="text-xs text-gray-500 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded">Cav. {{ peca.cavidade }}</span>
                    </div>
                    <!-- Média -->
                    <div v-if="mediaEspessura(peca) > 0">
                      <span class="text-xs font-bold px-2.5 py-1 rounded-lg"
                        :class="validaEspessuraDim(mediaEspessura(peca), dimensionalSelecionada.espessuraDeclarada)
                          ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'"
                      >
                        Média: {{ mediaEspessura(peca).toFixed(2) }} mm
                      </span>
                    </div>
                  </div>
                  <!-- Pontos -->
                  <div class="p-4">
                    <div class="flex flex-wrap gap-2">
                      <div v-for="(pt, pIdx) in peca.pontos" :key="pIdx" class="text-center">
                        <div class="text-[10px] text-gray-400 font-bold mb-1">P{{ pIdx + 1 }}</div>
                        <span class="w-16 h-9 flex items-center justify-center rounded-lg text-sm font-bold border"
                          :class="pt !== null && pt !== '' && dimensionalSelecionada.espessuraDeclarada
                            ? validaEspessuraDim(Number(pt), dimensionalSelecionada.espessuraDeclarada)
                              ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400'
                            : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500'"
                        >
                          {{ pt !== null && pt !== '' ? pt : '-' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tamanho e Esquadro -->
            <div v-if="dimensionalSelecionada.medicoesTE?.length">
              <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i class="ph-fill ph-ruler text-orange-500"></i> Tamanho e Esquadro
              </h3>
              <div class="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
                <table class="w-full text-center text-sm">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th class="p-3 font-bold text-left border-r border-gray-200 dark:border-slate-700">Medição</th>
                      <th class="p-3 font-bold text-left hidden sm:table-cell border-r border-gray-200 dark:border-slate-700">Retífica</th>
                      <th class="p-3 font-bold text-orange-600 dark:text-orange-400">Tamanho (mm)</th>
                      <th class="p-3 font-bold text-amber-600 dark:text-amber-400">Esquadro (mm)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    <tr v-for="(med, idx) in dimensionalSelecionada.medicoesTE" :key="idx" class="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                      <td class="p-3 font-bold text-gray-700 dark:text-gray-300 text-left border-r border-gray-100 dark:border-slate-800">#{{ idx + 1 }}</td>
                      <td class="p-3 text-gray-500 text-left hidden sm:table-cell border-r border-gray-100 dark:border-slate-800">{{ med.retifica || '—' }}</td>
                      <td class="p-3 font-bold"
                        :class="med.tamanho !== null && med.tamanho !== '' && dimensionalSelecionada.limitesSnapshot
                          ? (Number(med.tamanho) >= dimensionalSelecionada.limitesSnapshot.tamanhoMin && Number(med.tamanho) <= dimensionalSelecionada.limitesSnapshot.tamanhoMax)
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10'
                          : 'text-gray-500'"
                      >{{ med.tamanho ?? '—' }}</td>
                      <td class="p-3 font-bold"
                        :class="med.esquadro !== null && med.esquadro !== '' && dimensionalSelecionada.limitesSnapshot
                          ? (Number(med.esquadro) >= dimensionalSelecionada.limitesSnapshot.esquadroMin && Number(med.esquadro) <= dimensionalSelecionada.limitesSnapshot.esquadroMax)
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10'
                          : 'text-gray-500'"
                      >{{ med.esquadro ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Observações -->
            <div v-if="dimensionalSelecionada.observacoes" class="bg-gray-50 dark:bg-slate-800/30 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
              <span class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Observações</span>
              <p class="text-sm text-gray-700 dark:text-gray-300 italic">"{{ dimensionalSelecionada.observacoes }}"</p>
            </div>

          </div>

          <!-- Rodapé -->
          <div class="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 flex justify-end">
            <button @click="fecharModalDimensional" class="px-5 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-all">
              Fechar
            </button>
          </div>
        </div>
      </div>
      <!-- Overlay -->
      <Transition name="fade">
        <div
          v-if="gavetaAberta"
          @click="gavetaAberta = false"
          class="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm"
        ></div>
      </Transition>

      <!-- Gaveta -->
      <Transition name="slide">
        <div
          v-if="gavetaAberta"
          class="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-slate-800"
        >
          <!-- Cabeçalho da gaveta -->
          <div class="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
            <div class="flex items-center gap-2">
              <i class="ph-fill ph-funnel text-blue-500 text-xl"></i>
              <h2 class="font-bold text-gray-800 dark:text-white text-lg">Filtros Avançados</h2>
              <span v-if="filtrosAtivos > 0" class="text-xs font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">{{ filtrosAtivos }}</span>
            </div>
            <button @click="gavetaAberta = false" class="text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 p-2 rounded-full border border-gray-200 dark:border-slate-700 transition-colors">
              <i class="ph-bold ph-x text-lg"></i>
            </button>
          </div>

          <!-- Corpo da gaveta (scrollável) -->
          <div class="flex-1 overflow-y-auto p-5 space-y-6">

            <!-- Busca por texto -->
            <div>
              <label class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <i class="ph-bold ph-magnifying-glass text-blue-500"></i> Busca Geral
              </label>
              <div class="relative">
                <input
                  v-model="filtros.texto"
                  type="text"
                  placeholder="Lote, produto ou inspetor..."
                  class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <i class="ph-bold ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <button v-if="filtros.texto" @click="filtros.texto = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors">
                  <i class="ph-bold ph-x text-sm"></i>
                </button>
              </div>
            </div>

            <!-- Intervalo de datas — controlado pelo período global acima -->
            <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl p-3 flex items-start gap-2">
              <i class="ph-fill ph-info text-blue-500 text-base mt-0.5 shrink-0"></i>
              <p class="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                O período de datas é controlado pela barra de <strong>Período</strong> acima das abas. Selecione "24h", "7 dias", "30 dias", "90 dias" ou "Personalizado" para ajustar o intervalo de busca.
              </p>
            </div>

            <!-- Status -->
            <div>
              <label class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <i class="ph-bold ph-check-circle text-blue-500"></i> Status
              </label>
              <div class="flex gap-2">
                <button
                  v-for="opcao in ['', 'Aprovado', 'Reprovado']"
                  :key="opcao"
                  @click="filtros.status = opcao"
                  class="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                  :class="filtros.status === opcao
                    ? opcao === 'Aprovado' ? 'bg-emerald-600 text-white border-emerald-600' : opcao === 'Reprovado' ? 'bg-red-600 text-white border-red-600' : 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-blue-400'"
                >
                  {{ opcao === '' ? 'Todos' : opcao }}
                </button>
              </div>
            </div>

            <!-- Linha de produção -->
            <div>
              <label class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <i class="ph-bold ph-factory text-blue-500"></i> Linha de Produção
              </label>
              <select
                v-model="filtros.linha"
                class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as linhas</option>
                <option v-for="linha in linhasUnicas" :key="linha" :value="linha">{{ linha }}</option>
              </select>
            </div>

            <!-- Pós Folga -->
            <div>
              <label class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <i class="ph-bold ph-clock text-blue-500"></i> Pós Folga
              </label>
              <div class="flex gap-2">
                <button
                  v-for="opcao in ['', 'Sim', 'Não']"
                  :key="opcao"
                  @click="filtros.posFolga = opcao"
                  class="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                  :class="filtros.posFolga === opcao
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-blue-400'"
                >
                  {{ opcao === '' ? 'Todos' : opcao }}
                </button>
              </div>
            </div>

            <!-- Formato do produto -->
            <div>
              <label class="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <i class="ph-bold ph-tag text-blue-500"></i> Formato do Produto
              </label>
              <select
                v-model="filtros.formato"
                class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os formatos</option>
                <option v-for="fmt in formatosUnicos" :key="fmt" :value="fmt">{{ fmt }}</option>
              </select>
            </div>

          </div>

          <!-- Rodapé da gaveta -->
          <div class="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 flex gap-3">
            <button
              @click="limparFiltros"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-red-400 hover:text-red-500 transition-all flex items-center justify-center gap-2"
            >
              <i class="ph-bold ph-x-circle"></i> Limpar
            </button>
            <button
              @click="gavetaAberta = false"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2"
            >
              <i class="ph-bold ph-check"></i>
              Ver {{ inspecoesFiltradas.length }} resultado{{ inspecoesFiltradas.length !== 1 ? 's' : '' }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- ===================== MODAL VISUALIZAÇÃO ===================== -->
      <div v-if="modalAberto" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
          
          <div class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><i class="ph-bold ph-file-text text-blue-500"></i> Relatório de Inspeção</h2>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <p class="text-sm text-gray-500">Lote: <strong class="text-gray-800 dark:text-gray-200">{{ inspecaoSelecionada.lote }}</strong> | Produto: {{ inspecaoSelecionada.produto }}</p>
                <span v-if="inspecaoSelecionada.posFolga === 'Sim'" class="text-violet-700 dark:text-violet-300 font-bold bg-violet-100 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-700/50 px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1">
                  <i class="ph-fill ph-moon"></i> Pós Folga
                </span>
              </div>
            </div>
            <button @click="fecharModal" class="text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors"><i class="ph-bold ph-x text-xl"></i></button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6">
            
            <div v-if="!inspecaoSelecionada.tipo" class="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-4 rounded-xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Formato</span>
                <span class="font-bold text-blue-700 dark:text-blue-400 text-lg">{{ inspecaoSelecionada.formatoNome }}</span>
              </div>
              <div v-if="limitesAtuais" class="flex gap-6">
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tolerância Lateral</span>
                  <span class="font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">{{ limitesAtuais.latMin }} a {{ limitesAtuais.latMax }} mm</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tolerância Central</span>
                  <span class="font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">{{ limitesAtuais.centMin }} a {{ limitesAtuais.centMax }} mm</span>
                </div>
              </div>
              <div v-else class="text-sm text-yellow-600 font-bold flex items-center gap-2"><i class="ph-fill ph-warning"></i> Limites não guardados.</div>
            </div>

            <!-- Medições Mín / Máx -->
            <div v-if="medicoesPorPeca.length > 0">
              <h3 class="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i class="ph-fill ph-ruler text-blue-400"></i> Medições (Mín / Máx)
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div v-for="(m, index) in medicoesPorPeca" :key="index" class="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                  <div class="text-xs font-bold text-gray-400 uppercase mb-2 border-b border-gray-200 dark:border-slate-700 pb-2">Peça #{{ index + 1 }}</div>
                  <div class="text-sm flex items-center gap-2">
                    <span class="font-bold text-amber-500 dark:text-amber-400 w-10">LAT:</span>
                    <span class="text-gray-800 dark:text-white font-semibold">
                      {{ m.latMin !== null ? m.latMin.toFixed(2).replace('.', ',') : '-' }}
                      <span class="text-gray-400 mx-1">a</span>
                      {{ m.latMax !== null ? m.latMax.toFixed(2).replace('.', ',') : '-' }}
                    </span>
                  </div>
                  <div class="text-sm flex items-center gap-2">
                    <span class="font-bold text-cyan-500 dark:text-cyan-400 w-10">CENT:</span>
                    <span class="text-gray-800 dark:text-white font-semibold">
                      {{ m.centMin !== null ? m.centMin.toFixed(2).replace('.', ',') : '-' }}
                      <span class="text-gray-400 mx-1">a</span>
                      {{ m.centMax !== null ? m.centMax.toFixed(2).replace('.', ',') : '-' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabela de valores -->
            <div v-if="pecasNormalizadas.length > 0">
              <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Valores Medidos</h3>
              <div class="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-xl">
                <table class="w-full text-center text-sm">
                  <thead class="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th class="p-3 font-bold border-r border-gray-200 dark:border-slate-700">Peça</th>
                      <th class="p-3 font-bold text-blue-600 dark:text-blue-400" colspan="4">Empeno Lateral (A, B, C, D)</th>
                      <th class="p-3 font-bold text-indigo-600 dark:text-indigo-400 border-l border-gray-200 dark:border-slate-700" colspan="2">Empeno Central (1, 2)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    <tr v-for="(p, index) in pecasNormalizadas" :key="index" class="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="p-3 font-bold text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-slate-800">#{{ index + 1 }}</td>
                      <td class="p-3" :class="destaqueTolerancia(p.latA, limitesAtuais?.latMin, limitesAtuais?.latMax)">{{ formatarValor(p.latA) }}</td>
                      <td class="p-3" :class="destaqueTolerancia(p.latB, limitesAtuais?.latMin, limitesAtuais?.latMax)">{{ formatarValor(p.latB) }}</td>
                      <td class="p-3" :class="destaqueTolerancia(p.latC, limitesAtuais?.latMin, limitesAtuais?.latMax)">{{ formatarValor(p.latC) }}</td>
                      <td class="p-3" :class="destaqueTolerancia(p.latD, limitesAtuais?.latMin, limitesAtuais?.latMax)">{{ formatarValor(p.latD) }}</td>
                      <td class="p-3 border-l border-gray-100 dark:border-slate-800" :class="destaqueTolerancia(p.cenA, limitesAtuais?.centMin, limitesAtuais?.centMax)">{{ formatarValor(p.cenA) }}</td>
                      <td class="p-3" :class="destaqueTolerancia(p.cenB, limitesAtuais?.centMin, limitesAtuais?.centMax)">{{ formatarValor(p.cenB) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="inspecaoSelecionada.tipo === 'dimensional'" class="p-6 text-center text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
              <i class="ph-bold ph-stack text-3xl mb-2"></i>
              <p class="font-bold">Esta é uma inspeção Dimensional.</p>
            </div>
            <div v-else class="p-6 text-center text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-dashed border-yellow-300 dark:border-yellow-800">
              <i class="ph-fill ph-warning-circle text-3xl mb-2"></i>
              <p class="font-bold">Nenhum dado numérico reconhecido para exibição.</p>
            </div>

            <div v-if="inspecaoSelecionada.observacoes" class="bg-gray-50 dark:bg-slate-800/30 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
              <span class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Observações do Inspetor</span>
              <p class="text-sm text-gray-700 dark:text-gray-300 italic">"{{ inspecaoSelecionada.observacoes }}"</p>
            </div>

            <!-- ===== TRATATIVA ===== -->
            <div v-if="precisaTratativa" class="rounded-xl border-2 overflow-hidden"
              :class="inspecaoSelecionada.tratativa ? 'border-teal-200 dark:border-teal-800/50' : 'border-orange-300 dark:border-orange-700/60'"
            >
              <!-- Cabeçalho da seção -->
              <div class="px-4 py-3 flex items-center gap-2.5"
                :class="inspecaoSelecionada.tratativa ? 'bg-teal-50 dark:bg-teal-900/10' : 'bg-orange-50 dark:bg-orange-900/10'"
              >
                <i v-if="!inspecaoSelecionada.tratativa" class="ph-fill ph-warning text-orange-500 text-xl"></i>
                <i v-else class="ph-fill ph-check-circle text-teal-500 text-xl"></i>
                <div>
                  <p class="text-sm font-bold" :class="inspecaoSelecionada.tratativa ? 'text-teal-700 dark:text-teal-300' : 'text-orange-700 dark:text-orange-300'">
                    {{ inspecaoSelecionada.tratativa ? 'Tratativa: ' + inspecaoSelecionada.tratativa : 'Tratativa necessária' }}
                  </p>
                  <p class="text-xs text-gray-500 mt-0.5">
                    <span v-if="inspecaoSelecionada.posFolga === 'Sim' && temValoresForaRange">Inspeção pós folga com valores fora do range</span>
                    <span v-else-if="inspecaoSelecionada.posFolga === 'Sim'">Inspeção realizada após período de folga</span>
                    <span v-else>Valores fora do range de tolerância detectados</span>
                  </p>
                </div>
              </div>

              <!-- Seleção de tratativa -->
              <!-- Seleção e save de tratativa — apenas admin -->
              <div v-if="authStore.userProfile === 'admin'" class="p-4 bg-white dark:bg-slate-900/50 space-y-3">
                <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Qual foi a tratativa adotada?</p>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    v-for="opcao in ['Normal', 'Documento', 'Restrição', 'Comercial']"
                    :key="opcao"
                    @click="tratativaSelecionada = opcao"
                    class="py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center gap-1.5"
                    :class="tratativaSelecionada === opcao
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'"
                  >
                    <i class="text-xl"
                      :class="{
                        'ph-fill ph-check-circle':  opcao === 'Normal',
                        'ph-fill ph-file-text':      opcao === 'Documento',
                        'ph-fill ph-lock':           opcao === 'Restrição',
                        'ph-fill ph-handshake':      opcao === 'Comercial',
                      }"
                    ></i>
                    {{ opcao }}
                  </button>
                </div>
                <button
                  @click="salvarTratativa"
                  :disabled="!tratativaSelecionada || salvandoTratativa"
                  class="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <i v-if="salvandoTratativa" class="ph-bold ph-spinner animate-spin"></i>
                  <i v-else class="ph-bold ph-floppy-disk"></i>
                  {{ salvandoTratativa ? 'A guardar...' : 'Guardar Tratativa' }}
                </button>
              </div>
            </div>
            <!-- ===== FIM TRATATIVA ===== -->

          </div>

          <!-- Rodapé com Editar / Apagar — apenas admin -->
          <div v-if="authStore.userProfile === 'admin'" class="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 flex justify-end gap-3">
            <button @click="abrirEdicao" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200 dark:border-blue-800/40 transition-all">
              <i class="ph-bold ph-pencil-simple text-base"></i> Editar
            </button>
            <button @click="confirmarExclusao" class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-50 hover:bg-red-600 text-red-600 hover:text-white dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white border border-red-200 dark:border-red-800/40 transition-all">
              <i class="ph-bold ph-trash text-base"></i> Apagar
            </button>
          </div>
        </div>
      </div>

      <!-- ===================== MODAL EDIÇÃO ===================== -->
      <div v-if="modalEdicaoAberto" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
          <div class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/10">
            <h2 class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2"><i class="ph-bold ph-pencil-simple text-amber-500"></i> Editar Inspeção</h2>
            <button @click="fecharEdicao" class="text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-slate-700 transition-colors"><i class="ph-bold ph-x text-xl"></i></button>
          </div>

          <div class="p-6 overflow-y-auto space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Inspetor</label>
                <input v-model="dadosEdicao.inspetor" type="text" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Lote</label>
                <input v-model="dadosEdicao.lote" type="text" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Produto</label>
                <input v-model="dadosEdicao.produto" type="text" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Linha</label>
                <input v-model="dadosEdicao.linha" type="text" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Resultado</label>
                <select v-model="dadosEdicao.resultado" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Aprovado">Aprovado</option>
                  <option value="Reprovado">Reprovado</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Pós Folga</label>
                <select v-model="dadosEdicao.posFolga" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Observações</label>
              <textarea v-model="dadosEdicao.observacoes" rows="3" class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
            </div>

            <div v-if="dadosEdicao.pecas && dadosEdicao.pecas.length > 0">
              <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i class="ph-fill ph-ruler text-blue-400"></i> Valores Medidos por Peça
              </h3>
              <div class="space-y-4">
                <div v-for="(peca, index) in dadosEdicao.pecas" :key="index" class="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                  <div class="text-xs font-bold text-gray-400 uppercase mb-3 pb-2 border-b border-gray-200 dark:border-slate-700">Peça #{{ index + 1 }}</div>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div v-for="campo in ['A','B','C','D']" :key="campo">
                      <label class="text-[10px] font-bold text-blue-500 uppercase block mb-1">Lateral {{ campo }}</label>
                      <input v-model="peca.laterais[campo]" type="number" step="0.01" class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div v-for="campo in ['1','2']" :key="campo">
                      <label class="text-[10px] font-bold text-indigo-500 uppercase block mb-1">Central {{ campo }}</label>
                      <input v-model="peca.centrais[campo]" type="number" step="0.01" class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 flex justify-end gap-3">
            <button @click="fecharEdicao" class="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 bg-white dark:bg-slate-800 dark:text-gray-400 border border-gray-200 dark:border-slate-700 transition-all">Cancelar</button>
            <button @click="confirmarEdicao" :disabled="salvando" class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              <i v-if="salvando" class="ph-bold ph-spinner animate-spin text-base"></i>
              <i v-else class="ph-bold ph-floppy-disk text-base"></i>
              {{ salvando ? 'A guardar...' : 'Guardar Alterações' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===================== GAVETA DE PENDÊNCIAS ===================== -->
      <Transition name="fade">
        <div
          v-if="gavetaPendenciasAberta"
          @click="gavetaPendenciasAberta = false"
          class="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm"
        ></div>
      </Transition>

      <Transition name="slide">
        <div
          v-if="gavetaPendenciasAberta"
          class="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-slate-800"
        >
          <!-- Cabeçalho -->
          <div class="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center"
            :class="inspecoesPendentes.length > 0 ? 'bg-orange-50 dark:bg-orange-900/10' : 'bg-gray-50 dark:bg-slate-800/50'"
          >
            <div class="flex items-center gap-2.5">
              <i class="ph-fill ph-bell text-xl" :class="inspecoesPendentes.length > 0 ? 'text-orange-500' : 'text-gray-400'"></i>
              <div>
                <h2 class="font-bold text-gray-800 dark:text-white text-base">Pendências</h2>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ inspecoesPendentes.length > 0 ? `${inspecoesPendentes.length} tratativa${inspecoesPendentes.length !== 1 ? 's' : ''} em aberto` : 'Nenhuma pendência' }}
                </p>
              </div>
            </div>
            <button @click="gavetaPendenciasAberta = false" class="text-gray-400 hover:text-red-500 bg-white dark:bg-slate-800 p-2 rounded-full border border-gray-200 dark:border-slate-700 transition-colors">
              <i class="ph-bold ph-x text-lg"></i>
            </button>
          </div>

          <!-- Lista de pendências -->
          <div class="flex-1 overflow-y-auto">

            <!-- Estado vazio -->
            <div v-if="inspecoesPendentes.length === 0" class="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
              <div class="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <i class="ph-fill ph-check-circle text-3xl text-emerald-500"></i>
              </div>
              <p class="font-bold text-gray-700 dark:text-gray-200">Tudo em dia!</p>
              <p class="text-sm text-gray-400">Não há tratativas pendentes no momento.</p>
            </div>

            <!-- Itens pendentes -->
            <div v-else class="divide-y divide-gray-100 dark:divide-slate-800">
              <div
                v-for="item in inspecoesPendentes"
                :key="item.id"
                class="p-4 hover:bg-orange-50/50 dark:hover:bg-orange-900/5 transition-colors"
              >
                <!-- Linha superior: produto + lote -->
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p class="font-bold text-gray-800 dark:text-white text-sm">{{ item.produto || 'Produto N/A' }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">
                      <span class="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{{ item.lote || 'N/A' }}</span>
                      <span class="mx-1.5">·</span>{{ formatarData(item) }} {{ formatarHora(item) }}
                    </p>
                  </div>
                  <!-- Badge do motivo -->
                  <div class="flex flex-col gap-1 shrink-0">
                    <span v-if="item.posFolga === 'Sim'" class="text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <i class="ph-fill ph-moon"></i> Pós Folga
                    </span>
                    <span v-if="item._foraRange" class="text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <i class="ph-fill ph-warning"></i> Fora do Range
                    </span>
                  </div>
                </div>

                <!-- Linha inferior: inspetor + botão -->
                <div class="flex items-center justify-between mt-3">
                  <span class="text-xs text-gray-500 flex items-center gap-1">
                    <i class="ph-fill ph-user-circle text-sm"></i> {{ item.inspetor || 'N/A' }}
                    <span class="mx-1">·</span>
                    <span class="text-blue-600 dark:text-blue-400 font-bold">{{ item.linha || 'N/A' }}</span>
                  </span>
                  <button
                    @click="abrirDetalhesDePendencia(item)"
                    class="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center gap-1.5"
                  >
                    <i class="ph-bold ph-arrow-square-out text-sm"></i> Informar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Rodapé -->
          <div v-if="inspecoesPendentes.length > 0" class="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30">
            <p class="text-xs text-center text-gray-400">
              <i class="ph-fill ph-info text-blue-400"></i>
              Clique em <strong>"Informar"</strong> para registar a tratativa de cada item.
            </p>
          </div>
        </div>
      </Transition>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { collection, query, orderBy, onSnapshot, getDocs, doc, updateDoc, deleteDoc, where } from 'firebase/firestore'
import Swal from 'sweetalert2'
import { auth, db } from '../firebase'
import { useAuthStore } from '../stores/auth'
import Sidebar from '../components/Sidebar.vue'
import { exportarExcel, exportarPDF } from '../composables/useExport'

const router = useRouter()
const authStore = useAuthStore()
const inspecoes    = ref([])
const dimensionais = ref([])
const atrito       = ref([])
const relatorios   = ref([])
const formatos     = ref([])
const carregando   = ref(true)
let unsubscribe            = null
let unsubscribeDimensional = null // mantido por compatibilidade — não usado
let unsubscribeAtrito      = null // mantido por compatibilidade — não usado
let unsubscribeRelatorios  = null // mantido por compatibilidade — não usado

// ─── Relatórios de Turno ──────────────────────────────────────────────────────
const modalRelatorioAberto  = ref(false)
const relatorioSelecionado  = ref(null)

const abrirModalRelatorio  = (rel) => { relatorioSelecionado.value = rel; modalRelatorioAberto.value = true }
const fecharModalRelatorio = () => { modalRelatorioAberto.value = false; relatorioSelecionado.value = null }

// últimos 7 dias
const relatoriosFiltrados = computed(() => {
  let lista = [...relatorios.value]
  if (filtrosRel.value.texto) {
    const t = filtrosRel.value.texto.toLowerCase()
    lista = lista.filter(r =>
      (r.responsavel || '').toLowerCase().includes(t) ||
      (r.linhas || []).some(l => (l.referencia || '').toLowerCase().includes(t))
    )
  }
  if (filtrosRel.value.equipe) lista = lista.filter(r => r.equipe === filtrosRel.value.equipe)
  return lista
})

const _situacoesDash = [
  { valor: 'verde',    emoji: '🟢', label: 'Liberado Normalmente',            border: 'border-emerald-200 dark:border-emerald-800/40', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
  { valor: 'amarela',  emoji: '🟡', label: 'Ponto de Melhora',                border: 'border-yellow-200 dark:border-yellow-800/40',  bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
  { valor: 'laranja',  emoji: '🟠', label: 'Liberado com Documento',          border: 'border-orange-200 dark:border-orange-800/40',  bg: 'bg-orange-50 dark:bg-orange-900/10' },
  { valor: 'vermelha', emoji: '🔴', label: 'Liberado com Restrição / Retido', border: 'border-red-200 dark:border-red-800/40',         bg: 'bg-red-50 dark:bg-red-900/10' },
]
const emojiSituacaoDash  = (v) => _situacoesDash.find(s => s.valor === v)?.emoji  ?? ''
const labelSituacaoDash  = (v) => _situacoesDash.find(s => s.valor === v)?.label  ?? v ?? '—'
const borderSituacaoDash = (v) => _situacoesDash.find(s => s.valor === v)?.border ?? 'border-gray-200 dark:border-slate-700'
const bgSituacaoDash     = (v) => _situacoesDash.find(s => s.valor === v)?.bg     ?? 'bg-gray-50 dark:bg-slate-800/50'

const bgLabelSituacao = (v) => {
  const mapa = {
    verde:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    amarela:  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    laranja:  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    vermelha: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  }
  return mapa[v] || 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
}

const copiarRelatorio = async (rel) => {
  try {
    await navigator.clipboard.writeText(rel.textoExportado || '')
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Copiado!', text: 'Texto pronto para colar no WhatsApp', showConfirmButton: false, timer: 2000 })
  } catch {
    Swal.fire('Erro', 'Não foi possível copiar.', 'error')
  }
}

// ─── Coleção Atrito ───────────────────────────────────────────────────────────
const modalAtritoAberto = ref(false)
const atritoSelecionado = ref(null)

const abrirDetalhesAtrito = (at) => {
  atritoSelecionado.value = at
  modalAtritoAberto.value = true
}
const fecharModalAtrito = () => {
  modalAtritoAberto.value = false
  atritoSelecionado.value = null
}

const atritoFiltrados = computed(() => {
  let lista = [...atrito.value]
  if (filtrosAt.value.texto) {
    const t = filtrosAt.value.texto.toLowerCase()
    lista = lista.filter(a => (a.produto || '').toLowerCase().includes(t) || (a.lote || '').toLowerCase().includes(t) || (a.inspetor || '').toLowerCase().includes(t))
  }
  if (filtrosAt.value.linha)    lista = lista.filter(a => a.linha === filtrosAt.value.linha)
  if (filtrosAt.value.classeAD) lista = lista.filter(a => a.classeAD === filtrosAt.value.classeAD)
  if (filtrosAt.value.status)   lista = lista.filter(a => a.resultado === filtrosAt.value.status)
  return lista
})

const corClasseAD = (nome) => {
  const mapa = {
    'AD':   'border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200',
    'AD2':  'border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'AD3':  'border-teal-300 dark:border-teal-700 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
    'AD4':  'border-orange-300 dark:border-orange-700 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    'AD4+': 'border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  }
  return mapa[nome] || 'border-gray-300 bg-gray-100 text-gray-700'
}

// Todas as inspeções mescladas (empeno + dimensional), ordenadas por data
const todasInspecoes = computed(() => {
  const empeno = inspecoes.value.map(i => ({ ...i, _tipo: 'empeno' }))
  const dim    = dimensionais.value.map(i => ({ ...i, _tipo: 'dimensional' }))
  return [...empeno, ...dim].sort((a, b) => {
    const ta = a.dataHora?.seconds ?? 0
    const tb = b.dataHora?.seconds ?? 0
    return tb - ta
  })
})

// ─── Abas ─────────────────────────────────────────────────────────────────────
const abaAtiva    = ref('graficos')
const subAbaAtiva = ref('empeno')

// ─── Filtro de formato dos gráficos de range ──────────────────────────────────
const filtroFormatoGrafico = ref('')

// ─── Coleção Dimensionais ─────────────────────────────────────────────────────
const modalDimensionalAberto   = ref(false)
const dimensionalSelecionada   = ref(null)

const abrirDetalhesDimensional = (dim) => {
  dimensionalSelecionada.value = dim
  modalDimensionalAberto.value = true
}
const fecharModalDimensional = () => {
  modalDimensionalAberto.value = false
  dimensionalSelecionada.value = null
}

// Últimas 24h da coleção dimensionais
const dimensionaisFiltrados = computed(() => {
  let lista = [...dimensionais.value]
  if (filtrosDim.value.texto) {
    const t = filtrosDim.value.texto.toLowerCase()
    lista = lista.filter(d => (d.produto || '').toLowerCase().includes(t) || (d.lote || '').toLowerCase().includes(t) || (d.inspetor || '').toLowerCase().includes(t))
  }
  if (filtrosDim.value.linha)  lista = lista.filter(d => d.linha === filtrosDim.value.linha)
  if (filtrosDim.value.status) lista = lista.filter(d => d.resultado === filtrosDim.value.status)
  return lista
})

// Helpers espessura no modal
const mediaEspessura = (peca) => {
  const pts = (peca.pontos || []).filter(v => v !== null && v !== '' && !isNaN(Number(v)))
  if (!pts.length) return 0
  return pts.reduce((a, b) => a + Number(b), 0) / pts.length
}
const validaEspessuraDim = (val, declarada) => {
  if (!declarada) return true
  return val >= declarada * 0.95 && val <= declarada * 1.05
}

// ─── Modal Visualização ───────────────────────────────────────────────────────
const modalAberto = ref(false)
const inspecaoSelecionada = ref(null)

const abrirDetalhes = (rel) => {
  inspecaoSelecionada.value = rel
  tratativaSelecionada.value = rel.tratativa || ''
  modalAberto.value = true
}
const fecharModal = () => {
  modalAberto.value = false
  inspecaoSelecionada.value = null
  tratativaSelecionada.value = ''
}

// ─── Modal Edição ─────────────────────────────────────────────────────────────
const modalEdicaoAberto = ref(false)
const dadosEdicao = ref({})
const salvando = ref(false)

const abrirEdicao = () => {
  const original = inspecaoSelecionada.value
  dadosEdicao.value = {
    inspetor: original.inspetor || '', lote: original.lote || '',
    produto: original.produto || '', linha: original.linha || '',
    resultado: original.resultado || 'Aprovado', posFolga: original.posFolga || 'Não',
    observacoes: original.observacoes || '',
    pecas: Array.isArray(original.pecas)
      ? original.pecas.map(p => ({
          laterais: { A: p.laterais?.A ?? '', B: p.laterais?.B ?? '', C: p.laterais?.C ?? '', D: p.laterais?.D ?? '' },
          centrais: { '1': p.centrais?.['1'] ?? '', '2': p.centrais?.['2'] ?? '' }
        }))
      : []
  }
  modalEdicaoAberto.value = true
}

const fecharEdicao = () => { modalEdicaoAberto.value = false; dadosEdicao.value = {} }

const confirmarEdicao = async () => {
  const { isConfirmed } = await Swal.fire({
    title: 'Guardar alterações?',
    text: 'Tens a certeza de que queres guardar as alterações nesta inspeção?',
    icon: 'question', showCancelButton: true,
    confirmButtonColor: '#3B82F6', cancelButtonColor: '#6B7280',
    confirmButtonText: 'Sim, guardar', cancelButtonText: 'Cancelar',
  })
  if (!isConfirmed) return
  salvando.value = true
  try {
    const docRef = doc(db, 'inspecoes', inspecaoSelecionada.value.id)
    await updateDoc(docRef, {
      inspetor: dadosEdicao.value.inspetor, lote: dadosEdicao.value.lote,
      produto: dadosEdicao.value.produto, linha: dadosEdicao.value.linha,
      resultado: dadosEdicao.value.resultado, posFolga: dadosEdicao.value.posFolga,
      observacoes: dadosEdicao.value.observacoes, pecas: dadosEdicao.value.pecas,
    })
    await Swal.fire({ title: 'Guardado!', text: 'Inspeção atualizada com sucesso.', icon: 'success', confirmButtonColor: '#3B82F6', timer: 2000, timerProgressBar: true })
    fecharEdicao(); fecharModal()
  } catch (error) {
    console.error('Erro ao atualizar:', error)
    Swal.fire({ title: 'Erro!', text: 'Não foi possível guardar. Tenta novamente.', icon: 'error', confirmButtonColor: '#EF4444' })
  } finally { salvando.value = false }
}

// ─── Excluir ──────────────────────────────────────────────────────────────────
const confirmarExclusao = async () => {
  const { isConfirmed } = await Swal.fire({
    title: 'Apagar inspeção?',
    html: `Esta ação é <strong>irreversível</strong>.<br/>O lote <strong>${inspecaoSelecionada.value.lote}</strong> será eliminado permanentemente.`,
    icon: 'warning', showCancelButton: true,
    confirmButtonColor: '#EF4444', cancelButtonColor: '#6B7280',
    confirmButtonText: 'Sim, apagar', cancelButtonText: 'Cancelar',
  })
  if (!isConfirmed) return
  try {
    await deleteDoc(doc(db, 'inspecoes', inspecaoSelecionada.value.id))
    fecharModal()
    await Swal.fire({ title: 'Apagado!', text: 'Inspeção eliminada com sucesso.', icon: 'success', confirmButtonColor: '#3B82F6', timer: 2000, timerProgressBar: true })
  } catch (error) {
    console.error('Erro ao apagar:', error)
    Swal.fire({ title: 'Erro!', text: 'Não foi possível apagar. Tenta novamente.', icon: 'error', confirmButtonColor: '#EF4444' })
  }
}

// ─── Gaveta de Pendências ─────────────────────────────────────────────────────
const gavetaPendenciasAberta = ref(false)

// Helper: verifica se uma inspeção tem valores fora do range usando o seu snapshot de limites
const verificaForaRangeGlobal = (inspecao) => {
  const limites = inspecao.limitesSnapshot
    || formatos.value.find(f => f.nome === inspecao.formatoNome)
  if (!limites) return false

  const { latMin, latMax, centMin, centMax } = limites

  // Normaliza as peças do mesmo jeito que pecasNormalizadas
  let pecas = []
  if (Array.isArray(inspecao.pecas) && inspecao.pecas.length > 0) {
    pecas = inspecao.pecas.map(p => {
      if (p.latA !== undefined) return p
      if (p.laterais || p.centrais) return {
        latA: p.laterais?.A, latB: p.laterais?.B, latC: p.laterais?.C, latD: p.laterais?.D,
        cenA: p.centrais?.['1'], cenB: p.centrais?.['2']
      }
      return p
    })
  } else if (inspecao.empenoLateralA !== undefined) {
    pecas = [{ latA: inspecao.empenoLateralA, latB: inspecao.empenoLateralB, latC: inspecao.empenoLateralC, latD: inspecao.empenoLateralD, cenA: inspecao.empenoCentralA, cenB: inspecao.empenoCentralB }]
  }

  return pecas.some(p => {
    const foraLat  = [p.latA, p.latB, p.latC, p.latD].some(v => v !== undefined && v !== '' && (Number(v) < latMin || Number(v) > latMax))
    const foraCent = [p.cenA, p.cenB].some(v => v !== undefined && v !== '' && (Number(v) < centMin || Number(v) > centMax))
    return foraLat || foraCent
  })
}

// Lista de inspeções que precisam de tratativa e ainda não têm
const inspecoesPendentes = computed(() => {
  return inspecoes.value
    .filter(i => {
      if (i.tratativa) return false // já tem tratativa, ignorar
      const foraRange = verificaForaRangeGlobal(i)
      const posfolga  = i.posFolga === 'Sim'
      return posfolga || foraRange
    })
    .map(i => ({
      ...i,
      _foraRange: verificaForaRangeGlobal(i)
    }))
})

// Abre o modal de detalhe diretamente a partir da gaveta de pendências
const abrirDetalhesDePendencia = (item) => {
  gavetaPendenciasAberta.value = false
  abrirDetalhes(item)
}

// ─── Filtros ──────────────────────────────────────────────────────────────────
const gavetaAberta = ref(false)

const filtros = ref({
  texto:      '',
  status:     '',
  linha:      '',
  posFolga:   '',
  formato:    '',
})

const limparFiltros = () => {
  filtros.value = { texto: '', status: '', linha: '', posFolga: '', formato: '' }
}

// Conta quantos filtros estão ativos
const filtrosAtivos = computed(() =>
  Object.values(filtros.value).filter(v => v !== '').length
)

// Atalhos de data rápidos
const atalhoData = (periodo) => {
  const hoje = new Date()
  const toISO = (d) => d.toISOString().split('T')[0]

  if (periodo === 'hoje') {
    filtros.value.dataInicio = toISO(hoje)
    filtros.value.dataFim    = toISO(hoje)
  } else if (periodo === 'semana') {
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay())
    filtros.value.dataInicio = toISO(inicioSemana)
    filtros.value.dataFim    = toISO(hoje)
  } else if (periodo === 'mes') {
    filtros.value.dataInicio = toISO(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
    filtros.value.dataFim    = toISO(hoje)
  } else if (periodo === 'mes_passado') {
    const primeiroDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    const ultimoDiaMesPassado   = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
    filtros.value.dataInicio = toISO(primeiroDiaMesPassado)
    filtros.value.dataFim    = toISO(ultimoDiaMesPassado)
  }
}

// Opções únicas para os dropdowns (extraídas dos dados reais)
const linhasUnicas = computed(() =>
  [...new Set(inspecoes.value.map(i => i.linha).filter(Boolean))].sort()
)
const formatosUnicos = computed(() =>
  [...new Set(inspecoes.value.map(i => i.formatoNome).filter(Boolean))].sort()
)

// Lógica de filtragem — dados já foram pré-filtrados por período no Firestore
const inspecoesFiltradas = computed(() => {
  let lista = [...inspecoes.value]

  if (filtros.value.texto) {
    const termo = filtros.value.texto.toLowerCase()
    lista = lista.filter(i =>
      (i.lote      || '').toLowerCase().includes(termo) ||
      (i.produto   || '').toLowerCase().includes(termo) ||
      (i.inspetor  || '').toLowerCase().includes(termo)
    )
  }
  if (filtros.value.status)   lista = lista.filter(i => i.resultado === filtros.value.status)
  if (filtros.value.linha)    lista = lista.filter(i => i.linha === filtros.value.linha)
  if (filtros.value.posFolga) lista = lista.filter(i => i.posFolga === filtros.value.posFolga)
  if (filtros.value.formato)  lista = lista.filter(i => i.formatoNome === filtros.value.formato)

  return lista
})

// ─── Tratativa ────────────────────────────────────────────────────────────────
const tratativaSelecionada = ref('')
const salvandoTratativa = ref(false)

// Verifica se existe algum valor fora do range de tolerância
const temValoresForaRange = computed(() => {
  if (!inspecaoSelecionada.value || !limitesAtuais.value) return false
  const { latMin, latMax, centMin, centMax } = limitesAtuais.value
  return pecasNormalizadas.value.some(p => {
    const laterais = [p.latA, p.latB, p.latC, p.latD]
    const centrais = [p.cenA, p.cenB]
    const foraLat  = laterais.some(v => v !== undefined && v !== '' && (Number(v) < latMin || Number(v) > latMax))
    const foraCent = centrais.some(v => v !== undefined && v !== '' && (Number(v) < centMin || Number(v) > centMax))
    return foraLat || foraCent
  })
})

// Exibe a seção de tratativa se for pós folga OU se tiver valores fora do range
const precisaTratativa = computed(() => {
  if (!inspecaoSelecionada.value) return false
  return inspecaoSelecionada.value.posFolga === 'Sim' || temValoresForaRange.value
})

const salvarTratativa = async () => {
  if (!tratativaSelecionada.value) return
  salvandoTratativa.value = true
  try {
    const docRef = doc(db, 'inspecoes', inspecaoSelecionada.value.id)
    await updateDoc(docRef, { tratativa: tratativaSelecionada.value })
    // Atualiza o objeto local sem fechar o modal
    inspecaoSelecionada.value = { ...inspecaoSelecionada.value, tratativa: tratativaSelecionada.value }
    await Swal.fire({
      title: 'Tratativa guardada!',
      text: `Tratativa "${tratativaSelecionada.value}" registada com sucesso.`,
      icon: 'success', confirmButtonColor: '#3B82F6', timer: 2000, timerProgressBar: true,
    })
  } catch (error) {
    console.error('Erro ao guardar tratativa:', error)
    Swal.fire({ title: 'Erro!', text: 'Não foi possível guardar a tratativa.', icon: 'error', confirmButtonColor: '#EF4444' })
  } finally {
    salvandoTratativa.value = false
  }
}

// ─── Limites ──────────────────────────────────────────────────────────────────
const limitesAtuais = computed(() => {
  if (!inspecaoSelecionada.value) return null
  if (inspecaoSelecionada.value.limitesSnapshot) return inspecaoSelecionada.value.limitesSnapshot
  return formatos.value.find(f => f.nome === inspecaoSelecionada.value.formatoNome)
})

const formatarValor = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '-'
  return valor
}

// ─── Normalização das peças ───────────────────────────────────────────────────
const pecasNormalizadas = computed(() => {
  if (!inspecaoSelecionada.value) return []
  const i = inspecaoSelecionada.value
  if (Array.isArray(i.pecas) && i.pecas.length > 0) {
    return i.pecas.map(p => {
      if (p.latA !== undefined) return p
      if (p.laterais || p.centrais) return { latA: p.laterais?.A, latB: p.laterais?.B, latC: p.laterais?.C, latD: p.laterais?.D, cenA: p.centrais?.['1'], cenB: p.centrais?.['2'] }
      return p
    })
  }
  if (i.empenoLateralA !== undefined) {
    return [{ latA: i.empenoLateralA, latB: i.empenoLateralB, latC: i.empenoLateralC, latD: i.empenoLateralD, cenA: i.empenoCentralA, cenB: i.empenoCentralB }]
  }
  return []
})

// ─── Medições Mín / Máx ───────────────────────────────────────────────────────
const medicoesPorPeca = computed(() => {
  return pecasNormalizadas.value.map(p => {
    const laterais = [p.latA, p.latB, p.latC, p.latD].map(Number).filter(v => !isNaN(v))
    const centrais = [p.cenA, p.cenB].map(Number).filter(v => !isNaN(v))
    return {
      latMin:  laterais.length ? Math.min(...laterais) : null,
      latMax:  laterais.length ? Math.max(...laterais) : null,
      centMin: centrais.length ? Math.min(...centrais) : null,
      centMax: centrais.length ? Math.max(...centrais) : null,
    }
  })
})

// ─── Destaque tolerância ──────────────────────────────────────────────────────
const destaqueTolerancia = (valor, min, max) => {
  if (valor === null || valor === undefined || valor === '' || valor === '-' || min === undefined || max === undefined) return 'text-gray-700 dark:text-gray-300 font-medium'
  const v = Number(valor)
  if (v < min || v > max) return 'text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20'
  return 'text-gray-700 dark:text-gray-300 font-medium'
}

// ─── Datas ────────────────────────────────────────────────────────────────────
const formatarData = (rel) => {
  if (rel.data) return rel.data
  if (rel.dataHora) {
    if (typeof rel.dataHora.toDate === 'function') return rel.dataHora.toDate().toLocaleDateString('pt-BR')
    if (rel.dataHora.seconds) return new Date(rel.dataHora.seconds * 1000).toLocaleDateString('pt-BR')
  }
  return '--/--/----'
}

const formatarHora = (rel) => {
  if (rel.hora) return rel.hora
  if (rel.dataHora) {
    if (typeof rel.dataHora.toDate === 'function') return rel.dataHora.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    if (rel.dataHora.seconds) return new Date(rel.dataHora.seconds * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  return '--:--'
}

// ─── Gráficos Range Lateral e Central (Picos e Vales) ────────────────────────

// Últimas 20 inspeções que tenham peças medidas (respeitando filtro de formato)
const ultimas20ComEmpeno = computed(() => {
  let lista = inspecoes.value.filter(i => Array.isArray(i.pecas) && i.pecas.length > 0)
  if (filtroFormatoGrafico.value) {
    lista = lista.filter(i => i.formatoNome === filtroFormatoGrafico.value)
  }
  return lista.slice(0, 20).reverse()
})

// Formatos disponíveis para o dropdown dos gráficos
const formatosParaGrafico = computed(() =>
  [...new Set(inspecoes.value
    .filter(i => Array.isArray(i.pecas) && i.pecas.length > 0)
    .map(i => i.formatoNome).filter(Boolean)
  )].sort()
)

// Extrai todos os valores laterais de uma inspeção
const valoresLaterais = (inspecao) =>
  (inspecao.pecas || []).flatMap(p => {
    const vals = p.laterais
      ? [p.laterais.A, p.laterais.B, p.laterais.C, p.laterais.D]
      : [p.latA, p.latB, p.latC, p.latD]
    return vals.filter(v => v !== null && v !== undefined && v !== '' && !isNaN(Number(v))).map(Number)
  })

// Extrai todos os valores centrais de uma inspeção
const valoresCentralis = (inspecao) =>
  (inspecao.pecas || []).flatMap(p => {
    const vals = p.centrais
      ? [p.centrais['1'], p.centrais['2']]
      : [p.cenA, p.cenB]
    return vals.filter(v => v !== null && v !== undefined && v !== '' && !isNaN(Number(v))).map(Number)
  })

// Dados processados para o gráfico lateral (com produto e lote para tooltip)
const dadosRangeLateral = computed(() => {
  const pontos = ultimas20ComEmpeno.value.map(i => {
    const vals = valoresLaterais(i)
    return {
      formato: i.formatoNome || 'N/A',
      produto: i.produto     || 'N/A',
      lote:    i.lote        || 'N/A',
      pico:    vals.length ? Math.max(...vals) : null,
      vale:    vals.length ? Math.min(...vals) : null,
      limites: i.limitesSnapshot || null,
    }
  })
  const comLimites = [...pontos].reverse().find(p => p.limites)
  const latMax = comLimites?.limites?.latMax ?? 1.2
  const latMin = comLimites?.limites?.latMin ?? -0.7
  return { pontos, latMax, latMin }
})

// Dados processados para o gráfico central (com produto e lote para tooltip)
const dadosRangeCentral = computed(() => {
  const pontos = ultimas20ComEmpeno.value.map(i => {
    const vals = valoresCentralis(i)
    return {
      formato: i.formatoNome || 'N/A',
      produto: i.produto     || 'N/A',
      lote:    i.lote        || 'N/A',
      pico:    vals.length ? Math.max(...vals) : null,
      vale:    vals.length ? Math.min(...vals) : null,
      limites: i.limitesSnapshot || null,
    }
  })
  const comLimites = [...pontos].reverse().find(p => p.limites)
  const centMax = comLimites?.limites?.centMax ?? 1.5
  const centMin = comLimites?.limites?.centMin ?? -0.5
  return { pontos, centMax, centMin }
})

// Séries para o gráfico lateral
const graficoRangeLateralSeries = computed(() => [
  { name: 'Pico (Max)',  data: dadosRangeLateral.value.pontos.map(p => p.pico !== null ? parseFloat(p.pico.toFixed(2)) : null) },
  { name: 'Vale (Min)', data: dadosRangeLateral.value.pontos.map(p => p.vale !== null ? parseFloat(p.vale.toFixed(2)) : null) },
])

// Opções do gráfico lateral
const graficoRangeLateralOptions = computed(() => {
  const { pontos, latMax, latMin } = dadosRangeLateral.value
  const isDark = document.documentElement.classList.contains('dark')
  return {
    chart: { type: 'line', toolbar: { show: false }, background: 'transparent', foreColor: isDark ? '#94a3b8' : '#64748b', animations: { enabled: true } },
    colors: ['#3B82F6', '#F59E0B'],
    stroke: { curve: 'straight', width: 2 },
    markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
    xaxis: {
      categories: pontos.map(p => p.formato),
      labels: { rotate: -45, style: { fontSize: '10px' }, trim: false },
      tickPlacement: 'on',
    },
    yaxis: { title: { text: 'Medição Lateral', style: { fontSize: '10px', fontWeight: 600 } }, decimalsInFloat: 2 },
    annotations: {
      yaxis: [
        { y: latMax, borderColor: '#EF4444', borderWidth: 2, strokeDashArray: 5, label: { text: '', style: { background: 'transparent' } } },
        { y: latMin, borderColor: '#EF4444', borderWidth: 2, strokeDashArray: 5, label: { text: '', style: { background: 'transparent' } } },
      ]
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const p = pontos[dataPointIndex]
        const val = series[seriesIndex][dataPointIndex]
        const label = seriesIndex === 0 ? 'Pico (Max)' : 'Vale (Min)'
        const cor   = seriesIndex === 0 ? '#3B82F6'    : '#F59E0B'
        return `<div style="padding:10px 14px;font-family:inherit;min-width:160px">
          <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${p.produto}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:8px">Lote: <strong style="color:inherit">${p.lote}</strong> · ${p.formato}</div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="width:10px;height:10px;border-radius:2px;background:${cor};display:inline-block"></span>
            <span style="font-size:13px;font-weight:700">${label}: ${val !== null ? val + ' mm' : '-'}</span>
          </div>
        </div>`
      }
    },
    legend: { position: 'bottom', offsetY: 4, markers: { shape: 'square', size: 10 } },
    grid: { borderColor: isDark ? '#1e293b' : '#f1f5f9', strokeDashArray: 3 },
    theme: { mode: isDark ? 'dark' : 'light' },
  }
})

// Séries para o gráfico central
const graficoRangeCentralSeries = computed(() => [
  { name: 'Pico Central (Max)', data: dadosRangeCentral.value.pontos.map(p => p.pico !== null ? parseFloat(p.pico.toFixed(2)) : null) },
  { name: 'Vale Central (Min)', data: dadosRangeCentral.value.pontos.map(p => p.vale !== null ? parseFloat(p.vale.toFixed(2)) : null) },
])

// Opções do gráfico central
const graficoRangeCentralOptions = computed(() => {
  const { pontos, centMax, centMin } = dadosRangeCentral.value
  const isDark = document.documentElement.classList.contains('dark')
  return {
    chart: { type: 'line', toolbar: { show: false }, background: 'transparent', foreColor: isDark ? '#94a3b8' : '#64748b', animations: { enabled: true } },
    colors: ['#10B981', '#A855F7'],
    stroke: { curve: 'straight', width: 2 },
    markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
    xaxis: {
      categories: pontos.map(p => p.formato),
      labels: { rotate: -45, style: { fontSize: '10px' }, trim: false },
      tickPlacement: 'on',
    },
    yaxis: { title: { text: 'Medição Central', style: { fontSize: '10px', fontWeight: 600 } }, decimalsInFloat: 2 },
    annotations: {
      yaxis: [
        { y: centMax, borderColor: '#EF4444', borderWidth: 2, strokeDashArray: 5, label: { text: '', style: { background: 'transparent' } } },
        { y: centMin, borderColor: '#EF4444', borderWidth: 2, strokeDashArray: 5, label: { text: '', style: { background: 'transparent' } } },
      ]
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const p = pontos[dataPointIndex]
        const val = series[seriesIndex][dataPointIndex]
        const label = seriesIndex === 0 ? 'Pico Central (Max)' : 'Vale Central (Min)'
        const cor   = seriesIndex === 0 ? '#10B981' : '#A855F7'
        return `<div style="padding:10px 14px;font-family:inherit;min-width:160px">
          <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">${p.produto}</div>
          <div style="font-size:11px;color:#6b7280;margin-bottom:8px">Lote: <strong style="color:inherit">${p.lote}</strong> · ${p.formato}</div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="width:10px;height:10px;border-radius:2px;background:${cor};display:inline-block"></span>
            <span style="font-size:13px;font-weight:700">${label}: ${val !== null ? val + ' mm' : '-'}</span>
          </div>
        </div>`
      }
    },
    legend: { position: 'bottom', offsetY: 4, markers: { shape: 'square', size: 10 } },
    grid: { borderColor: isDark ? '#1e293b' : '#f1f5f9', strokeDashArray: 3 },
    theme: { mode: isDark ? 'dark' : 'light' },
  }
})

// ─── Stats e gráficos (baseados no total, não nos filtros) ────────────────────
const stats = computed(() => {
  const lista = inspecoes.value
  const hojeStr = new Date().toLocaleDateString('pt-BR')
  return {
    total:      lista.length,
    posFolga:   lista.filter(i => i.posFolga === 'Sim').length,
    reprovados: lista.filter(i => i.resultado === 'Reprovado').length,
    hoje:       lista.filter(i => formatarData(i) === hojeStr).length
  }
})

const graficoAprovacaoSeries = computed(() => [inspecoes.value.filter(i => i.resultado === 'Aprovado').length, stats.value.reprovados])

const graficoAprovacaoOptions = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    labels: ['Aprovado', 'Reprovado'], colors: ['#10B981', '#EF4444'],
    chart: { foreColor: isDark ? '#94a3b8' : '#64748b' },
    plotOptions: { pie: { donut: { size: '65%' } } },
    dataLabels: { enabled: true }, legend: { position: 'bottom' },
    stroke: { show: true, colors: isDark ? ['#0f172a'] : ['#ffffff'], width: 3 }
  }
})

const dadosLinhas = computed(() => {
  const contagem = {}
  inspecoes.value.forEach(i => { const n = i.linha || 'N/A'; if (!contagem[n]) contagem[n] = 0; contagem[n]++ })
  return contagem
})

const graficoLinhasSeries = computed(() => [{ name: 'Lotes', data: Object.values(dadosLinhas.value) }])
const graficoLinhasOptions = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  return {
    chart: { toolbar: { show: false }, foreColor: isDark ? '#94a3b8' : '#64748b' }, colors: ['#3B82F6'],
    plotOptions: { bar: { horizontal: true, distributed: true } },
    xaxis: { categories: Object.keys(dadosLinhas.value) }, legend: { show: false },
    grid: { borderColor: isDark ? '#1e293b' : '#f1f5f9' }, tooltip: { theme: isDark ? 'dark' : 'light' }
  }
})

// ─── Lifecycle ────────────────────────────────────────────────────────────────
const ultimaAtualizacao = ref(null)
const carregandoSec     = ref(false)

// ── Filtro Global de Período ──────────────────────────────────────────────────
const periodos = [
  { valor: '24h',    label: 'Últimas 24h' },
  { valor: '7d',     label: '7 dias' },
  { valor: '30d',    label: '30 dias' },
  { valor: '90d',    label: '90 dias' },
  { valor: 'custom', label: 'Personalizado' },
]

const filtroGlobal = ref({ periodo: '24h', dataInicio: '', dataFim: '' })

// Retorna o Timestamp de início com base no período selecionado
const tsInicio = () => {
  const { periodo, dataInicio } = filtroGlobal.value
  if (periodo === 'custom' && dataInicio) {
    const d = new Date(dataInicio + 'T00:00:00')
    return d
  }
  const d = new Date()
  if (periodo === '24h')  d.setHours(d.getHours() - 24)
  if (periodo === '7d')   d.setDate(d.getDate() - 7)
  if (periodo === '30d')  d.setDate(d.getDate() - 30)
  if (periodo === '90d')  d.setDate(d.getDate() - 90)
  return d
}
const tsFim = () => {
  const { periodo, dataFim } = filtroGlobal.value
  if (periodo === 'custom' && dataFim) {
    const d = new Date(dataFim + 'T23:59:59')
    return d
  }
  return new Date()
}

// ── Filtros específicos por aba ───────────────────────────────────────────────
const filtrosDim = ref({ texto: '', linha: '', status: '' })
const filtrosAt  = ref({ texto: '', linha: '', classeAD: '', status: '' })
const filtrosRel = ref({ texto: '', equipe: '' })

// Linhas únicas extraídas dos dados carregados
const linhasUnicasDim = computed(() => [...new Set(dimensionais.value.map(d => d.linha).filter(Boolean))].sort())
const linhasUnicasAt  = computed(() => [...new Set(atrito.value.map(d => d.linha).filter(Boolean))].sort())

// ── Carregamento das coleções secundárias ─────────────────────────────────────
const carregarColecoesSec = async () => {
  carregandoSec.value = true
  try {
    const inicio = tsInicio()
    const fim    = tsFim()
    const [snapDim, snapAt, snapRel] = await Promise.all([
      getDocs(query(collection(db, 'dimensionais'),    orderBy('dataHora', 'desc'), where('dataHora', '>=', inicio), where('dataHora', '<=', fim))),
      getDocs(query(collection(db, 'atrito'),          orderBy('dataHora', 'desc'), where('dataHora', '>=', inicio), where('dataHora', '<=', fim))),
      getDocs(query(collection(db, 'relatorios_turno'),orderBy('dataHora', 'desc'), where('dataHora', '>=', inicio), where('dataHora', '<=', fim))),
    ])
    dimensionais.value = snapDim.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    atrito.value       = snapAt.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    relatorios.value   = snapRel.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ultimaAtualizacao.value = new Date()
  } finally {
    carregandoSec.value = false
  }
}

// Recarrega o onSnapshot de empeno + as coleções secundárias
const recarregarTudo = async () => {
  // Recria o listener de empeno com o novo período
  if (unsubscribe) { unsubscribe(); unsubscribe = null }
  const inicio = tsInicio()
  const fim    = tsFim()
  const q = query(collection(db, 'inspecoes'), orderBy('dataHora', 'desc'), where('dataHora', '>=', inicio), where('dataHora', '<=', fim))
  unsubscribe = onSnapshot(q, (snapshot) => {
    inspecoes.value  = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    carregando.value = false
  })
  await carregarColecoesSec()
}

const selecionarPeriodo = (p) => {
  filtroGlobal.value.periodo = p
  if (p !== 'custom') recarregarTudo()
}

const aplicarPeriodoCustom = () => {
  if (filtroGlobal.value.dataInicio) recarregarTudo()
}

onMounted(async () => {
  const snapFormatos = await getDocs(collection(db, 'formatos'))
  formatos.value = snapFormatos.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  await recarregarTudo()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
  if (unsubscribeDimensional) unsubscribeDimensional()
  if (unsubscribeAtrito) unsubscribeAtrito()
  if (unsubscribeRelatorios) unsubscribeRelatorios()
})
const sairDoSistema = async () => { await signOut(auth); authStore.limparSessao(); router.push('/') }
</script>

<style scoped>
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-scale-in { animation: scaleIn 0.25s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }

/* Transição da gaveta */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

/* Transição do overlay */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Animação do sino quando há pendências */
@keyframes bell-shake {
  0%, 100% { transform: rotate(0deg); }
  15%       { transform: rotate(12deg); }
  30%       { transform: rotate(-10deg); }
  45%       { transform: rotate(8deg); }
  60%       { transform: rotate(-6deg); }
  75%       { transform: rotate(4deg); }
}
.animate-bell { animation: bell-shake 2.5s ease-in-out infinite; }
</style>