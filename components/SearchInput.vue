<template>
  <div id="search"></div>
</template>

<script lang="ts">
import Vue from "vue";
// @ts-ignore
import docsearch from "@docsearch/js";

export default Vue.extend({
  mounted() {
    docsearch({
      appId: "3RZ9QOSVX1",
      apiKey: "07db00be231d9991eb4c2a85dc56f1fb",
      indexName: "roach-php",
      container: "#search",
      debug: false,
    });
  },
});
</script>
