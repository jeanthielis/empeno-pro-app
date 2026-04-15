import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Store de dados de referência — carrega UMA VEZ por sessão.
 * formatos, produtos, linhas e configAtrito são partilhados por todas as views.
 * Elimina 9+ leituras redundantes ao Firestore quando o inspetor navega entre formulários.
 */
export const useReferenciasStore = defineStore('referencias', () => {
  const formatos     = ref([])
  const produtos     = ref([]) // apenas nomes (string[])
  const linhas       = ref([]) // apenas nomes (string[])
  const configAtrito = ref(null)
  const carregado    = ref(false)
  const carregando   = ref(false)

  const carregar = async () => {
    if (carregado.value || carregando.value) return
    carregando.value = true
    try {
      const [snapFmt, snapProd, snapLin, snapAtrito] = await Promise.all([
        getDocs(collection(db, 'formatos')),
        getDocs(collection(db, 'produtos')),
        getDocs(collection(db, 'linhas')),
        getDocs(query(collection(db, 'configuracoes'), where('tipo', '==', 'atrito'))),
      ])
      formatos.value     = snapFmt.docs.map(d => ({ id: d.id, ...d.data() })).filter(f => f.ativo !== false)
      produtos.value     = snapProd.docs.map(d => d.data()).filter(p => p.ativo !== false).map(p => p.nome).sort()
      linhas.value       = snapLin.docs.map(d => d.data()).filter(l => l.ativo !== false).map(l => l.nome).sort()
      configAtrito.value = snapAtrito.empty ? null : snapAtrito.docs[0].data()
      carregado.value    = true
    } finally {
      carregando.value = false
    }
  }

  // Chame após salvar alterações no Admin para forçar nova leitura
  const invalidar = () => { carregado.value = false }

  return { formatos, produtos, linhas, configAtrito, carregado, carregando, carregar, invalidar }
})
