<template>
  <span :class="classes">
    {{ texto }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['status'])

const classes = computed(() => {
  const base = "text-[10px] font-bold px-2 py-0.5 rounded uppercase "
  if (props.status === 'aprovado') return base + "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
  if (props.status === 'reprovado') return base + "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  return base + "bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-600"
})

const texto = computed(() => {
  if (props.status === 'aprovado') return 'Ok'
  if (props.status === 'reprovado') return 'Fora'
  return 'Aguardando'
})
</script>