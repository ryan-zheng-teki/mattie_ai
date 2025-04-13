<template>
  <div id="controls" class="p-4 bg-primary-light border-b-3 border-primary-dark flex justify-center items-center flex-wrap gap-4 relative z-4">
    <div class="control-group">
      <label for="element-select" class="mr-2.5 font-bold text-base text-text-light">Pick an Element:</label>
      <select 
        id="element-select" 
        v-model="selectedElement"
        @change="onElementChange"
        class="p-2 px-3 border-2 border-primary-dark rounded-lg text-base font-comic cursor-pointer bg-white shadow-sm"
      >
        <option v-for="(element, symbol) in store.elements" :key="symbol" :value="symbol">
          {{ element.name }} ({{ symbol }}) {{ getEmoji(symbol) }} ({{ element.atomicNumber }})
        </option>
      </select>
    </div>
    
    <div class="control-group">
      <label class="mr-2.5 font-bold text-base text-text-light">Electron Speed:</label>
      <div class="speed-buttons flex gap-2">
        <button 
          id="slow-speed" 
          :class="['speed-button flex items-center gap-1.5 p-2 px-4 bg-white border-2 border-primary-dark rounded-lg text-base font-bold font-comic cursor-pointer transition-all shadow-sm', 
                  { 'active': electronSpeed === 0.05 }]"
          @click="setElectronSpeed(0.05)"
        >
          <i class="fas fa-walking"></i> Slow
        </button>
        <button 
          id="fast-speed" 
          :class="['speed-button flex items-center gap-1.5 p-2 px-4 bg-white border-2 border-primary-dark rounded-lg text-base font-bold font-comic cursor-pointer transition-all shadow-sm',
                  { 'active': electronSpeed === 0.5 }]"
          @click="setElectronSpeed(0.5)"
        >
          <i class="fas fa-running"></i> Fast
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAtomsStore } from '~/stores/atoms'

const emit = defineEmits(['element-change', 'speed-change'])
const store = useAtomsStore()

const selectedElement = ref(store.currentElement)
const electronSpeed = ref(store.electronSpeed)

// Map of element symbols to emojis
const elementEmojis = {
  H: '🌋', He: '🎈', Li: '🔋', Be: '🧪', B: '🔬', C: '💍',
  N: '🌱', O: '💨', F: '🦷', Ne: '💡', Na: '🧂', Mg: '💪',
  Al: '🥫', Si: '💻', P: '🌠', S: '🥚', Cl: '🧼', Ar: '🧊',
  K: '🍌', Ca: '🥛'
}

const getEmoji = (symbol) => elementEmojis[symbol] || ''

const onElementChange = () => {
  store.setCurrentElement(selectedElement.value)
  emit('element-change', selectedElement.value)
}

const setElectronSpeed = (speed) => {
  electronSpeed.value = speed
  store.setElectronSpeed(speed)
  emit('speed-change', speed)
}

// Watch for store changes
watch(() => store.currentElement, (newElement) => {
  selectedElement.value = newElement
})

watch(() => store.electronSpeed, (newSpeed) => {
  electronSpeed.value = newSpeed
})
</script>

<style scoped>
.control-group {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.active {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

@media (max-width: 768px) {
  #controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    margin: 0 0 10px 0;
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group label {
    margin-right: 0;
    margin-bottom: 5px;
  }
  
  .speed-buttons {
    width: 100%;
  }
  
  .speed-button {
    flex: 1;
    justify-content: center;
  }
}
</style>
