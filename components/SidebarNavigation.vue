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
          label: "Getting Started",
          links: [
            {
              label: "Installation",
              to: "/docs/installation",
            },
            {
              label: "Release notes",
              to: "/docs/release-notes",
            },
            {
              label: "Scraping versus Crawling",
              to: "/docs/scraping-vs-crawling",
            },
          ],
        },
        {
          label: "Basic Concepts",
          links: [
            {
              label: "Spiders",
              to: "/docs/spiders",
            },
            {
              label: "Processing Responses",
              to: "/docs/processing-responses",
            },
            {
              label: "Items",
              to: "/docs/items",
            },
            {
              label: "Item Pipeline",
              to: "/docs/item-pipeline",
            },
          ],
        },
        {
          label: "Advanced Usage",
          links: [
            {
              label: "Spider Middleware",
              to: "/docs/spider-middleware",
            },
            {
              label: "Downloader Middleware",
              to: "/docs/downloader-middleware",
            },
            {
              label: "Extensions",
              to: "/docs/extensions",
            },
            {
              label: "Dependency Injection",
              to: "/docs/dependency-injection",
            },
          ],
        },
        {
          label: "Framework Integration",
          links: [
            {
              label: "Laravel",
              to: "/docs/laravel",
            },
          ],
        },
      ] as Array<Section>,
    };
  },
});
</script>
