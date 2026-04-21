<template>
  <div class="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
    <Sidebar />

    <main class="flex-1 overflow-y-auto w-full p-6 pb-24 md:pb-6">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <i class="ph-bold ph-gear text-blue-600"></i> Administração de Sistema
        </h1>
        <p class="text-sm text-gray-500 mt-1">Gestão de tolerâncias, produtos, linhas e utilizadores</p>
      </header>

      <!-- Abas -->
      <div class="flex gap-1 border-b border-gray-200 dark:border-slate-800 mb-6">
        <button @click="tab = 'formatos'" :class="tab === 'formatos' ? 'border-blue-600 text-blue-600 font-bold border-b-2' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-5 py-2.5 transition-colors text-sm flex items-center gap-2">
          <i class="ph-fill ph-squares-four"></i> Formatos e Limites
        </button>
        <button @click="tab = 'produtos'" :class="tab === 'produtos' ? 'border-blue-600 text-blue-600 font-bold border-b-2' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-5 py-2.5 transition-colors text-sm flex items-center gap-2">
          <i class="ph-fill ph-package"></i> Produtos e Linhas
        </button>
        <button @click="tab = 'usuarios'" :class="tab === 'usuarios' ? 'border-blue-600 text-blue-600 font-bold border-b-2' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-5 py-2.5 transition-colors text-sm flex items-center gap-2">
          <i class="ph-fill ph-users"></i> Usuários
          <span class="text-[10px] font-black bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">{{ usuarios.length }}</span>
        </button>
        <button @click="tab = 'configuracoes'" :class="tab === 'configuracoes' ? 'border-teal-600 text-teal-600 font-bold border-b-2' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'" class="px-5 py-2.5 transition-colors text-sm flex items-center gap-2">
          <i class="ph-fill ph-wave-sine"></i> Coef. Atrito
        </button>
      </div>

      <!-- ======================== FORMATOS ======================== -->
      <div v-if="tab === 'formatos'" class="space-y-4">
        <div class="flex justify-between items-center">
          <div class="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button @click="mostrarInativos = false" :class="!mostrarInativos ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'" class="px-4 py-1.5 rounded-md text-sm font-bold transition-all">Ativos</button>
            <button @click="mostrarInativos = true"  :class="mostrarInativos  ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-800 dark:text-white'  : 'text-gray-500 hover:text-gray-700'" class="px-4 py-1.5 rounded-md text-sm font-bold transition-all">Ver Arquivados</button>
          </div>
          <button @click="novoFormato" class="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 transition-all">
            <i class="ph-bold ph-plus-circle text-lg"></i> Criar Formato
          </button>
        </div>

        <!-- Tabela compacta -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                  <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Formato</th>
                  <!-- Empeno -->
                  <th class="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider" colspan="2">
                    <span class="flex items-center justify-center gap-1 text-blue-500"><i class="ph-fill ph-squares-four"></i> Lat Mín / Máx</span>
                  </th>
                  <th class="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider" colspan="2">
                    <span class="flex items-center justify-center gap-1 text-blue-400"><i class="ph-fill ph-crosshair"></i> Cent Mín / Máx</span>
                  </th>
                  <!-- Dimensional -->
                  <th class="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider" colspan="2">
                    <span class="flex items-center justify-center gap-1 text-orange-500"><i class="ph-fill ph-ruler"></i> Tam Mín / Máx</span>
                  </th>
                  <th class="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider" colspan="2">
                    <span class="flex items-center justify-center gap-1 text-amber-500"><i class="ph-fill ph-frame-corners"></i> Esq Mín / Máx</span>
                  </th>
                  <!-- Tamanho 2 — só retangulares -->
                  <th class="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider" colspan="2">
                    <span class="flex items-center justify-center gap-1 text-orange-400"><i class="ph-fill ph-ruler"></i> Tam2 Mín / Máx <span class="text-gray-400 font-normal normal-case">(rect.)</span></span>
                  </th>
                  <th class="px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                <tr v-for="fmt in formatosFiltrados" :key="fmt.id"
                  class="transition-colors hover:bg-gray-50/50 dark:hover:bg-slate-800/30"
                  :class="fmt.ativo === false ? 'opacity-50' : ''">

                  <!-- Nome -->
                  <td class="px-4 py-2 min-w-[110px]">
                    <div class="relative">
                      <span v-if="fmt.ativo === false" class="absolute -top-1 -right-1 text-[9px] font-black bg-gray-500 text-white px-1.5 py-0.5 rounded-full leading-none">ARQ</span>
                      <input v-model="fmt.nome" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                        class="w-full font-black text-blue-700 dark:text-blue-400 bg-transparent border border-transparent hover:border-gray-200 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 rounded-lg px-2 py-1 outline-none transition-all text-sm disabled:cursor-not-allowed" />
                    </div>
                  </td>

                  <!-- Lat Min/Max -->
                  <td class="px-1 py-2 w-20">
                    <input type="number" step="0.01" v-model="fmt.latMin" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                      class="w-full text-center py-1.5 px-1 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                  </td>
                  <td class="px-1 py-2 w-20">
                    <input type="number" step="0.01" v-model="fmt.latMax" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                      class="w-full text-center py-1.5 px-1 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                  </td>

                  <!-- Cent Min/Max -->
                  <td class="px-1 py-2 w-20">
                    <input type="number" step="0.01" v-model="fmt.centMin" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                      class="w-full text-center py-1.5 px-1 bg-blue-50/30 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-900/20 rounded-lg outline-none focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                  </td>
                  <td class="px-1 py-2 w-20">
                    <input type="number" step="0.01" v-model="fmt.centMax" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                      class="w-full text-center py-1.5 px-1 bg-blue-50/30 dark:bg-blue-900/5 border border-blue-100 dark:border-blue-900/20 rounded-lg outline-none focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                  </td>

                  <!-- Tam Min/Max -->
                  <td class="px-1 py-2 w-24">
                    <input type="number" step="0.01" v-model="fmt.tamanhoMin" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                      class="w-full text-center py-1.5 px-1 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                  </td>
                  <td class="px-1 py-2 w-24">
                    <input type="number" step="0.01" v-model="fmt.tamanhoMax" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                      class="w-full text-center py-1.5 px-1 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                  </td>

                  <!-- Esq Min/Max -->
                  <td class="px-1 py-2 w-20">
                    <input type="number" step="0.01" v-model="fmt.esquadroMin" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                      class="w-full text-center py-1.5 px-1 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                  </td>
                  <td class="px-1 py-2 w-20">
                    <input type="number" step="0.01" v-model="fmt.esquadroMax" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                      class="w-full text-center py-1.5 px-1 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                  </td>

                  <!-- Tamanho 2 — visível só em formatos retangulares -->
                  <template v-if="isRetangular(fmt.nome)">
                    <td class="px-1 py-2 w-24">
                      <input type="number" step="0.01" v-model="fmt.tamanhoMin2" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                        placeholder="—"
                        class="w-full text-center py-1.5 px-1 bg-orange-100/60 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 rounded-lg outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                    </td>
                    <td class="px-1 py-2 w-24">
                      <input type="number" step="0.01" v-model="fmt.tamanhoMax2" @change="salvar(fmt)" :disabled="fmt.ativo === false"
                        placeholder="—"
                        class="w-full text-center py-1.5 px-1 bg-orange-100/60 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 rounded-lg outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 font-bold text-gray-700 dark:text-gray-300 text-xs disabled:opacity-50 transition-all" />
                    </td>
                  </template>
                  <template v-else>
                    <td class="px-1 py-2 w-24">
                      <div class="w-full text-center py-1.5 text-xs text-gray-300 dark:text-slate-600 select-none">—</div>
                    </td>
                    <td class="px-1 py-2 w-24">
                      <div class="w-full text-center py-1.5 text-xs text-gray-300 dark:text-slate-600 select-none">—</div>
                    </td>
                  </template>

                  <!-- Ação -->
                  <td class="px-3 py-2 text-center">
                    <button v-if="fmt.ativo !== false" @click="arquivar('formatos', fmt)"
                      class="p-1.5 rounded-lg text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors" title="Arquivar">
                      <i class="ph-bold ph-archive text-base"></i>
                    </button>
                    <button v-else @click="restaurar('formatos', fmt)"
                      class="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 transition-colors" title="Restaurar">
                      <i class="ph-bold ph-arrow-counter-clockwise text-base"></i>
                    </button>
                  </td>
                </tr>

                <!-- Linha vazia -->
                <tr v-if="formatosFiltrados.length === 0">
                  <td colspan="13" class="px-4 py-12 text-center">
                    <i class="ph-fill ph-folder-open text-4xl text-gray-300 dark:text-slate-600 mb-2 block"></i>
                    <p class="text-gray-500 font-bold">Nenhum formato encontrado</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Legenda das cores -->
          <div class="px-4 py-3 border-t border-gray-100 dark:border-slate-800 flex flex-wrap gap-4 bg-gray-50/50 dark:bg-slate-800/20">
            <span class="text-[11px] font-bold text-gray-400 flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-blue-200 dark:bg-blue-900/60 inline-block"></span> Empeno Lateral</span>
            <span class="text-[11px] font-bold text-gray-400 flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30 inline-block"></span> Empeno Central</span>
            <span class="text-[11px] font-bold text-gray-400 flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900/30 inline-block"></span> Tamanho</span>
            <span class="text-[11px] font-bold text-gray-400 flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/30 inline-block"></span> Esquadro</span>
            <span class="text-[11px] font-bold text-gray-400 flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-orange-200 dark:bg-orange-900/50 inline-block"></span> Tam2 (só retangulares ex: 45x90)</span>
            <span class="text-[11px] text-gray-400 ml-auto">💡 Clique em qualquer campo para editar. A alteração é salva automaticamente.</span>
          </div>
        </div>
      </div>

      <!-- ======================== PRODUTOS E LINHAS ======================== -->
      <div v-if="tab === 'produtos'" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          <div class="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4 mb-4">
            <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2"><i class="ph-fill ph-package text-blue-500"></i> Produtos</h3>
            <button @click="novoItem('produtos')" class="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition-colors">+ Adicionar</button>
          </div>
          <!-- Busca de produtos -->
          <div class="relative mb-3">
            <i class="ph-bold ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input v-model="buscaProduto" type="text" placeholder="Buscar produto..."
              class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div v-if="!buscaProduto" class="text-center py-6 text-gray-400">
              <i class="ph-fill ph-magnifying-glass text-2xl mb-1 block text-gray-300 dark:text-slate-600"></i>
              <p class="text-xs">Digite para filtrar produtos</p>
            </div>
            <template v-else>
              <div v-for="p in produtosFiltradosAdmin" :key="p.id" class="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg group border border-transparent hover:border-gray-200 dark:hover:border-slate-700">
                <input v-model="p.nome" @change="salvarItem('produtos', p)" class="bg-transparent font-bold text-gray-700 dark:text-gray-300 outline-none w-full uppercase">
                <button @click="arquivar('produtos', p)" title="Arquivar Produto" class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="ph-bold ph-archive"></i></button>
              </div>
              <p v-if="produtosFiltradosAdmin.length === 0" class="text-center text-xs text-gray-400 py-4">Nenhum produto encontrado</p>
            </template>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          <div class="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4 mb-4">
            <h3 class="font-bold text-gray-800 dark:text-white flex items-center gap-2"><i class="ph-fill ph-factory text-emerald-500"></i> Linhas</h3>
            <button @click="novoItem('linhas')" class="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-200 transition-colors">+ Adicionar</button>
          </div>
          <div class="space-y-2">
            <div v-for="l in linhas.filter(x => x.ativo !== false)" :key="l.id" class="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg group border border-transparent hover:border-gray-200 dark:hover:border-slate-700">
              <input v-model="l.nome" @change="salvarItem('linhas', l)" class="bg-transparent font-bold text-gray-700 dark:text-gray-300 outline-none w-full uppercase">
              <button @click="arquivar('linhas', l)" title="Arquivar Linha" class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i class="ph-bold ph-archive"></i></button>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================== USUÁRIOS ======================== -->
      <div v-if="tab === 'usuarios'" class="space-y-6">
        
        <!-- Barra de controles -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <!-- Busca + filtro perfil -->
          <div class="flex items-center gap-3 flex-1 max-w-xl">
            <div class="relative flex-1">
              <i class="ph-bold ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                v-model="buscaUsuario"
                type="text"
                placeholder="Buscar por nome, login ou matrícula..."
                class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              v-model="filtroPerfil"
              class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os perfis</option>
              <option value="admin">Admin</option>
              <option value="inspetor">Inspetor</option>
              <option value="analista">Analista</option>
            </select>
          </div>

          <button
            @click="abrirModalUsuario(null)"
            class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <i class="ph-bold ph-user-plus text-lg"></i> Novo Usuário
          </button>
        </div>


        <!-- Tabela de usuários -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              <tr>
                <th class="p-4 font-bold text-left">Usuário</th>
                <th class="p-4 font-bold text-left hidden sm:table-cell">Login</th>
                <th class="p-4 font-bold text-left hidden md:table-cell">Matrícula</th>
                <th class="p-4 font-bold text-center">Perfil</th>
                <th class="p-4 font-bold text-center">Status</th>
                <th class="p-4 font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
              <tr v-if="!buscaUsuario && !filtroPerfil">
                <td colspan="6" class="p-10 text-center text-gray-400">
                  <i class="ph-fill ph-magnifying-glass text-3xl mb-2 block text-gray-300 dark:text-slate-600"></i>
                  <p class="font-bold text-gray-500">Use a busca para encontrar um usuário</p>
                  <p class="text-xs mt-1">Pesquise por nome, login ou matrícula</p>
                </td>
              </tr>
              <tr v-else-if="usuariosFiltrados.length === 0">
                <td colspan="6" class="p-10 text-center text-gray-400">
                  <i class="ph-fill ph-users text-3xl mb-2 block"></i>
                  <span class="font-bold">Nenhum usuário encontrado</span>
                </td>
              </tr>
              <tr
                v-for="u in usuariosFiltrados"
                :key="u.id"
                class="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors"
                :class="u.ativo === false ? 'opacity-50' : ''"
              >
                <!-- Nome -->
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                      :class="u.admin ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'"
                    >
                      {{ iniciais(u.nome) }}
                    </div>
                    <div>
                      <div class="font-bold text-gray-800 dark:text-white">{{ u.nome }}</div>
                      <div class="text-xs text-gray-400 sm:hidden">{{ u.login }}</div>
                    </div>
                  </div>
                </td>
                <!-- Login -->
                <td class="p-4 hidden sm:table-cell">
                  <span class="font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{{ u.login }}</span>
                </td>
                <!-- Matrícula -->
                <td class="p-4 hidden md:table-cell">
                  <span class="font-mono font-bold text-gray-600 dark:text-gray-400">{{ u.matricula }}</span>
                </td>
                <!-- Perfil -->
                <td class="p-4 text-center">
                  <span class="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    :class="u.admin
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : u.perfil === 'analista'
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'"
                  >
                    {{ u.admin ? 'Admin' : (u.perfil === 'analista' ? 'Analista' : 'Inspetor') }}
                  </span>
                </td>
                <!-- Status -->
                <td class="p-4 text-center">
                  <span class="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    :class="u.ativo === false
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'"
                  >
                    {{ u.ativo === false ? 'Desativado' : 'Ativo' }}
                  </span>
                </td>
                <!-- Ações -->
                <td class="p-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="abrirModalUsuario(u)"
                      class="p-2 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white transition-colors"
                      title="Editar"
                    ><i class="ph-bold ph-pencil-simple"></i></button>
                    <button
                      @click="toggleStatusUsuario(u)"
                      class="p-2 rounded-lg transition-colors"
                      :class="u.ativo === false
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 hover:text-white'
                        : 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-600 hover:text-white'"
                      :title="u.ativo === false ? 'Ativar' : 'Desativar'"
                    >
                      <i :class="u.ativo === false ? 'ph-bold ph-check-circle' : 'ph-bold ph-prohibit'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ======================== CONFIGURAÇÕES — COEFICIENTE DE ATRITO ======================== -->
      <div v-if="tab === 'configuracoes'" class="max-w-2xl space-y-6">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div class="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <i class="ph-fill ph-wave-sine text-teal-600 dark:text-teal-400 text-xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-800 dark:text-white">Classes AD — Ranges de Coeficiente de Atrito</h3>
              <p class="text-xs text-gray-400 mt-0.5">Configure o Mín e Máx de cada classe. O inspetor selecionará a classe na hora da medição.</p>
            </div>
          </div>

          <div v-if="carregandoAtrito" class="text-center py-8 text-gray-400 animate-pulse">
            A carregar configuração...
          </div>

          <div v-else class="space-y-3">
            <!-- Linha de cabeçalho -->
            <div class="grid grid-cols-12 gap-3 px-1">
              <div class="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Classe</div>
              <div class="col-span-4 text-[10px] font-bold text-red-400 uppercase tracking-wider text-center">Mínimo</div>
              <div class="col-span-4 text-[10px] font-bold text-emerald-500 uppercase tracking-wider text-center">Máximo</div>
              <div class="col-span-1"></div>
            </div>

            <!-- Uma linha por classe -->
            <div v-for="classe in classesAD" :key="classe.nome"
              class="grid grid-cols-12 gap-3 items-center p-3 rounded-xl border transition-all"
              :class="classeEditando === classe.nome
                ? 'border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-900/10'
                : 'border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20 hover:border-gray-200 dark:hover:border-slate-700'"
            >
              <!-- Nome da classe -->
              <div class="col-span-3 flex items-center gap-2">
                <span class="font-black text-sm px-2.5 py-1 rounded-lg"
                  :class="corClasse(classe.nome)"
                >{{ classe.nome }}</span>
              </div>

              <!-- Mínimo -->
              <div class="col-span-4">
                <input
                  type="number" step="0.001"
                  v-model.number="classe.min"
                  @focus="classeEditando = classe.nome"
                  @blur="classeEditando = ''"
                  class="w-full text-center bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800/50 rounded-lg px-2 py-2 text-sm font-bold text-red-700 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="0.000"
                />
              </div>

              <!-- Máximo -->
              <div class="col-span-4">
                <input
                  type="number" step="0.001"
                  v-model.number="classe.max"
                  @focus="classeEditando = classe.nome"
                  @blur="classeEditando = ''"
                  class="w-full text-center bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-2 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="0.000"
                />
              </div>

              <!-- Status de preenchimento -->
              <div class="col-span-1 flex justify-center">
                <i v-if="classe.min !== null && classe.max !== null && classe.min < classe.max"
                  class="ph-fill ph-check-circle text-emerald-500 text-xl"></i>
                <i v-else class="ph-fill ph-circle text-gray-300 dark:text-slate-600 text-xl"></i>
              </div>
            </div>

            <!-- Botão guardar -->
            <div class="pt-2">
              <button
                @click="salvarConfigAtrito"
                :disabled="salvandoAtrito"
                class="w-full py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i v-if="salvandoAtrito" class="ph-bold ph-spinner animate-spin"></i>
                <i v-else class="ph-bold ph-floppy-disk"></i>
                {{ salvandoAtrito ? 'A guardar...' : 'Guardar Todas as Classes' }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>

  <!-- ======================== MODAL USUÁRIO ======================== -->
  <Transition name="fade">
    <div v-if="modalUsuarioAberto" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4" @click.self="fecharModalUsuario">
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        
        <!-- Cabeçalho -->
        <div class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center"
          :class="editandoUsuario ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-blue-50 dark:bg-blue-900/10'"
        >
          <h2 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <i :class="editandoUsuario ? 'ph-bold ph-pencil-simple text-amber-500' : 'ph-bold ph-user-plus text-blue-500'"></i>
            {{ editandoUsuario ? 'Editar Usuário' : 'Novo Usuário' }}
          </h2>
          <button @click="fecharModalUsuario" class="text-gray-400 hover:text-red-500 p-2 rounded-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
            <i class="ph-bold ph-x"></i>
          </button>
        </div>

        <!-- Formulário -->
        <div class="p-6 space-y-4">
          <div>
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Nome Completo</label>
            <input
              v-model="formUsuario.nome"
              type="text"
              placeholder="Ex: João Silva"
              class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Login (usuário)</label>
            <input
              v-model="formUsuario.login"
              type="text"
              placeholder="Ex: joao.silva"
              class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <i class="ph-fill ph-info text-blue-400"></i>
              Email gerado: <strong class="text-blue-500">{{ formUsuario.login || 'login' }}{{ DOMINIO }}</strong>
            </p>
          </div>

          <div>
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Matrícula (senha)</label>
            <input
              v-model="formUsuario.matricula"
              type="text"
              placeholder="Ex: 4017"
              class="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p v-if="editandoUsuario" class="text-[11px] text-amber-500 mt-1 flex items-center gap-1">
              <i class="ph-fill ph-warning"></i>
              Alterar a matrícula atualiza o Firestore. O usuário deve usar a matrícula anterior para login até a conta ser remigrada.
            </p>
          </div>

          <div>
            <label class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Perfil</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="perfil in ['inspetor', 'analista', 'admin']"
                :key="perfil"
                type="button"
                @click="formUsuario.perfil = perfil; formUsuario.admin = (perfil === 'admin')"
                class="py-2.5 rounded-xl text-sm font-bold border-2 transition-all capitalize"
                :class="formUsuario.perfil === perfil
                  ? perfil === 'admin' ? 'bg-blue-600 text-white border-blue-600'
                  : perfil === 'analista' ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-gray-50 dark:bg-slate-800 text-gray-500 border-gray-200 dark:border-slate-700 hover:border-blue-400'"
              >
                <i class="block text-lg mb-0.5"
                  :class="perfil === 'admin' ? 'ph-fill ph-crown' : perfil === 'analista' ? 'ph-fill ph-chart-bar' : 'ph-fill ph-magnifying-glass'"
                ></i>
                {{ perfil === 'admin' ? 'Admin' : perfil === 'analista' ? 'Analista' : 'Inspetor' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Rodapé -->
        <div class="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 flex gap-3 justify-end">
          <button @click="fecharModalUsuario" class="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-gray-300 transition-all">
            Cancelar
          </button>
          <button
            @click="salvarUsuario"
            :disabled="salvandoUsuario || !formUsuario.nome || !formUsuario.login || !formUsuario.matricula"
            class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <i v-if="salvandoUsuario" class="ph-bold ph-spinner animate-spin"></i>
            <i v-else class="ph-bold ph-floppy-disk"></i>
            {{ salvandoUsuario ? 'A guardar...' : editandoUsuario ? 'Guardar Alterações' : 'Criar Usuário' }}
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { collection, onSnapshot, addDoc, updateDoc, doc, query, orderBy, getDocs, where, setDoc, limit } from 'firebase/firestore'
import { db } from '../firebase'
import Sidebar from '../components/Sidebar.vue'
import Swal from 'sweetalert2'
import { useReferenciasStore } from '../stores/referencias'

const refStore = useReferenciasStore()

const DOMINIO = '@qualitron.com.br'

const tab = ref('formatos')
const mostrarInativos = ref(false)

const formatos = ref([])
const produtos = ref([])
const linhas  = ref([])
const usuarios = ref([])

// ─── Filtros da aba Usuários ──────────────────────────────────────────────────
const buscaUsuario  = ref('')
const filtroPerfil  = ref('')
const buscaProduto  = ref('')

const produtosFiltradosAdmin = computed(() => {
  const ativos = produtos.value.filter(p => p.ativo !== false)
  if (!buscaProduto.value) return ativos
  const t = buscaProduto.value.toLowerCase()
  return ativos.filter(p => (p.nome || '').toLowerCase().includes(t))
})

const usuariosFiltrados = computed(() => {
  // Só exibe resultados quando há busca digitada
  if (!buscaUsuario.value && !filtroPerfil.value) return []

  let lista = [...usuarios.value]

  if (buscaUsuario.value) {
    const t = buscaUsuario.value.toLowerCase()
    lista = lista.filter(u =>
      (u.nome      || '').toLowerCase().includes(t) ||
      (u.login     || '').toLowerCase().includes(t) ||
      (u.matricula || '').toLowerCase().includes(t)
    )
  }

  if (filtroPerfil.value === 'admin') {
    lista = lista.filter(u => u.admin === true)
  } else if (filtroPerfil.value === 'analista') {
    lista = lista.filter(u => u.perfil === 'analista' && !u.admin)
  } else if (filtroPerfil.value === 'inspetor') {
    lista = lista.filter(u => !u.admin && u.perfil !== 'analista')
  }

  return lista.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
})

const iniciais = (nome = '') => {
  const partes = nome.trim().split(' ')
  if (partes.length >= 2) return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
  return nome.slice(0, 2).toUpperCase()
}

// ─── Modal de Usuário ─────────────────────────────────────────────────────────
const modalUsuarioAberto = ref(false)
const editandoUsuario    = ref(null) // null = criando, objeto = editando
const salvandoUsuario    = ref(false)

const formUsuario = ref({ nome: '', login: '', matricula: '', perfil: 'inspetor', admin: false })

const abrirModalUsuario = (usuario) => {
  if (usuario) {
    editandoUsuario.value = usuario
    formUsuario.value = {
      nome:      usuario.nome      || '',
      login:     usuario.login     || '',
      matricula: usuario.matricula || '',
      perfil:    usuario.admin ? 'admin' : (usuario.perfil || 'inspetor'),
      admin:     usuario.admin     || false,
    }
  } else {
    editandoUsuario.value = null
    formUsuario.value = { nome: '', login: '', matricula: '', perfil: 'inspetor', admin: false }
  }
  modalUsuarioAberto.value = true
}

const fecharModalUsuario = () => {
  modalUsuarioAberto.value = false
  editandoUsuario.value = null
}

const salvarUsuario = async () => {
  if (!formUsuario.value.nome || !formUsuario.value.login || !formUsuario.value.matricula) return

  const loginLimpo = formUsuario.value.login.toLowerCase().trim()

  // Verifica login duplicado ao criar
  if (!editandoUsuario.value) {
    const duplicado = usuarios.value.some(u => u.login === loginLimpo)
    if (duplicado) {
      Swal.fire('Login em uso', `O login "${loginLimpo}" já existe. Escolha outro.`, 'warning')
      return
    }
  }

  salvandoUsuario.value = true
  try {
    const dados = {
      nome:      formUsuario.value.nome.trim(),
      login:     loginLimpo,
      matricula: formUsuario.value.matricula.trim(),
      admin:     formUsuario.value.admin,
      perfil:    formUsuario.value.perfil,
    }

    if (editandoUsuario.value) {
      await updateDoc(doc(db, 'usuarios', editandoUsuario.value.id), dados)
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Usuário atualizado', showConfirmButton: false, timer: 2000 })
    } else {
      await addDoc(collection(db, 'usuarios'), { ...dados, ativo: true })
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Usuário criado com sucesso', showConfirmButton: false, timer: 2000 })
    }

    fecharModalUsuario()
  } catch (e) {
    console.error(e)
    Swal.fire('Erro', 'Não foi possível guardar o usuário.', 'error')
  } finally {
    salvandoUsuario.value = false
  }
}

const toggleStatusUsuario = async (usuario) => {
  const ativando = usuario.ativo === false
  const { isConfirmed } = await Swal.fire({
    title: ativando ? 'Ativar usuário?' : 'Desativar usuário?',
    html: ativando
      ? `<strong>${usuario.nome}</strong> voltará a ter acesso ao sistema.`
      : `<strong>${usuario.nome}</strong> perderá o acesso ao sistema.`,
    icon: ativando ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonColor: ativando ? '#10B981' : '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: ativando ? 'Sim, ativar' : 'Sim, desativar',
    cancelButtonText: 'Cancelar',
  })

  if (!isConfirmed) return

  await updateDoc(doc(db, 'usuarios', usuario.id), { ativo: !ativando ? false : true })
  Swal.fire({
    toast: true, position: 'top-end', icon: 'success',
    title: ativando ? 'Usuário ativado' : 'Usuário desativado',
    showConfirmButton: false, timer: 2000,
  })
}

// ─── Configuração Coeficiente de Atrito — Classes AD ─────────────────────────
const NOMES_CLASSES = ['AD', 'AD2', 'AD3', 'AD4', 'AD4+']

const carregandoAtrito = ref(true)
const salvandoAtrito   = ref(false)
const classeEditando   = ref('')
let   configAtritoId   = null

// Array reativo com min/max de cada classe
const classesAD = ref(NOMES_CLASSES.map(nome => ({ nome, min: null, max: null })))

const corClasse = (nome) => {
  const mapa = {
    'AD':   'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200',
    'AD2':  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'AD3':  'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
    'AD4':  'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    'AD4+': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  }
  return mapa[nome] || 'bg-gray-100 text-gray-700'
}

const carregarConfigAtrito = async () => {
  carregandoAtrito.value = true
  const snap = await getDocs(query(collection(db, 'configuracoes'), where('tipo', '==', 'atrito'), limit(1)))
  if (!snap.empty) {
    const d = snap.docs[0]
    configAtritoId = d.id
    const classes = d.data().classes || {}
    classesAD.value = NOMES_CLASSES.map(nome => ({
      nome,
      min: classes[nome]?.min ?? null,
      max: classes[nome]?.max ?? null,
    }))
  }
  carregandoAtrito.value = false
}

const salvarConfigAtrito = async () => {
  // Valida: para classes preenchidas, min deve ser < max
  for (const c of classesAD.value) {
    if (c.min !== null && c.max !== null && Number(c.min) >= Number(c.max)) {
      Swal.fire('Atenção', `Classe ${c.nome}: o valor mínimo deve ser menor que o máximo.`, 'warning')
      return
    }
  }
  salvandoAtrito.value = true
  try {
    // Monta objeto { AD: { min, max }, AD2: { min, max }, ... }
    const classes = {}
    classesAD.value.forEach(c => {
      if (c.min !== null && c.max !== null) {
        classes[c.nome] = { min: Number(c.min), max: Number(c.max) }
      }
    })
    const dados = { tipo: 'atrito', classes }
    if (configAtritoId) {
      await updateDoc(doc(db, 'configuracoes', configAtritoId), dados)
    } else {
      const novo = await addDoc(collection(db, 'configuracoes'), dados)
      configAtritoId = novo.id
    }
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Classes AD guardadas!', showConfirmButton: false, timer: 2000 })
  } catch (e) {
    console.error(e)
    Swal.fire('Erro', 'Não foi possível guardar.', 'error')
  } finally {
    salvandoAtrito.value = false
  }
}

// ─── Formatos / Produtos / Linhas ─────────────────────────────────────────────
const formatosFiltrados = computed(() => {
  if (mostrarInativos.value) return formatos.value.filter(f => f.ativo === false)
  return formatos.value.filter(f => f.ativo !== false)
})

let _unsubFmt  = null, _unsubProd = null, _unsubLin = null, _unsubUsr = null

onMounted(() => {
  _unsubFmt  = onSnapshot(collection(db, 'formatos'), s => formatos.value = s.docs.map(d => ({ id: d.id, ...d.data() })))
  _unsubProd = onSnapshot(collection(db, 'produtos'), s => produtos.value = s.docs.map(d => ({ id: d.id, ...d.data() })))
  _unsubLin  = onSnapshot(collection(db, 'linhas'),   s => linhas.value   = s.docs.map(d => ({ id: d.id, ...d.data() })))
  _unsubUsr  = onSnapshot(query(collection(db, 'usuarios'), orderBy('nome')), s => usuarios.value = s.docs.map(d => ({ id: d.id, ...d.data() })))
  carregarConfigAtrito()
})

onUnmounted(() => {
  if (_unsubFmt)  _unsubFmt()
  if (_unsubProd) _unsubProd()
  if (_unsubLin)  _unsubLin()
  if (_unsubUsr)  _unsubUsr()
})

const novoFormato = async () => {
  try {
    await addDoc(collection(db, 'formatos'), {
      nome: 'NOVO FORMATO', ativo: true,
      latMin: -0.8, latMax: 0.8, centMin: -0.8, centMax: 0.8,
      tamanhoMin: 599, tamanhoMax: 601, esquadroMin: 0, esquadroMax: 1,
      tamanhoMin2: null, tamanhoMax2: null,
    })
    refStore.invalidar()
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Formato criado', showConfirmButton: false, timer: 1500 })
  } catch (e) { Swal.fire('Erro', 'Não foi possível criar', 'error') }
}

// Detecta se o formato é retangular (lados diferentes), ex: 45x90, 26x106
const isRetangular = (nome) => {
  if (!nome) return false
  const m = String(nome).toLowerCase().match(/^(\d+[\.,]?\d*)x(\d+[\.,]?\d*)/)
  if (!m) return false
  return parseFloat(m[1].replace(',', '.')) !== parseFloat(m[2].replace(',', '.'))
}

const salvar = async (f) => {
  if (f.ativo === false) return
  const { id, ...data } = f
  await updateDoc(doc(db, 'formatos', id), data)
  refStore.invalidar()
}

const novoItem = async (colecao) => {
  const nome = prompt(`Nome para nova entrada em ${colecao}:`)
  if (nome) await addDoc(collection(db, colecao), { nome: nome.toUpperCase(), ativo: true })
}

const salvarItem = async (colecao, item) => {
  await updateDoc(doc(db, colecao, item.id), { nome: item.nome.toUpperCase() })
}

const arquivar = async (colecao, item) => {
  const texto = colecao === 'formatos'
    ? 'Os inspetores deixarão de ver este formato, mas ele não será apagado.'
    : 'Este item não aparecerá mais nas listas.'
  if (confirm(`Arquivar?\n\n${texto}`)) {
    await updateDoc(doc(db, colecao, item.id), { ativo: false })
    if (colecao === 'formatos') refStore.invalidar()
  }
}

const restaurar = async (colecao, item) => {
  await updateDoc(doc(db, colecao, item.id), { ativo: true })
  if (colecao === 'formatos') refStore.invalidar()
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Restaurado com sucesso', showConfirmButton: false, timer: 1500 })
}
</script>

<style scoped>
@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>