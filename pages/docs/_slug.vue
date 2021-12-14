<template>
  <main class="pt-8 mx-auto max-w-7xl px-4 flex">
    <div class="hidden md:block w-72 pt-2.5 self-start flex-shrink-0">
      <SidebarNavigation />
    </div>

    <div class="md:pl-20 lg:pl-20 overflow-auto w-full max-w-3xl">
      <div class="pb-24 border-b border-200">
        <div class="pb-8 mb-8 border-b border-gray-200">
          <div>
            <h1 class="text-4xl font-bold tracking-tight text-gray-900">
              {{ page.title }}
            </h1>
          </div>

          <p class="text-gray-500 text-lg mt-1">{{ page.subtitle }}</p>
        </div>

        <TableOfContents :toc="page.toc" />

        <div class="prose mt-8">
          <nuxt-content :document="page" />
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  async asyncData({ $content, params }) {
    const slug = params.slug || "index";
    const page = await $content(`docs/${slug}`).fetch();

    return { page };
  },
});
</script>

<style>
.prose .nuxt-content > :first-child {
  @apply mt-0;
}

.prose .nuxt-content h2 {
  @apply mt-16;
}

.prose .nuxt-content h3 {
  @apply mt-14;
}
</style>
