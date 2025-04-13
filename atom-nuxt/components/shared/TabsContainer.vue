<template>
  <div>
    <div class="tabs-container flex bg-gray-medium border-b-3 border-primary-dark">
      <div 
        v-for="tab in tabs" 
        :key="tab.name"
        :class="['tab p-2.5 px-5 cursor-pointer font-bold transition-all text-center flex-1 border-b-3 -mb-0.5', 
                { 'active bg-gray-light border-b-3 border-accent text-primary-dark': activeTab === tab.name }]"
        @click="setActiveTab(tab.name)"
      >
        {{ tab.title }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from 'vue'

const props = defineProps({
  initialTab: {
    type: String,
    default: 'visualization'
  }
})

const tabs = ref([])
const activeTab = ref(props.initialTab)

// Register a tab
const registerTab = (tab) => {
  tabs.value.push(tab)
}

// Set active tab
const setActiveTab = (tabName) => {
  activeTab.value = tabName
}

// Provide tab context to child components
provide('tabsContext', {
  activeTab,
  registerTab,
  setActiveTab
})

onMounted(() => {
  // Set initial active tab
  activeTab.value = props.initialTab
})
</script>

<style scoped>
.tab {
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  text-align: center;
  flex: 1;
  border-bottom: 3px solid transparent;
  margin-bottom: -3px;
}

.tab:hover {
  background-color: rgba(0,0,0,0.05);
}

.tab.active {
  background-color: var(--gray-light);
  border-bottom: 3px solid var(--accent-color);
  color: var(--primary-dark);
}

@media (max-width: 768px) {
  .tab {
    padding: 8px;
    font-size: 14px;
  }
}
</style>
