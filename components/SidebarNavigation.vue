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
          label: "Configuring Spiders",
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
              label: "Item Processors",
              to: "/docs/item-processors",
            },
            {
              label: "Extensions",
              to: "/docs/extensions",
            },
          ],
        },
        {
          label: "Extending Roach",
          links: [
            {
              label: "Dependency Injection",
              to: "/docs/dependency-injection",
            },
            {
              label: "Writing Downloader Middleware",
              to: "/docs/writing-downloader-middleware",
            },
            {
              label: "Writing Spider middleware",
              to: "/docs/writing-spider-middleware",
            },
            {
              label: "Item processors",
              to: "/docs/writing-item-processors",
            },
            {
              label: "Writing Extensions",
              to: "/docs/writing-extensions",
            },
          ],
        },
      ] as Array<Section>,
    };
  },
});
</script>
