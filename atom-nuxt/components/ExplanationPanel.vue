<template>
  <div class="explanation-panel w-[var(--panel-width)] bg-gray-lighter border-l border-gray-medium overflow-y-auto p-[var(--panel-padding)]">
    <div class="panel-section mb-5">
      <h3 class="text-lg m-0 mb-2.5 text-primary-dark border-b-2 border-primary-light pb-1.5">Element Info</h3>
      <div id="element-info" class="info-box bg-white rounded-lg border-2 border-gray-medium p-2.5 mb-2.5 text-base"></div>
    </div>
    
    <div class="panel-section mb-5">
      <h3 class="text-lg m-0 mb-2.5 text-primary-dark border-b-2 border-primary-light pb-1.5">About This Element</h3>
      <div id="explanation-box" class="bg-white rounded-lg border-2 border-gray-medium p-2.5 min-h-[80px] text-base"></div>
    </div>
    
    <div class="panel-section mb-5">
      <h3 class="text-lg m-0 mb-2.5 text-primary-dark border-b-2 border-primary-light pb-1.5">Legend</h3>
      <div class="legend-items flex flex-col gap-2.5">
        <div class="legend-item flex items-center gap-2.5 text-base">
          <div class="icon nucleus-icon w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold bg-nucleus text-white">●</div>
          <span>Nucleus</span>
        </div>
        <div class="legend-item flex items-center gap-2.5 text-base">
          <div class="icon electron-icon-1 w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold bg-electron1 text-white">•</div>
          <span>1st Shell Electron</span>
        </div>
        <div class="legend-item flex items-center gap-2.5 text-base">
          <div class="icon electron-icon-2 w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold bg-electron2 text-white">•</div>
          <span>2nd Shell Electron</span>
        </div>
        <div class="legend-item flex items-center gap-2.5 text-base">
          <div class="icon electron-icon-3 w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold bg-electron3 text-white">•</div>
          <span>3rd Shell Electron</span>
        </div>
        <div class="legend-item flex items-center gap-2.5 text-base">
          <div class="icon electron-icon-4 w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold bg-electron4 text-white">•</div>
          <span>4th Shell Electron</span>
        </div>
        <div class="legend-item flex items-center gap-2.5 text-base">
          <div class="icon shell-icon w-6 h-6 rounded-full flex items-center justify-center text-lg font-bold border-2 border-shell2 box-border">◯</div>
          <span>Electron Shell</span>
        </div>
      </div>
    </div>
    
    <div class="panel-section mb-5">
      <h3 class="text-lg m-0 mb-2.5 text-primary-dark border-b-2 border-primary-light pb-1.5">Shell Status</h3>
      <div id="shell-status" class="bg-white rounded-lg border-2 border-gray-medium p-2.5"></div>
    </div>
  </div>
</template>

<script setup>
// No dynamic logic needed for this component
</script>

<style scoped>
.shell-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 15px;
}

.shell-color {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 8px;
}

@media (max-width: 1024px) {
  .explanation-panel {
    width: auto;
    border-left: none;
    border-top: 1px solid var(--gray-medium);
    max-height: 300px;
  }
}
</style>
