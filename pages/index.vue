<template>
  <div>
    <nuxt-content :document="page" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  async asyncData(context) {
    const page = await context.$content("home").fetch();

    return { page };
  },
});
</script>
