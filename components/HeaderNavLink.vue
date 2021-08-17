<script lang="ts">
import Vue, { PropType } from "vue";

export interface HeaderNavLink {
  label: string;
  to: string;
  external?: boolean;
}

export default Vue.extend({
  props: {
    link: Object as PropType<HeaderNavLink>,
  },

  render(h) {
    const classes =
      "font-medium text-gray-700 rounded-md py-2 px-3 current:bg-cyan-400 hover:bg-cyan-400 current:text-white hover:text-white text-sm";

    if (this.link.external) {
      return h(
        "a",
        {
          attrs: {
            href: this.link.to,
            target: "_blank",
            rel: "noreferrer noopener",
          },
          staticClass: classes,
        },
        this.link.label
      );
    }

    return h(
      "NuxtLink",
      {
        props: { to: this.link.to },
        staticClass: classes,
      },
      this.link.label
    );
  },
});
</script>
