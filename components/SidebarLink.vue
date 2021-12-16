<template>
  <NuxtLink
    :to="link.to"
    class="
      inline-block
      w-full
      rounded-md
      text-sm text-gray-500
      current:bg-cyan-100 current:text-cyan-700
      hover:text-gray-900
      font-medium
      py-2
      px-2
      -ml-2
    "
  >
    {{ link.label }}
  </NuxtLink>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export interface SidebarLink {
  label: string;
  to: string;
}

export default Vue.extend({
  props: {
    link: Object as PropType<SidebarLink>,
  },
});
</script>
