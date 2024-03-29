<template>
  <div>
    <div class="sticky top-0 z-40">
      <PageHeader />

      <div
        class="lg:hidden bg-white border-b border-gray-100 px-4 md:px-8 py-4"
      >
        <div class="flex space-x-3 items-center">
          <MobileNavigation />

          <span class="text-sm text-gray-600">{{ page.section }}</span>
          <span class="font-medium text-gray-400">&raquo;</span>
          <span class="font-medium text-sm text-gray-900">{{
            page.title
          }}</span>
        </div>
      </div>
    </div>

    <main class="mx-auto max-w-8xl px-4 md:px-8 flex overflow-hidden">
      <div
        class="hidden lg:block fixed w-[18rem] inset-0 left-[max(0.01px,calc(50%-45rem))] right-auto px-8 py-10 top-[4.5rem] self-start flex-shrink-0 overflow-y-auto"
      >
        <SidebarNavigation />
      </div>

      <div class="lg:pl-[19rem] overflow-auto w-full">
        <div class="pb-24 pt-8 md:px-0 xl:pr-16 xl:mr-[15.5rem]">
          <div class="pb-8 mb-8 border-b border-gray-200">
            <div>
              <p
                class="font-semibold text-cyan-500 tracking-tight mb-2 text-sm"
              >
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
          class="hidden fixed xl:block w-[18rem] px-8 py-10 top-[4.5rem] right-[max(0.01px,calc(50%-45rem))] self-start overflow-y-auto flex-shrink-0"
        >
          <TableOfContents :toc="page.toc" />
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  head() {
    return {
      title:
        // @ts-ignore
        this.page.slug === "introduction"
          ? "Roach PHP"
          : // @ts-ignore
            `${this.page.title} — Roach PHP`,
    };
  },
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
