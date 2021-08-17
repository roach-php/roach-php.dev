<template>
  <li>
    <h5 class="text-sm font-medium text-gray-700 px-2">
      {{ section.label }}
    </h5>

    <ul class="mt-4">
      <li v-for="link in section.links" :key="link.to">
        <SidebarLink :link="link" />
      </li>
    </ul>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

import { SidebarLink as Link } from "./SidebarLink.vue";

export interface SidebarSection {
  label: string;
  links: Array<Link>;
}

export default Vue.extend({
  props: {
    section: Object as PropType<SidebarSection>,
  },
});
</script>
