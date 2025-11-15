<script setup lang="ts">
import type { SkillNode } from '~/types/skillTree'

const { createProblem, getAllTrees, findAlternativeSolution } =
  useDecisionTree()
const toast = useToast()

const selectedSkillNode = ref<SkillNode | null>(null)
const fromNodeForAlternative = ref<SkillNode | null>(null)
const toNodeForAlternative = ref<SkillNode | null>(null)
const isAlternativeModeActive = ref(false)
const decisionTrees = ref<DecisionTree[]>([])
const isLoadingTrees = ref(true)

const allSkillNodes = computed(() => {
  return allDecisionTreesToSkillNodes(decisionTrees.value)
})
const { settings: skillTreeSettings } = useSkillTreeSettings()

const problemDescription = ref('')
const problemGoal = ref('')
const tags = ref<string[]>([])
const currentTag = ref('')
const isLoading = ref(false)
const alternativeReason = ref('')
const hasDecisionTrees = computed(() => decisionTrees.value.length > 0)
const highlightedAlternativeNodeIds = computed(() => {
  if (!isAlternativeModeActive.value) {
    return []
  }
  const ids: string[] = []
  if (fromNodeForAlternative.value) {
    ids.push(fromNodeForAlternative.value.id)
  }
  if (toNodeForAlternative.value) {
    ids.push(toNodeForAlternative.value.id)
  }
  return ids
})
const shouldShowSidebar = computed(
  () =>
    !!selectedSkillNode.value ||
    isAlternativeModeActive.value ||
    hasDecisionTrees.value,
)

const loadAllTrees = async () => {
  isLoadingTrees.value = true
  try {
    const trees = await getAllTrees()
    decisionTrees.value = trees
  } catch (e: any) {
    console.error('Ошибка при загрузке деревьев:', e)
    toast.add({
      title: 'Не удалось загрузить деревья',
      description: e?.message || 'Попробуйте ещё раз позже',
      color: 'error',
    })
  } finally {
    isLoadingTrees.value = false
  }
}

onMounted(() => {
  loadAllTrees()
})

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
      await loadAllTrees()
    } else if (response.newTree) {
      decisionTrees.value.push(response.newTree)
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

const ensureFromBeforeTo = () => {
  if (!fromNodeForAlternative.value || !toNodeForAlternative.value) {
    return
  }

  const indexById = new Map<string, number>()
  allSkillNodes.value.forEach((node, index) => {
    indexById.set(node.id, index)
  })

  const fromIndex =
    indexById.get(fromNodeForAlternative.value.id) ?? Number.POSITIVE_INFINITY
  const toIndex =
    indexById.get(toNodeForAlternative.value.id) ?? Number.POSITIVE_INFINITY

  if (fromIndex > toIndex) {
    const temp = fromNodeForAlternative.value
    fromNodeForAlternative.value = toNodeForAlternative.value
    toNodeForAlternative.value = temp
  }
}

const handleSkillNodeClick = (node: SkillNode) => {
  selectedSkillNode.value = node

  if (!isAlternativeModeActive.value) {
    return
  }

  if (!fromNodeForAlternative.value) {
    fromNodeForAlternative.value = node
    return
  }

  if (
    !toNodeForAlternative.value &&
    fromNodeForAlternative.value.id !== node.id
  ) {
    toNodeForAlternative.value = node
    ensureFromBeforeTo()
  }
}

const resetAlternativeSelection = () => {
  fromNodeForAlternative.value = null
  toNodeForAlternative.value = null
}

const activateAlternativeMode = () => {
  isAlternativeModeActive.value = true
  resetAlternativeSelection()
  alternativeReason.value = ''
}

const deactivateAlternativeMode = () => {
  isAlternativeModeActive.value = false
  resetAlternativeSelection()
  alternativeReason.value = ''
}

const handleAddAlternativeSolution = async () => {
  if (!isAlternativeModeActive.value) {
    toast.add({
      title: 'Активируйте режим альтернативного пути',
      color: 'warning',
    })
    return
  }

  if (!fromNodeForAlternative.value || !toNodeForAlternative.value) {
    toast.add({
      title: 'Выберите обе ноды',
      description: 'Нужно указать начало и конец альтернативного пути',
      color: 'warning',
    })
    return
  }

  const fromNodeId = fromNodeForAlternative.value.id
  const toNodeId = toNodeForAlternative.value.id
  const fromMatch = fromNodeId.match(/^(tree_\d+_\w+)-(.+)$/)
  const toMatch = toNodeId.match(/^(tree_\d+_\w+)-(.+)$/)

  if (
    !fromMatch ||
    !fromMatch[1] ||
    !fromMatch[2] ||
    !toMatch ||
    !toMatch[1] ||
    !toMatch[2]
  ) {
    toast.add({
      title: 'Неверный узел',
      description: 'Выбранная нода не принадлежит дереву',
      color: 'warning',
    })
    return
  }

  if (fromMatch[1] !== toMatch[1]) {
    toast.add({
      title: 'Выберите ноды одного дерева',
      color: 'warning',
    })
    return
  }

  const treeId = fromMatch[1]
  const tree = decisionTrees.value.find(t => t.id === treeId)

  if (!tree) {
    toast.add({
      title: 'Дерево не найдено',
      color: 'error',
    })
    return
  }

  const fromActualNodeId = fromMatch[2]
  const toActualNodeId = toMatch[2]

  const edgeExists = tree.edges.some(
    e => e.fromNodeId === fromActualNodeId && e.toNodeId === toActualNodeId,
  )

  if (!edgeExists) {
    toast.add({
      title: 'Нет прямой связи',
      description: 'Эти ноды не соединены',
      color: 'warning',
    })
    return
  }

  isLoading.value = true

  try {
    const response = await findAlternativeSolution({
      fromNodeId: fromActualNodeId,
      toNodeId: toActualNodeId,
      treeId: tree.id,
      reason: alternativeReason.value || undefined,
    })

    const treeIndex = decisionTrees.value.findIndex(
      t => t.id === response.tree.id,
    )
    if (treeIndex !== -1) {
      decisionTrees.value[treeIndex] = response.tree
    }
    alternativeReason.value = ''
    deactivateAlternativeMode()

    const newNodeId = `${response.tree.id}-${response.newNodeId}`
    const newNode = allSkillNodes.value.find(n => n.id === newNodeId)
    if (newNode) {
      selectedSkillNode.value = newNode
    }
  } catch (e: any) {
    toast.add({
      title: 'Не удалось добавить альтернативный путь',
      description: e?.message || 'Попробуйте ещё раз позже',
      color: 'error',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">EpiGen - Деревья решений</h1>

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
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Теги
          </label>
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
              <button
                @click="removeTag(tag)"
                class="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          </div>
        </div>

        <UButton
          :loading="isLoading"
          @click="handleCreateProblem"
          color="primary"
        >
          Создать проблему
        </UButton>
      </div>

      <div class="relative">
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold">
                Деревья решений ({{ decisionTrees.length }})
              </h2>
              <UButton
                :loading="isLoadingTrees"
                @click="loadAllTrees"
                color="neutral"
                variant="ghost"
                size="sm"
              >
                Обновить
              </UButton>
            </div>
          </template>
          <div class="w-full h-full bg-white">
            <div
              v-if="isLoadingTrees"
              class="flex items-center justify-center"
              :style="{ height: `${skillTreeSettings.viewport.height}px` }"
            >
              <div class="text-gray-400">Загрузка деревьев...</div>
            </div>
            <SkillTree
              v-else-if="allSkillNodes.length > 0"
              :skills="allSkillNodes"
              :mode="isAlternativeModeActive ? 'alternative' : 'default'"
              :selected-node-id="
                isAlternativeModeActive ? null : (selectedSkillNode?.id ?? null)
              "
              :highlight-node-ids="highlightedAlternativeNodeIds"
              :width="skillTreeSettings.viewport.width"
              :height="skillTreeSettings.viewport.height"
              :vertical-gap="skillTreeSettings.layout.verticalGap"
              :horizontal-gap="skillTreeSettings.layout.horizontalGap"
              :node-sizing="skillTreeSettings.node"
              @background-click="selectedSkillNode = null"
              @node-click="handleSkillNodeClick"
            />
            <div
              v-else
              class="flex items-center justify-center text-gray-400"
              :style="{ height: `${skillTreeSettings.viewport.height}px` }"
            >
              Нет деревьев. Создайте новую проблему для начала.
            </div>
          </div>
        </UCard>

        <div
          v-if="shouldShowSidebar"
          class="absolute top-16 right-1 w-[350px] z-10 flex flex-col gap-4"
        >
          <template v-if="isAlternativeModeActive">
            <AlternativePathPanel
              :from-node="fromNodeForAlternative"
              :to-node="toNodeForAlternative"
              :reason="alternativeReason"
              :is-loading="isLoading"
              :can-submit="!!(fromNodeForAlternative && toNodeForAlternative)"
              @reset-selection="resetAlternativeSelection"
              @update:reason="value => (alternativeReason = value)"
              @submit="handleAddAlternativeSolution"
              @exit="deactivateAlternativeMode"
            />
          </template>
          <UButton
            v-else-if="hasDecisionTrees"
            color="primary"
            size="sm"
            class="w-full"
            label="Активировать альтернативный путь"
            @click="activateAlternativeMode"
          />
          <SkillDescription
            v-if="selectedSkillNode"
            :selected-node="selectedSkillNode"
          />
        </div>
      </div>
    </div>
  </div>
</template>
