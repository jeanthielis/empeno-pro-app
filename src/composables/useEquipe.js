/**
 * Escala 12x36 — 4 equipes em rotação
 * Referência: 21/04/2026 às 06:00 iniciou a Equipe 1
 * Turnos de 12h: 06:00–18:00 e 18:00–06:00
 */
const REF_DATE = new Date('2026-04-21T06:00:00')

/**
 * Retorna a equipe atual como string: '1', '2', '3' ou '4'
 * @param {Date} [data] — data para calcular (padrão: agora)
 */
export const equipeAtual = (data = new Date()) => {
  const horasDecorridas = (data - REF_DATE) / (1000 * 60 * 60)
  // Se a data for anterior à referência, calcula para trás
  const turno = Math.floor(horasDecorridas / 12)
  const idx = ((turno % 4) + 4) % 4  // garante positivo
  return String(idx + 1)
}

/**
 * Retorna o horário de início e fim do turno atual
 * @param {Date} [data]
 */
export const infoTurnoAtual = (data = new Date()) => {
  const horasDecorridas = (data - REF_DATE) / (1000 * 60 * 60)
  const turno = Math.floor(horasDecorridas / 12)
  const inicio = new Date(REF_DATE.getTime() + turno * 12 * 60 * 60 * 1000)
  const fim    = new Date(inicio.getTime() + 12 * 60 * 60 * 1000)
  const equipe = String(((turno % 4) + 4) % 4 + 1)
  return { equipe, inicio, fim }
}
