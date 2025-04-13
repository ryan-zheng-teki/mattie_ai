<template>
  <div class="animation-container flex-1 relative overflow-hidden">
    <div 
      id="visualization-container" 
      ref="container"
      :class="['h-full relative bg-black overflow-hidden', { 'fullscreen': isFullscreen }]"
    >
      <div id="temporary-labels" class="absolute top-0 left-0 w-full h-full pointer-events-none z-5"></div>
      <div 
        id="animation-narration" 
        class="absolute bottom-[60px] left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white p-2 px-4 rounded-full text-base pointer-events-none max-w-[80%] text-center opacity-0 transition-opacity z-3"
      ></div>
      <div class="animation-controls">
        <button 
          id="zoom-in"
          @click="zoomCamera(0.8)"
          title="Zoom In"
          class="p-2 w-10 h-10 rounded-full flex items-center justify-center text-base transition-all"
        >
          <i class="fas fa-search-plus"></i>
        </button>
        <button 
          id="zoom-out"
          @click="zoomCamera(1.2)" 
          title="Zoom Out"
          class="p-2 w-10 h-10 rounded-full flex items-center justify-center text-base transition-all"
        >
          <i class="fas fa-search-minus"></i>
        </button>
        <button 
          id="fullscreen-button"
          @click="toggleFullscreen"
          title="Fullscreen"
          class="p-2 w-10 h-10 rounded-full flex items-center justify-center text-base transition-all"
        >
          <i :class="['fas', isFullscreen ? 'fa-compress' : 'fa-expand']"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAtomVisualization } from '~/composables/useAtomVisualization'

const { 
  container, 
  isFullscreen,
  initVisualization, 
  updateVisualization, 
  animate, 
  toggleFullscreen, 
  zoomCamera,
  updateElectronSpeed
} = useAtomVisualization()

// Expose methods to parent components
defineExpose({
  initVisualization,
  updateVisualization,
  animate,
  updateElectronSpeed
})
</script>

<style scoped>
.animation-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.animation-controls button {
  padding: 8px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
}

.animation-controls button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .animation-container {
    height: 60vh;
  }
  
  .animation-controls button {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}
</style>
