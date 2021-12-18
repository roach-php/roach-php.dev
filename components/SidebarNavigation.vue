<template>
  <div>
    <SidebarLink :link="{ label: 'Introduction', to: '/docs/introduction' }">
      Introduction
    </SidebarLink>

    <ul class="space-y-10 mt-6">
      <SidebarSection
        v-for="section in sections"
        :key="section.label"
        :section="section"
      />
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    sections: {
      type: Array,
      required: true,
    },
  },
});
</script>
