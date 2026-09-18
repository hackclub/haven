<script lang="ts">
  import { navLinks } from "$lib/data/content";

  interface Props {
    poc?: boolean;
  }

  let { poc = false }: Props = $props();

  let scrolled = $state(false);

  // The page can load already scrolled (a reload, or a #hash target).
  $effect(() => {
    scrolled = window.scrollY > 10;
  });
</script>

<svelte:window onscroll={() => (scrolled = window.scrollY > 10)} />

<header class="absolute inset-x-0 top-0 z-30">
  <img
    src="/images/nav-banner.png"
    alt=""
    aria-hidden="true"
    width="646"
    height="260"
    class="pointer-events-none fixed right-0 top-0 -z-10 w-[min(41rem,max(46%,calc(13rem_+_8vw)))] max-w-none select-none md:w-[45%] md:right-[clamp(-3rem,-2vw,0rem)] md:top-[clamp(-3rem,-2vw,0rem)]"
  />

  <div
    class={[
      "shell relative flex items-start justify-end pb-3 pt-[clamp(0.5rem,1vw,1.5rem)]",
      poc ? "block" : "hidden",
    ]}
  >
    <a
      href="#top"
      class="absolute left-1/2 top-[var(--logo-top)] -translate-x-1/2"
      aria-label="Hack Club Haven — home"
    >
      <img
        src="/images/logo.webp"
        alt="Hack Club Haven"
        width="778"
        height="445"
        class="w-[var(--logo-w)]"
      />
    </a>
  </div>
</header>

<div
  data-nav-bar
  data-scrolled={scrolled ? "" : undefined}
  class="fixed inset-x-0 top-0 justify-end z-30 flex pb-3 pt-[clamp(0.5rem,1.4vw,1.5rem)] px-[clamp(1rem,4vw,4rem)] pointer-events-none transition-[background-color,backdrop-filter,box-shadow] duration-200"
>
  <nav class="pointer-events-auto" aria-label="Primary">
    <ul class="flex items-center gap-[clamp(1.125rem,2.2vw,2.75rem)]">
      {#each navLinks as link (link.href)}
        <li>
          <a
            href={link.href}
            class="inline-block py-1 font-display text-[clamp(1rem,3.5vw,8rem)] leading-none tracking-[-0.03em] text-haven-yellow transition-colors hover:text-white"
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</div>
