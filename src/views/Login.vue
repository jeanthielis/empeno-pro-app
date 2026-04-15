<template>
  <div class="flex h-screen items-center justify-center px-4">
    <div class="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-800">
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 mb-4">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h1 class="text-2xl font-bold">QualityControl</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestão de Qualidade</p>
      </div>
      
      <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800 text-center font-medium">
        {{ errorMsg }}
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Email ou Usuário</label>
          <input type="text" v-model="loginData.userOrEmail" class="input-clean lowercase w-full" placeholder="nome.sobrenome ou email" required>
        </div>
        
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Senha (Matrícula)</label>
          <input type="password" v-model="loginData.pass" class="input-clean w-full" placeholder="••••••••" required>
        </div>
        
        <button type="submit" class="btn-primary w-full py-3" :disabled="loading">
          <span v-if="loading">A autenticar...</span>
          <span v-else>Entrar no Sistema</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'
import Swal from 'sweetalert2'

const router = useRouter()

const loginData = ref({
  userOrEmail: '',
  pass: ''
})

const loading = ref(false)
const errorMsg = ref('')

const DOMINIO_PADRAO = '@qualitron.com.br' 

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  let emailParaAuth = loginData.value.userOrEmail.toLowerCase()
  if (!emailParaAuth.includes('@')) {
    emailParaAuth = emailParaAuth + DOMINIO_PADRAO
  }

  let senhaParaAuth = loginData.value.pass
  if (senhaParaAuth.length < 6) {
    senhaParaAuth = senhaParaAuth + '000' 
  }

  try {
    await signInWithEmailAndPassword(auth, emailParaAuth, senhaParaAuth)

    Swal.fire({
      icon: 'success',
      title: 'Bem-vindo!',
      text: 'Autenticado com sucesso.',
      timer: 1500, // Fecha sozinho em 1.5 segundos
      showConfirmButton: false
    })
    // Redireciona para o painel se a autenticação for um sucesso
    router.push('/dashboard')
  } catch (error) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      await migrarUsuarioAntigo(emailParaAuth, senhaParaAuth)
    } else {
      errorMsg.value = "Palavra-passe incorreta ou erro no sistema."
      console.error(error)
    }
  } finally {
    loading.value = false
  }
}

const migrarUsuarioAntigo = async (emailParaAuth, senhaParaAuth) => {
  try {
    const q = query(
      collection(db, "usuarios"), 
      where("login", "==", loginData.value.userOrEmail.toLowerCase()),
      where("matricula", "==", loginData.value.pass)
    )
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      await createUserWithEmailAndPassword(auth, emailParaAuth, senhaParaAuth)
      Swal.fire({
        icon: 'info',
        title: 'Conta Atualizada!',
        text: 'Sua conta foi migrada para o novo sistema de segurança.',
        confirmButtonColor: '#2563eb'
      })
      router.push('/dashboard')
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Conta Não Encontrada!',
        text: 'Não foi possível encontrar sua conta no sistema antigo.',
        confirmButtonColor: '#2563eb'
      })
      Swal.fire({
        icon: 'error',
        title: 'Conta Não Encontrada!',
        text: 'Não foi possível encontrar sua conta no sistema antigo.',
        confirmButtonColor: '#2563eb'
      })
    }
  } catch (migracaoError) {
    console.error("Erro na migração:", migracaoError)
    errorMsg.value = "Erro ao tentar migrar usuário antigo."
  }
}
</script>

<style scoped>
.input-clean {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.6rem 0.8rem;
    font-size: 0.95rem;
    transition: all 0.2s;
    background-color: #fff;
    color: #374151;
    outline: none;
}
.input-clean:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.btn-primary {
    background-color: #2563eb;
    color: white;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    transition: 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.btn-primary:hover { 
    background-color: #1d4ed8; 
}
.btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>