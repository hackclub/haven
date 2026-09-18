<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<a
  href="#main"
  class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-2xl focus:bg-white focus:px-4 focus:py-2 focus:font-display focus:text-xl focus:text-haven-orange-deep"
>
  Skip to content
</a>

{@render children()}
