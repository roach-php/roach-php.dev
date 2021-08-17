<template>
  <div>
    <h5 class="text-sm font-medium text-gray-700 px-2">On this page</h5>

    <ul class="mt-4">
      <li
        class="pr-2 py-2 font-medium text-sm text-gray-500 hover:text-gray-900"
        :class="{ 'pl-2': item.depth === 2, 'pl-6': item.depth === 3 }"
        v-for="item in toc"
        :key="item.id"
      >
        <a :href="`#${item.id}`">{{ item.text }}</a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

interface TocItem {
  id: string;
  depth: number;
  text: string;
}

export default Vue.extend({
  props: {
    toc: Array as PropType<TocItem[]>,
  },
});
</script>
