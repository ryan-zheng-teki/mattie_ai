<template>
  <div :class="['tab-content', { 'active': isActive }]">
    <slot v-if="isActive"></slot>
  </div>
</template>

<script setup>
import { computed, inject, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
})

const tabsContext = inject('tabsContext')
const isActive = computed(() => tabsContext.activeTab.value === props.name)

onMounted(() => {
  // Register this tab with parent
  tabsContext.registerTab({
    name: props.name,
    title: props.title
  })
  
  // If this tab should be active initially
  if (props.active) {
    tabsContext.setActiveTab(props.name)
  }
})
</script>

<style scoped>
.tab-content {
  display: none;
  padding: 0;
}

.tab-content.active {
  display: block;
}
</style>
