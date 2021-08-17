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

import { SidebarSection as Section } from "./SidebarSection.vue";

export default Vue.extend({
  data() {
    return {
      sections: [
        {
          label: "Getting started",
          links: [
            {
              label: "Installation",
              to: "/docs/installation",
            },
            {
              label: "Release notes",
              to: "/docs/release-notes",
            },
          ],
        },
        {
          label: "Basic Concepts",
          links: [
            {
              label: "Scraping versus Crawling",
              to: "/docs/scraping-vs-crawling",
            },
            {
              label: "Spiders",
              to: "/docs/spiders",
            },
            {
              label: "Scraping Responses",
              to: "/docs/scraping-responses",
            },
            {
              label: "Items",
              to: "/docs/items",
            },
            {
              label: "Processing Pipeline",
              to: "/docs/processing-pipeline",
            },
          ],
        },
        {
          label: "Extending Roach",
          links: [
            {
              label: "Request middleware",
              to: "/docs/request-middleware",
            },
            {
              label: "Item processors",
              to: "/docs/item-processors",
            },
          ],
        },
      ] as Array<Section>,
    };
  },
});
</script>
