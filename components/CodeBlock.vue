<template>
  <div class="relative">
    <div
      class="
        absolute
        -right-2
        -bottom-2
        w-full
        h-full
        bg-gradient-to-r
        from-cyan-300
        to-cyan-400
        rounded-xl
      "
    ></div>

    <slot />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({});
</script>
