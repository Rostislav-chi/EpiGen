<script setup lang="ts">
const emit = defineEmits<{
  loadAllTrees: []
  decisionTrees: [DecisionTree]
}>()

const { createProblem } = useDecisionTree()
const toast = useToast()

const problemDescription = ref('')
const problemGoal = ref('')
const currentTag = ref('')
const tags = ref<string[]>([])
const isLoading = ref(false)

const addTag = () => {
  if (
    currentTag.value.trim() &&
    !tags.value.includes(currentTag.value.trim())
  ) {
    tags.value.push(currentTag.value.trim())
    currentTag.value = ''
  }
}

const removeTag = (tag: string) => {
  tags.value = tags.value.filter(t => t !== tag)
}

const handleCreateProblem = async () => {
  const title = problemDescription.value.trim()

  if (!title) {
    toast.add({
      title: 'Заполните название проблемы',
      color: 'warning',
    })
    return
  }

  isLoading.value = true

  try {
    const response = await createProblem({
      description: title,
      goal: problemGoal.value.trim() || undefined,
      tags: tags.value,
    })

    if (response.existingTreeId) {
      toast.add({
        title: 'Найдена похожая проблема',
        description: `Дерево: ${response.existingTreeId}`,
        color: 'warning',
      })
      emit('loadAllTrees')
    } else if (response.newTree) {
      emit('decisionTrees', response.newTree)
      problemDescription.value = ''
      problemGoal.value = ''
      tags.value = []
    }
  } catch (e: any) {
    toast.add({
      title: 'Не удалось создать проблему',
      description: e?.message || 'Попробуйте ещё раз позже',
      color: 'error',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">Создать новую проблему</h2>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Название проблемы
      </label>
      <UInput
        v-model="problemDescription"
        placeholder="Введите название проблемы..."
        class="w-full"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Конечная цель (необязательно)
      </label>
      <UInput
        v-model="problemGoal"
        placeholder="Опишите конечную цель..."
        class="w-full"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2"> Теги </label>
      <div class="flex gap-2 mb-2">
        <UInput
          v-model="currentTag"
          placeholder="Добавить тег"
          @keyup.enter="addTag"
        />
        <UButton @click="addTag">Добавить</UButton>
      </div>
      <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="tag in tags"
          :key="tag"
          class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
        >
          {{ tag }}

          <UButton color="secondary" @click="removeTag(tag)" label="x" />
        </span>
      </div>
    </div>

    <UButton :loading="isLoading" @click="handleCreateProblem" color="primary">
      Создать проблему
    </UButton>
  </div>
</template>
