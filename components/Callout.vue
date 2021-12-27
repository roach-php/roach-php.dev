<template>
  <div class="bg-sky-100 px-4 py-4 border-l-4 border-sky-400">
    <p class="font-semibold text-sky-900 !m-0">Note</p>

    <div class="callout-content mt-2 text-sky-800">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.callout-content > *:first-child {
  @apply mt-0;
}

.callout-content > *:last-child {
  @apply mb-0;
}
</style>
