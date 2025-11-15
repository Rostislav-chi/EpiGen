<script setup lang="ts">
import type { SkillNode } from '~/types/skillTree'
import { mockSkillTreeData } from '~/data/mockSkillTree'

const selectedSkillNode = ref<SkillNode | null>(null)

const handleSkillNodeClick = (node: SkillNode) => {
  selectedSkillNode.value = node
}

const handleBackgroundClick = () => {
  selectedSkillNode.value = null
}
</script>

<template>
  <div class="min-h-screen">
    <div class="w-full h-full bg-white">
      <SkillTree
        :skills="mockSkillTreeData"
        :selected-node-id="selectedSkillNode?.id ?? null"
        :width="1281"
        :height="831"
        @node-click="handleSkillNodeClick"
        @background-click="handleBackgroundClick"
      />
    </div>

    <SkillDescription :selected-node="selectedSkillNode" />
  </div>
</template>
