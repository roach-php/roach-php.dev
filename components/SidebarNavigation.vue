<template>
  <ul class="space-y-10">
    <SidebarSection
      v-for="section in sections"
      :key="section.label"
      :section="section"
    />
  </ul>
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
