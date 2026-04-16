import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDate = (d) => {
  if (!d) return null
  if (typeof d.toDate === 'function') return d.toDate()
  if (d.seconds) return new Date(d.seconds * 1000)
  return null
}
const fmtData  = (d) => toDate(d)?.toLocaleDateString('pt-BR') ?? '--/--/----'
const fmtHora  = (d) => toDate(d)?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) ?? '--:--'
const fmtV     = (v, dec = 2) => (v !== null && v !== '' && !isNaN(Number(v))) ? Number(v).toFixed(dec) : '--'
const dentroRange = (v, min, max) => v !== null && v !== '' && !isNaN(Number(v)) && Number(v) >= min && Number(v) <= max
const foraRange   = (v, min, max) => v !== null && v !== '' && !isNaN(Number(v)) && (Number(v) < min || Number(v) > max)

const nomePeriodo = (fg) => {
  if (fg.periodo === '24h')    return 'Ultimas_24h'
  if (fg.periodo === '7d')     return 'Ultimos_7_dias'
  if (fg.periodo === '30d')    return 'Ultimos_30_dias'
  if (fg.periodo === '90d')    return 'Ultimos_90_dias'
  if (fg.periodo === 'custom') return `${fg.dataInicio}_a_${fg.dataFim}`
  return 'Personalizado'
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXCEL
// ═══════════════════════════════════════════════════════════════════════════════

// ── Empeno ────────────────────────────────────────────────────────────────────
const excelEmpeno = (lista) => {
  const rows = []
  lista.forEach(i => {
    const lim = i.limitesSnapshot || {}
    const base = {
      'Data': fmtData(i.dataHora), 'Hora': fmtHora(i.dataHora),
      'Resultado': i.resultado ?? '', 'Inspetor': i.inspetor ?? '',
      'Linha': i.linha ?? '', 'Produto': i.produto ?? '',
      'Lote': i.lote ?? '', 'Formato': i.formatoNome ?? '',
      'Pós Folga': i.posFolga ?? '', 'Tratativa': i.tratativa ?? '',
      'Lat.Min': lim.latMin ?? '', 'Lat.Max': lim.latMax ?? '',
      'Cent.Min': lim.centMin ?? '', 'Cent.Max': lim.centMax ?? '',
    }
    const pecas = i.pecas || []
    if (!pecas.length) { rows.push(base); return }
    pecas.forEach((p, idx) => {
      const lat = p.laterais || {}
      const cen = p.centrais || {}
      rows.push({
        ...base,
        'Peça': idx + 1,
        'Lat A': fmtV(lat.A), 'Lat B': fmtV(lat.B),
        'Lat C': fmtV(lat.C), 'Lat D': fmtV(lat.D),
        'Cent 1': fmtV(cen['1']), 'Cent 2': fmtV(cen['2']),
      })
    })
  })
  return rows
}

// ── Dimensional ───────────────────────────────────────────────────────────────
const excelDimensional = (lista) => {
  const rows = []
  lista.forEach(d => {
    const lim = d.limitesSnapshot || {}
    const base = {
      'Data': fmtData(d.dataHora), 'Hora': fmtHora(d.dataHora),
      'Resultado': d.resultado ?? '', 'Inspetor': d.inspetor ?? '',
      'Linha': d.linha ?? '', 'Produto': d.produto ?? '',
      'Lote': d.lote ?? '', 'Formato': d.formatoNome ?? '',
      'Esp. Declarada': d.espessuraDeclarada ?? '',
      'Tam.Min': lim.tamanhoMin ?? '', 'Tam.Max': lim.tamanhoMax ?? '',
      'Esq.Min': lim.esquadroMin ?? '', 'Esq.Max': lim.esquadroMax ?? '',
    }
    // Espessura por peça
    ;(d.pecasEspessura || []).forEach((p, pi) => {
      ;(p.pontos || []).forEach((pt, pti) => {
        rows.push({ ...base, 'Tipo': 'Espessura', 'Peça': pi + 1, 'Prensa': p.prensa ?? '', 'Cavidade': p.cavidade ?? '', 'Ponto': pti + 1, 'Valor': fmtV(pt, 3) })
      })
    })
    // Tamanho e esquadro por retífica
    ;(d.medicoesTE || []).forEach((m, mi) => {
      rows.push({ ...base, 'Tipo': 'Tam/Esq', 'Retífica': m.retifica ?? '', 'Tamanho': fmtV(m.tamanho, 2), 'Esquadro': fmtV(m.esquadro, 2) })
    })
    if (!d.pecasEspessura?.length && !d.medicoesTE?.length) rows.push(base)
  })
  return rows
}

// ── Atrito ────────────────────────────────────────────────────────────────────
const excelAtrito = (lista) => {
  const rows = []
  lista.forEach(a => {
    const lim = a.limitesSnapshot || {}
    const base = {
      'Data': fmtData(a.dataHora), 'Hora': fmtHora(a.dataHora),
      'Resultado': a.resultado ?? '', 'Classe AD': a.classeAD ?? '',
      'Inspetor': a.inspetor ?? '', 'Linha': a.linha ?? '',
      'Produto': a.produto ?? '', 'Lote': a.lote ?? '',
      'Média': fmtV(a.media, 3),
      'Limite Mín': lim.min ?? '', 'Limite Máx': lim.max ?? '',
    }
    ;(a.medidas || []).forEach((m, idx) => {
      rows.push({ ...base, 'Medida Nº': idx + 1, 'Valor': fmtV(m, 3) })
    })
    if (!a.medidas?.length) rows.push(base)
  })
  return rows
}

// ── Relatórios ────────────────────────────────────────────────────────────────
const excelRelatorio = (lista) => {
  const rows = []
  const situacaoTexto = (s) => ({ verde: 'Liberado', amarela: 'Ponto de Melhora', laranja: 'Com Documento', vermelha: 'Com Restrição' }[s] ?? s ?? '')
  lista.forEach(r => {
    const base = { 'Data': r.data ?? fmtData(r.dataHora), 'Hora': fmtHora(r.dataHora), 'Responsável': r.responsavel ?? '', 'Equipe': r.equipe ?? '' }
    if (!r.linhas?.length) { rows.push(base); return }
    r.linhas.forEach(l => {
      if (!l.lotes?.length) { rows.push({ ...base, 'Linha': l.linha ?? '', 'Referência': l.referencia ?? '', 'Formato': l.formato ?? '' }); return }
      l.lotes.forEach(lt => {
        rows.push({ ...base, 'Linha': l.linha ?? '', 'Referência': l.referencia ?? '', 'Formato': l.formato ?? '', 'Lote': lt.lote ?? '', 'Situação': situacaoTexto(lt.situacao), 'Observação': lt.observacao ?? '' })
      })
    })
  })
  return rows
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF — Layout Profissional
// ═══════════════════════════════════════════════════════════════════════════════

// ── Paleta de Cores ────────────────────────────────────────────────────────────
const C = {
  azul:        [37,  99,  235],
  azulEscuro:  [15,  23,  42],   // quase preto azulado
  azulMedio:   [30,  58,  138],  // azul navy
  azulClaro:   [219, 234, 254],
  azulAcento:  [96,  165, 250],  // azul claro para detalhes
  verde:       [5,   150, 105],
  verdeClaro:  [209, 250, 229],
  vermelho:    [220, 38,  38],
  vermelhoClr: [254, 226, 226],
  laranja:     [234, 88,  12],
  laranjaClr:  [255, 237, 213],
  amarelo:     [161, 98,  7],
  amareloClr:  [254, 249, 195],
  cinzaEsc:    [30,  41,  59],
  cinzaMed:    [71,  85,  105],
  cinzaClaro:  [148, 163, 184],
  cinzaFundo:  [241, 245, 249],
  cinzaLinha:  [226, 232, 240],
  cinzaHead:   [51,  65,  85],   // cabeçalho da tabela
  branco:      [255, 255, 255],
  brancoF:     [248, 250, 252],
}

// ── Funções de Desenho ─────────────────────────────────────────────────────────
const rect = (doc, x, y, w, h, cor, r = 0) => {
  doc.setFillColor(...cor)
  if (r > 0) doc.roundedRect(x, y, w, h, r, r, 'F')
  else       doc.rect(x, y, w, h, 'F')
}
const rectBorda = (doc, x, y, w, h, corFill, corBorda, lw = 0.3, r = 0) => {
  doc.setFillColor(...corFill)
  doc.setDrawColor(...corBorda)
  doc.setLineWidth(lw)
  if (r > 0) doc.roundedRect(x, y, w, h, r, r, 'FD')
  else       doc.rect(x, y, w, h, 'FD')
}
const linha = (doc, x1, y1, x2, y2, cor, lw = 0.3) => {
  doc.setDrawColor(...cor); doc.setLineWidth(lw); doc.line(x1, y1, x2, y2)
}
const texto = (doc, t, x, y, size, cor, bold = false, align = 'left') => {
  doc.setFontSize(size); doc.setTextColor(...cor)
  doc.setFont('helvetica', bold ? 'bold' : 'normal')
  doc.text(String(t), x, y, { align })
}

// ── Cabeçalho redesenhado ──────────────────────────────────────────────────────
const cabecalhoPDF = (doc, nomeAba, periodo, filtroGlobal, total, aprovados, reprovados) => {
  const W = doc.internal.pageSize.getWidth()

  // ── Fundo escuro do topo ──
  rect(doc, 0, 0, W, 28, C.azulEscuro)

  // Faixa de acento azul na borda superior
  rect(doc, 0, 0, W, 1.5, C.azul)

  // Logo "QC" com borda arredondada
  rectBorda(doc, 10, 5.5, 16, 16, C.azul, C.azulAcento, 0.5, 3)
  texto(doc, 'QC', 18, 16, 10, C.branco, true, 'center')

  // Nome da empresa
  texto(doc, 'QualityControl', 30, 11, 11, C.branco, true)
  texto(doc, 'Empeno Pro — Sistema de Gestão de Qualidade', 30, 17, 7, C.azulAcento)

  // Separador vertical
  doc.setDrawColor(...C.azulAcento); doc.setLineWidth(0.3)
  doc.line(W / 2, 6, W / 2, 22)

  // Lado direito: tipo de relatório + período
  texto(doc, `Relatório de ${nomeAba.replace(/_/g, ' ')}`, W / 2 + 5, 12, 10, C.branco, true)
  texto(doc, `Período: ${periodo.replace(/_/g, ' ')}`, W / 2 + 5, 19, 7.5, C.azulAcento)
  texto(doc, new Date().toLocaleString('pt-BR'), W - 10, 19, 6.5, C.cinzaClaro, false, 'right')

  // ── Cards de KPI ──
  const cy   = 32
  const cardW = (W - 20 - 9) / 4  // 4 cards com 3px de gap entre eles

  const cards = [
    { label: 'TOTAL',          valor: total,      sub: 'registros',  cor: C.azul,     fundo: C.azulClaro,   borda: C.azul     },
    { label: 'APROVADOS',      valor: aprovados,  sub: 'inspeções',  cor: C.verde,    fundo: C.verdeClaro,  borda: C.verde    },
    { label: 'REPROVADOS',     valor: reprovados, sub: 'inspeções',  cor: C.vermelho, fundo: C.vermelhoClr, borda: C.vermelho },
    { label: 'TAXA APROVAÇÃO', valor: total > 0 ? Math.round((aprovados / total) * 100) + '%' : '—', sub: 'do período', cor: aprovados/total >= 0.9 ? C.verde : aprovados/total >= 0.7 ? C.amarelo : C.vermelho, fundo: C.brancoF, borda: C.cinzaLinha },
  ]

  cards.forEach((c, i) => {
    const cx = 10 + i * (cardW + 3)
    // Sombra suave
    rect(doc, cx + 0.5, cy + 0.5, cardW, 20, [200, 210, 220], 2)
    // Card
    rectBorda(doc, cx, cy, cardW, 20, c.fundo, c.borda, 0.4, 2)
    // Borda esquerda colorida grossa
    rect(doc, cx, cy, 2.5, 20, c.cor, 1)
    // Label
    texto(doc, c.label, cx + 6, cy + 7, 5.5, C.cinzaMed, true)
    // Valor grande
    texto(doc, String(c.valor), cx + 6, cy + 16, 14, c.cor, true)
    // Sub-label
    texto(doc, c.sub, cx + cardW - 4, cy + 18, 5.5, C.cinzaClaro, false, 'right')
  })

  // ── Linha divisória antes da tabela ──
  const sepY = cy + 25
  linha(doc, 10, sepY, W - 10, sepY, C.cinzaLinha, 0.5)
  texto(doc, 'DADOS DA INSPEÇÃO', 10, sepY + 5, 6, C.cinzaMed, true)
  texto(doc, `${total} registro${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`, W - 10, sepY + 5, 6, C.cinzaClaro, false, 'right')

  return sepY + 8  // startY da tabela
}

// ── Rodapé redesenhado ─────────────────────────────────────────────────────────
const rodapePDF = (doc, nomeAba, periodo) => {
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()

    // Faixa de fundo do rodapé
    rect(doc, 0, H - 12, W, 12, C.azulEscuro)
    rect(doc, 0, H - 12, W, 0.8, C.azul)  // linha de acento

    texto(doc, 'QualityControl — Empeno Pro', 10, H - 6.5, 6.5, C.azulAcento, true)
    texto(doc, `${nomeAba.replace(/_/g, ' ')}  ·  ${periodo.replace(/_/g, ' ')}`, 10, H - 2.5, 5.5, C.cinzaClaro)

    // Legenda de cores (só na primeira página)
    if (i === 1) {
      texto(doc, '* Valor fora do range tolerado', W / 2, H - 4.5, 5.5, [254, 202, 202], false, 'center')
    }

    texto(doc, `Página ${i} de ${total}`, W - 10, H - 4.5, 6.5, C.branco, true, 'right')
  }
}

// ── Estilos base das tabelas ───────────────────────────────────────────────────
const baseTableStyles = {
  styles: {
    fontSize: 7,
    cellPadding: { top: 2.8, right: 3, bottom: 2.8, left: 3 },
    textColor: C.cinzaEsc,
    lineColor: C.cinzaLinha,
    lineWidth: 0.15,
    font: 'helvetica',
  },
  headStyles: {
    fillColor: C.cinzaHead,
    textColor: C.branco,
    fontStyle: 'bold',
    fontSize: 6.5,
    cellPadding: { top: 3.5, right: 3, bottom: 3.5, left: 3 },
    halign: 'center',
  },
  alternateRowStyles: { fillColor: C.brancoF },
  tableLineColor: C.cinzaLinha,
  tableLineWidth: 0.15,
  margin: { left: 10, right: 10 },
}

// Aplica cor de resultado na célula
const aplicarCorResultado = (data) => {
  const val = String(data.cell.raw ?? '')
  if (val === 'Aprovado' || val === 'OK') {
    data.cell.styles.textColor = C.verde
    data.cell.styles.fontStyle = 'bold'
  }
  if (val === 'Reprovado' || val === 'FORA') {
    data.cell.styles.textColor = C.vermelho
    data.cell.styles.fontStyle = 'bold'
    data.cell.styles.fillColor = C.vermelhoClr
  }
}

// ── PDF Empeno ─────────────────────────────────────────────────────────────────
const pdfEmpeno = (doc, lista, startY) => {
  const head = [['Data', 'Hora', 'Resultado', 'Inspetor', 'Linha', 'Produto', 'Lote', 'Peça', 'Lat A', 'Lat B', 'Lat C', 'Lat D', 'Cent 1', 'Cent 2']]
  const body = []
  const cores = []
  // índices de linha que iniciam um novo grupo (receberão borda superior destacada)
  const iniciosGrupo = []

  lista.forEach(i => {
    const lim  = i.limitesSnapshot || {}
    const pecas = i.pecas || []
    // base: só aparece na 1ª linha de cada inspeção
    const base = [fmtData(i.dataHora), fmtHora(i.dataHora), i.resultado ?? '', i.inspetor ?? '', i.linha ?? '', i.produto ?? '', i.lote ?? '']
    const vazio = ['', '', '', '', '', '', '']

    if (!pecas.length) {
      iniciosGrupo.push(body.length)
      body.push([...base, '', '', '', '', '', '', ''])
      return
    }
    pecas.forEach((p, idx) => {
      const lat = p.laterais || {}
      const cen = p.centrais || {}
      const ri  = body.length
      if (idx === 0) iniciosGrupo.push(ri)
      // 1ª peça: mostra base; demais: deixa em branco
      const rowBase = idx === 0 ? base : vazio
      body.push([...rowBase, idx + 1, fmtV(lat.A), fmtV(lat.B), fmtV(lat.C), fmtV(lat.D), fmtV(cen['1']), fmtV(cen['2'])])
      if (lim.latMin != null) {
        [lat.A, lat.B, lat.C, lat.D].forEach((v, ci) => { if (foraRange(v, lim.latMin, lim.latMax)) cores.push({ ri, ci: ci + 8 }) })
        ;[cen['1'], cen['2']].forEach((v, ci) => { if (foraRange(v, lim.centMin, lim.centMax)) cores.push({ ri, ci: ci + 12 }) })
      }
    })
  })

  autoTable(doc, {
    ...baseTableStyles, startY, head, body,
    columnStyles: {
      2:{halign:'center'}, 7:{halign:'center'},
      8:{halign:'center'}, 9:{halign:'center'}, 10:{halign:'center'},
      11:{halign:'center'}, 12:{halign:'center'}, 13:{halign:'center'}
    },
    didParseCell(data) {
      if (data.section !== 'body') return
      aplicarCorResultado(data)
      if (cores.some(c => c.ri === data.row.index && c.ci === data.column.index)) {
        data.cell.styles.textColor = C.vermelho
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = C.vermelhoClr
      }
      // Borda superior destacada no início de cada grupo
      if (iniciosGrupo.includes(data.row.index)) {
        data.cell.styles.lineColor = C.cinzaMed
        data.cell.styles.lineWidth = { top: 0.4, right: 0.15, bottom: 0.15, left: 0.15 }
      }
    },
  })
}

// ── PDF Dimensional ────────────────────────────────────────────────────────────
const pdfDimensional = (doc, lista, startY) => {
  const head = [['Data', 'Hora', 'Resultado', 'Inspetor', 'Linha', 'Produto', 'Lote', 'Tipo', 'Peça/Ret.', 'Prensa', 'Cav.', 'Ponto', 'Valor', 'Status']]
  const body = []
  const cores = []
  const iniciosGrupo = []

  lista.forEach(d => {
    const lim    = d.limitesSnapshot || {}
    const espMin = d.espessuraDeclarada ? d.espessuraDeclarada * 0.95 : null
    const espMax = d.espessuraDeclarada ? d.espessuraDeclarada * 1.05 : null
    const base  = [fmtData(d.dataHora), fmtHora(d.dataHora), d.resultado ?? '', d.inspetor ?? '', d.linha ?? '', d.produto ?? '', d.lote ?? '']
    const vazio = ['', '', '', '', '', '', '']

    let primeiraLinhaDaInspecao = true
    const pushRow = (extra, foraIdxs) => {
      const ri = body.length
      if (primeiraLinhaDaInspecao) { iniciosGrupo.push(ri); primeiraLinhaDaInspecao = false }
      const rowBase = ri === iniciosGrupo[iniciosGrupo.length - 1] ? base : vazio
      body.push([...rowBase, ...extra])
      foraIdxs.forEach(ci => cores.push({ ri, ci }))
    }

    ;(d.pecasEspessura || []).forEach((p, pi) => {
      ;(p.pontos || []).forEach((pt, pti) => {
        const fora = espMin != null && foraRange(pt, espMin, espMax)
        pushRow(['Espessura', `P${pi+1}`, p.prensa??'', p.cavidade??'', `Pt ${pti+1}`, fmtV(pt,3), fora?'FORA':'OK'], fora?[12,13]:[])
      })
    })
    ;(d.medicoesTE || []).forEach((m, mi) => {
      const tamFora = lim.tamanhoMin != null && foraRange(m.tamanho, lim.tamanhoMin, lim.tamanhoMax)
      const esqFora = lim.esquadroMin != null && foraRange(m.esquadro, lim.esquadroMin, lim.esquadroMax)
      pushRow(['Tamanho',  `R${mi+1}`, m.retifica??'', '', '—', fmtV(m.tamanho,2),  tamFora?'FORA':'OK'], tamFora?[12,13]:[])
      pushRow(['Esquadro', `R${mi+1}`, m.retifica??'', '', '—', fmtV(m.esquadro,2), esqFora?'FORA':'OK'], esqFora?[12,13]:[])
    })
    if (primeiraLinhaDaInspecao) { // sem medições
      iniciosGrupo.push(body.length)
      body.push([...base, '', '', '', '', '', '', ''])
    }
  })

  autoTable(doc, {
    ...baseTableStyles, startY, head, body,
    columnStyles: { 2:{halign:'center'}, 12:{halign:'center'}, 13:{halign:'center'} },
    didParseCell(data) {
      if (data.section !== 'body') return
      aplicarCorResultado(data)
      if (cores.some(c => c.ri===data.row.index && c.ci===data.column.index)) {
        data.cell.styles.textColor = C.vermelho
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = C.vermelhoClr
      }
      if (iniciosGrupo.includes(data.row.index)) {
        data.cell.styles.lineWidth = { top: 0.4, right: 0.15, bottom: 0.15, left: 0.15 }
      }
    },
  })
}

// ── PDF Atrito ─────────────────────────────────────────────────────────────────
const pdfAtrito = (doc, lista, startY) => {
  // Atrito: uma linha por inspeção (a média + valores resumidos) — sem repetição
  const head = [['Data', 'Hora', 'Resultado', 'Classe AD', 'Inspetor', 'Linha', 'Produto', 'Lote', 'Mín', 'Máx', 'Média', 'Nº Med.', 'Valores (nº:val, *=fora)']]
  const body = []
  const cores = []

  lista.forEach(a => {
    const lim    = a.limitesSnapshot || {}
    const medidas = a.medidas || []
    const medidasStr = medidas.map((m, i) =>
      `${i+1}:${fmtV(m,3)}${foraRange(m, lim.min, lim.max) ? '*' : ''}`
    ).join('  ')
    const ri = body.length
    body.push([
      fmtData(a.dataHora), fmtHora(a.dataHora), a.resultado??'',
      a.classeAD??'', a.inspetor??'', a.linha??'', a.produto??'', a.lote??'',
      lim.min??'', lim.max??'', fmtV(a.media,3), medidas.length, medidasStr
    ])
    if (lim.min != null && foraRange(a.media, lim.min, lim.max)) cores.push({ri, ci:10})
    if (medidas.some(m => foraRange(m, lim.min, lim.max)))        cores.push({ri, ci:12})
  })

  autoTable(doc, {
    ...baseTableStyles, startY, head, body,
    columnStyles: {
      2:{halign:'center'}, 3:{halign:'center'},
      8:{halign:'center'}, 9:{halign:'center'},
      10:{halign:'center', fontStyle:'bold'},
      11:{halign:'center'},
      12:{cellWidth:65}
    },
    didParseCell(data) {
      if (data.section !== 'body') return
      aplicarCorResultado(data)
      if (cores.some(c => c.ri===data.row.index && c.ci===data.column.index)) {
        data.cell.styles.textColor = C.vermelho
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = C.vermelhoClr
      }
    },
  })
}

// ── PDF Relatório de Turno ─────────────────────────────────────────────────────
const SITUACAO = {
  verde:    { emoji:'🟢', label:'Liberado Normalmente',       cor: C.verde,    fundo: C.verdeClaro },
  amarela:  { emoji:'🟡', label:'Ponto de Melhora',           cor: C.amarelo,  fundo: C.amareloClr },
  laranja:  { emoji:'🟠', label:'Liberado com Documento',     cor: C.laranja,  fundo: C.laranjaClr },
  vermelha: { emoji:'🔴', label:'Com Restrição / Retido',     cor: C.vermelho, fundo: C.vermelhoClr },
}
const sitLabel = (s) => SITUACAO[s]?.label ?? s ?? '—'
const sitCor   = (s) => SITUACAO[s]?.cor   ?? C.cinzaMed

const pdfRelatorio = (doc, lista, startY) => {
  const head = [['Data', 'Hora', 'Responsável', 'Equipe', 'Linha', 'Referência', 'Formato', 'Lote', 'Situação', 'Observação']]
  const body = []; const coresSit = []

  lista.forEach(r => {
    const base = [r.data ?? fmtData(r.dataHora), fmtHora(r.dataHora), r.responsavel??'', r.equipe??'']
    if (!r.linhas?.length) { body.push([...base,'','','','','','']); return }
    r.linhas.forEach(l => {
      if (!l.lotes?.length) { body.push([...base, l.linha??'', l.referencia??'', l.formato??'','','','']); return }
      l.lotes.forEach(lt => {
        const ri = body.length
        body.push([...base, l.linha??'', l.referencia??'', l.formato??'', lt.lote??'', sitLabel(lt.situacao), lt.observacao??''])
        coresSit.push({ ri, sit: lt.situacao })
      })
    })
  })

  autoTable(doc, {
    ...baseTableStyles, startY, head, body,
    columnStyles: { 3:{halign:'center'}, 8:{fontStyle:'bold'} },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 8) {
        const sit = coresSit.find(c => c.ri === data.row.index)
        if (sit) {
          data.cell.styles.textColor = sitCor(sit.sit)
          data.cell.styles.fontStyle = 'bold'
          if (sit.sit === 'vermelha') data.cell.styles.fillColor = C.vermelhoClr
          if (sit.sit === 'laranja')  data.cell.styles.fillColor = C.laranjaClr
          if (sit.sit === 'amarela')  data.cell.styles.fillColor = C.amareloClr
          if (sit.sit === 'verde')    data.cell.styles.fillColor = C.verdeClaro
        }
      }
    },
  })
}

// ── Exportar PDF (entry point) ─────────────────────────────────────────────────
export const exportarPDF = (dados, aba, filtroGlobal) => {
  if (!dados.length) { alert('Nenhum dado para exportar.'); return }

  const mapaNome = { empeno:'Empeno', dimensional:'Dimensional', atrito:'Coef_Atrito', relatorios:'Rel_Turno' }
  const mapaFn   = { empeno:pdfEmpeno, dimensional:pdfDimensional, atrito:pdfAtrito, relatorios:pdfRelatorio }
  const nome = mapaNome[aba] ?? aba
  const fn   = mapaFn[aba]
  if (!fn) return

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const periodo   = nomePeriodo(filtroGlobal)
  const aprovados = dados.filter(d => d.resultado === 'Aprovado').length
  const reprovados= dados.filter(d => d.resultado === 'Reprovado').length
  const startY    = cabecalhoPDF(doc, nome, periodo, filtroGlobal, dados.length, aprovados, reprovados)

  fn(doc, dados, startY)
  rodapePDF(doc, nome, periodo)

  const d = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
  doc.save(`QualityControl_${nome}_${periodo}_${d}.pdf`)
}


// ── Exportar Excel (entry point) ──────────────────────────────────────────────
export const exportarExcel = (dados, aba, filtroGlobal) => {
  const mapaFn   = { empeno: excelEmpeno, dimensional: excelDimensional, atrito: excelAtrito, relatorios: excelRelatorio }
  const mapaNome = { empeno: 'Empeno', dimensional: 'Dimensional', atrito: 'Coef_Atrito', relatorios: 'Rel_Turno' }
  const linhas = (mapaFn[aba] || (() => []))(dados)
  if (!linhas.length) { alert('Nenhum dado para exportar.'); return }
  const ws = XLSX.utils.json_to_sheet(linhas)
  const chaves = Object.keys(linhas[0])
  ws['!cols'] = chaves.map(k => ({ wch: Math.max(k.length + 2, ...linhas.map(r => String(r[k] ?? '').length + 1), 8) }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, mapaNome[aba]?.substring(0, 31) ?? aba)
  const periodo = nomePeriodo(filtroGlobal)
  const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
  XLSX.writeFile(wb, `QualityControl_${mapaNome[aba] ?? aba}_${periodo}_${data}.xlsx`)
}