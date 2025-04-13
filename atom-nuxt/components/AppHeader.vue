<template>
  <div id="header" class="bg-primary text-text-light py-3 text-center shadow-md relative z-5">
    <h1 class="m-0 text-2xl flex items-center justify-center">
      {{ title }} <span class="science-icon ml-2.5 text-3xl">⚛️</span>
    </h1>
    <p class="mt-1.5 mb-0 text-base opacity-90">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Atoms Visualizer'
  },
  subtitle: {
    type: String,
    default: 'Explore atomic structures and electron shells!'
  }
})
</script>
