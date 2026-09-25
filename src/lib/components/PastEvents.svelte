<script lang="ts">
  import { defaultSiteData } from "$lib/data/site";
  import type { PastEvent } from "$lib/data/types";

  interface Props {
    /** One line per entry. */
    heading?: string[];
    items?: PastEvent[];
  }

  let {
    heading = defaultSiteData.pastEvents.heading,
    items = defaultSiteData.pastEvents.items,
  }: Props = $props();

  const stage = [
    "ml-[clamp(0rem,28vw-6rem,8rem)] md:absolute md:left-[9.2%] md:top-[31.2%] md:w-[25.8%]",
    "md:absolute md:left-[39.2%] md:top-[28.6%] md:w-[25.8%]",
    "mr-[clamp(0rem,28vw-6rem,8rem)] md:absolute md:left-[68.6%] md:top-[26.1%] md:w-[25.8%]",
  ];
</script>

<section
  class="relative flex flex-col gap-[clamp(1rem,4vw,1.5rem)] px-5 pb-[clamp(8rem,12vw,10rem)] pt-[clamp(6rem,8vw,8.5rem)] sm:pb-0 md:contents"
>
  <h2
    class="mx-auto max-w-[42ch] -rotate-3 text-center font-display text-subheading text-white pt-[clamp(6rem,40vw,20rem)] md:pt-0 md:absolute md:left-[15.2%] md:top-[20%] md:w-[71.1%] md:max-w-none md:-rotate-4 md:text-[2.43cqw] md:leading-[0.9]"
  >
    {#each heading as line, lineIndex (lineIndex)}<span class="block">{line}</span
      >{/each}
  </h2>

  {#each items as item, i (i)}
    <article
      class={[
        "polaroid mx-auto flex w-[85%] max-w-[24rem] px-8 mt-12 md:mt-0 flex-col items-center gap-4 text-center md:px-[clamp(1.25rem,2vw,2rem)] md:mx-0 md:max-w-none",
        stage[i],
      ]}
    >
      <h3
        class="font-display text-[clamp(2rem,4vw,4rem)] pt-[clamp(1rem,4vw,1.5rem)] md:text-subheading text-white md:pt-4 md:text-[2.78cqw] md:leading-none"
      >
        {item.title}
      </h3>

      <a
        href={item.href}
        target="_blank"
        rel="noopener"
        class="relative block w-full max-w-[clamp(20rem,100%,25rem)] overflow-hidden rounded-[1.25rem] border-2 border-white md:max-w-full md:rounded-[1.4cqw]"
      >
        <span class="sr-only">Watch the {item.title} video</span>
        <img
          src={item.image}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          class={["aspect-[3/2] w-full object-cover ", item.position]}
        />
        <img
          src={item.play}
          alt=""
          aria-hidden="true"
          width="72"
          height="65"
          class="pointer-events-none absolute top-1/2 left-1/2 w-[19%] -translate-x-1/2 -translate-y-1/2 -rotate-[40deg] select-none drop-shadow-[0_2px_6px_rgb(0_0_0/0.35)]"
        />
      </a>

      <p
        class="font-body text-subheading pb-[clamp(1rem,4vw,1.5rem)] md:py-0 text-white md:pb-6 md:text-[1.55cqw] md:leading-[1.05]"
      >
        {item.caption}
      </p>
    </article>
  {/each}
</section>
