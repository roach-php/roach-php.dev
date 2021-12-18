<template>
  <div class="flex items-center">
    <button @click="show = true" class="text-gray-500 hover:text-gray-600">
      <svg width="24" height="24">
        <path
          d="M5 6h14M5 12h14M5 18h14"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        ></path>
      </svg>
    </button>

    <div v-if="show" class="fixed z-50 overflow-y-auto lg:hidden inset-0">
      <div
        class="bg-black/20 fixed inset-0 backdrop-blur-sm"
        @click="show = false"
      ></div>

      <div
        class="relative bg-white w-80 max-w-[calc(100%-3rem)] px-6 pt-10 pb-6 min-h-full"
      >
        <button
          @click="show = false"
          class="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-600"
        >
          <svg viewBox="0 0 10 10" class="w-2.5 h-2.5 overflow-visible">
            <path
              d="M0 0L10 10M10 0L0 10"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            ></path>
          </svg>
        </button>

        <SidebarNavigation :sections="sections" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      show: false,
    };
  },

  props: {
    sections: {
      type: Array,
      required: true,
    },
  },

  computed: {
    htmlTag() {
      return document.documentElement;
    },
  },

  watch: {
    show(newValue) {
      if (newValue) {
        this.htmlTag.style.overflowY = "hidden";
      } else {
        this.htmlTag.style.overflowY = "auto";
      }
    },
  },

  mounted() {
    this.htmlTag.style.overflowY = "auto";
  },
});
</script>
