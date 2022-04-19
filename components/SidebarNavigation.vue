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

import { SidebarSection as Section } from "@/components/SidebarSection.vue";

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
              label: "Releases",
              to: "/docs/releases",
            },
            {
              label: "Upgrade Guide",
              to: "/docs/upgrade-guide",
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
            {
              label: "Interactive Shell",
              to: "/docs/repl",
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
              label: "Configuring Middleware and Extensions",
              to: "/docs/configuring-middleware-and-extensions",
            },
            {
              label: "Dependency Injection",
              to: "/docs/dependency-injection",
            },
            {
              label: "Testing",
              to: "/docs/testing",
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
            {
              label: "Symfony",
              to: "/docs/symfony",
            },
          ],
        },
      ] as Array<Section>,
    };
  },
});
</script>
