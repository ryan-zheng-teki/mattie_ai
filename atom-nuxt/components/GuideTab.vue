<template>
  <div class="guide-content p-5 bg-white">
    <h3 class="text-primary-dark text-center mt-0 text-2xl">How to Read the Atom View</h3>
    <div class="guide-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="guide-item flex items-center bg-gray-light p-4 rounded-lg shadow-sm">
        <div class="guide-icon nucleus-icon w-[60px] h-[60px] rounded-full mr-4 flex-shrink-0 flex items-center justify-center bg-nucleus"></div>
        <div class="guide-text">
          <h4 class="m-0 mb-1 text-primary-dark">Nucleus</h4>
          <p class="m-0 text-sm">The center of the atom where protons and neutrons live!</p>
        </div>
      </div>
      <div class="guide-item flex items-center bg-gray-light p-4 rounded-lg shadow-sm">
        <div class="guide-icon shell-icon w-[60px] h-[60px] rounded-full mr-4 flex-shrink-0 flex items-center justify-center border-2 border-shell2"></div>
        <div class="guide-text">
          <h4 class="m-0 mb-1 text-primary-dark">Shells</h4>
          <p class="m-0 text-sm">Colored rings where electrons orbit - each shell can only hold so many electrons.</p>
        </div>
      </div>
      <div class="guide-item flex items-center bg-gray-light p-4 rounded-lg shadow-sm">
        <div class="guide-icon electron-icon-2 w-[60px] h-[60px] rounded-full mr-4 flex-shrink-0 flex items-center justify-center bg-electron2"></div>
        <div class="guide-text">
          <h4 class="m-0 mb-1 text-primary-dark">Electrons</h4>
          <p class="m-0 text-sm">Tiny particles that buzz around the nucleus in specific shells. Different colors show which shell they belong to.</p>
        </div>
      </div>
      <div class="guide-item flex items-center bg-gray-light p-4 rounded-lg shadow-sm">
        <div class="guide-icon w-[60px] h-[60px] rounded-full mr-4 flex-shrink-0 flex items-center justify-center">
          <i class="fas fa-hand-pointer text-2xl text-accent"></i>
        </div>
        <div class="guide-text">
          <h4 class="m-0 mb-1 text-primary-dark">Controls</h4>
          <p class="m-0 text-sm">Drag to rotate, scroll to zoom, and use the control buttons for more options!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No dynamic logic needed for this component
</script>
