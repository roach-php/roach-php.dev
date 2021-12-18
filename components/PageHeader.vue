<template>
  <div class="bg-white sticky top-0 w-full z-40 border-b border-gray-100">
    <header
      class="max-w-8xl mx-auto px-8 py-4 flex items-center justify-between"
    >
      <NuxtLink to="/" class="mr-4">
        <RoachLogo />
      </NuxtLink>

      <div class="flex items-center">
        <SearchInput />

        <nav class="hidden md:block space-x-2 ml-8">
          <HeaderNavLink v-for="link in links" :key="link.to" :link="link" />
        </nav>
      </div>
    </header>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { HeaderNavLink as NavLink } from "./HeaderNavLink.vue";

export default Vue.extend({
  data() {
    return {
      links: [
        {
          label: "Docs",
          to: "/docs/installation",
        },
        {
          label: "Github",
          to: "https://github.com/roach-php/roach",
          external: true,
        },
      ] as NavLink[],
    };
  },
});
</script>
