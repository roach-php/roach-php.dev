<template>
  <ul class="space-y-3 pl-6">
    <li v-for="heading in groupedToc" :key="heading.id" class="relative group">
      <LightningBoltIcon
        class="
          w-6
          h-6
          text-cyan-400
          absolute
          -left-6
          group-hover:rotate-180
          duration-300
          transition
          transform
        "
      />

      <a
        :href="`#${heading.id}`"
        class="
          font-semibold
          text-sm
          inline-flex
          items-center
          pl-1
          hover:text-cyan-500
        "
      >
        <span>{{ heading.text }}</span>
      </a>

      <ul v-if="heading.children" class="pl-6 space-y-3 mt-3">
        <li v-for="subHeading in heading.children" :key="subHeading.id">
          <a :href="`#${subHeading.id}`" class="text-sm hover:text-cyan-500">{{
            subHeading.text
          }}</a>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

interface Toc {
  id: string;
  text: string;
  children: Array<Pick<TocItem, "id" | "text">>;
}

interface TocItem {
  id: string;
  depth: number;
  text: string;
}

export default Vue.extend({
  props: {
    toc: Array as PropType<TocItem[]>,
  },

  computed: {
    groupedToc() {
      const toc: Toc[] = [];

      for (let i = 0; i < this.toc.length; i++) {
        let heading = this.toc[i];

        if (heading.depth === 2) {
          toc.push({ id: heading.id, text: heading.text, children: [] });
        } else {
          toc[toc.length - 1].children.push({
            id: heading.id,
            text: heading.text,
          });
        }
      }

      return toc;
    },
  },
});
</script>
