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
                  { 'active': store.electronSpeed === 0.01 }]"
          @click="setElectronSpeed(0.01)"
        >
          <i class="fas fa-walking"></i> Slow
        </button>
        <button 
          id="fast-speed" 
          :class="['speed-button flex items-center gap-1.5 p-2 px-4 bg-white border-2 border-primary-dark rounded-lg text-base font-bold font-comic cursor-pointer transition-all shadow-sm',
                  { 'active': store.electronSpeed === 0.5 }]"
          @click="setElectronSpeed(0.5)"
        >
          <i class="fas fa-running"></i> Fast
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAtomsStore } from '~/stores/atoms'

const store = useAtomsStore()

// Use computed for the selected element to get/set through the store
const selectedElement = computed({
  get: () => store.currentElement,
  set: (value) => store.setCurrentElement(value)
})

// Map of element symbols to emojis
const elementEmojis = {
  H: '🌋', He: '🎈', Li: '🔋', Be: '🧪', B: '🔬', C: '💍',
  N: '🌱', O: '💨', F: '🦷', Ne: '💡', Na: '🧂', Mg: '💪',
  Al: '🥫', Si: '💻', P: '🌠', S: '🥚', Cl: '🧼', Ar: '🧊',
  K: '🍌', Ca: '🥛'
}

const getEmoji = (symbol) => elementEmojis[symbol] || ''

const onElementChange = () => {
  // No need for emit - the computed property already updates the store
  console.log('Element changed to:', store.currentElement)
}

const setElectronSpeed = (speed) => {
  // Update the store directly - no emit needed
  store.setElectronSpeed(speed)
  console.log('Speed changed to:', speed)
}
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
