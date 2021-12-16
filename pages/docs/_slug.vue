<template>
  <main class="pt-8 mx-auto max-w-7xl md:px-8 flex overflow-hidden">
    <div
      class="
        hidden
        md:block
        fixed
        w-[18rem]
        inset-0
        left-[max(0.01px,calc(50%-40rem))]
        right-auto
        px-8
        py-10
        top-[4.5rem]
        self-start
        flex-shrink-0
        overflow-y-auto
      "
    >
      <SidebarNavigation />
    </div>

    <div class="md:pl-[18rem] overflow-auto w-full">
      <div class="pb-24 border-b border-200 xl:pr-16 xl:mr-[14rem]">
        <div class="pb-8 mb-8 border-b border-gray-200">
          <div>
            <p class="font-semibold text-cyan-500 tracking-tight mb-2 text-sm">
              {{ page.section }}
            </p>
            <h1 class="text-4xl font-bold tracking-tight text-gray-900">
              {{ page.title }}
            </h1>
          </div>

          <p class="text-gray-500 text-lg mt-1">{{ page.subtitle }}</p>
        </div>

        <div class="prose">
          <nuxt-content :document="page" />
        </div>
      </div>

      <div
        class="
          hidden
          fixed
          xl:block
          w-[18rem]
          px-8
          py-10
          top-[4.5rem]
          right-[max(0.01px,calc(50%-40rem))]
          self-start
          overflow-y-auto
          flex-shrink-0
        "
      >
        <TableOfContents :toc="page.toc" />
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
