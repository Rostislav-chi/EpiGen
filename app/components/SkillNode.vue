<script setup lang="ts">
import * as d3 from 'd3'
import type { SkillNode } from '~/types/skillTree'
import { SKILL_NODE_CONSTANTS as SKILL } from '~/constants/skillTree'

interface Props {
  node: d3.HierarchyPointNode<SkillNode>
  nodeData: SkillNode
  rectWidth?: number
  rectHeight?: number
  isDimmed?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [node: SkillNode]
}>()

const textRef = ref<SVGTextElement | null>(null)
const measuredSize = ref({
  width: props.rectWidth ?? SKILL.dimensions.minWidth,
  height: props.rectHeight ?? SKILL.dimensions.minHeight,
})

const computedRectWidth = computed(
  () =>
    props.rectWidth ??
    Math.max(SKILL.dimensions.minWidth, measuredSize.value.width),
)

const computedRectHeight = computed(
  () =>
    props.rectHeight ??
    Math.max(SKILL.dimensions.minHeight, measuredSize.value.height),
)

const nodeBackgroundFillStyle = computed(() => {
  if (props.isDimmed) {
    return { '--fill-color': SKILL.colors.dimmedFill }
  }

  const rgb = getScoreBackgroundColorRgb(props.nodeData.score)
  return { '--fill-color': `rgb(${rgb})` }
})

const nodeStrokeStyle = computed(() => {
  if (props.isDimmed) {
    return { '--stroke-color': SKILL.colors.dimmedStroke }
  }

  const rgb = getScoreColorRgb(props.nodeData.score)
  return { '--stroke-color': `rgb(${rgb})` }
})

const nodeTextClass = computed(() =>
  props.isDimmed ? 'fill-gray-400' : 'fill-gray-800',
)

const nodeExtraVisualClass = computed(() =>
  props.isDimmed ? SKILL.opacityClasses.dimmed : SKILL.opacityClasses.active,
)

const measureLabel = () => {
  if (!textRef.value || props.rectWidth || props.rectHeight) return
  const bbox = textRef.value.getBBox()
  measuredSize.value = {
    width: bbox.width + SKILL.dimensions.horizontalPadding,
    height: bbox.height + SKILL.dimensions.verticalPadding,
  }
}

const handleNodeClick = () => {
  emit('click', props.nodeData)
}

onMounted(() => {
  nextTick(() => measureLabel())
})

watch(
  () => props.nodeData.label,
  () => {
    nextTick(() => measureLabel())
  },
)
</script>

<template>
  <g
    :transform="`translate(${node.x},${node.y})`"
    class="cursor-pointer"
    @click.stop="handleNodeClick"
  >
    <rect
      :width="computedRectWidth"
      :height="computedRectHeight"
      :x="-computedRectWidth / 2"
      :y="-computedRectHeight / 2"
      :style="{ ...nodeBackgroundFillStyle, ...nodeStrokeStyle }"
      :class="[
        'transition-all stroke-2 fill-(--fill-color) stroke-(--stroke-color)',
        nodeExtraVisualClass,
      ]"
      rx="8"
    />

    <text
      ref="textRef"
      :x="0"
      :y="0"
      text-anchor="middle"
      dominant-baseline="middle"
      :class="['text-sm font-semibold pointer-events-none px-2', nodeTextClass]"
    >
      {{ nodeData.label }}
    </text>
  </g>
</template>
