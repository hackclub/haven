<script lang="ts">
  import { pitchesPoc } from "$lib/data/content";
  import { defaultSiteData } from "$lib/data/site";
  import type { SiteImages } from "$lib/data/images";
  import type { PitchItem } from "$lib/data/types";

  interface Props {
    poc: boolean;
    heading?: string;
    items?: PitchItem[];
    images?: SiteImages;
  }

  let {
    poc,
    heading = defaultSiteData.pitch.heading,
    items = poc ? pitchesPoc : defaultSiteData.pitch.items,
    images = defaultSiteData.images,
  }: Props = $props();

  const stage: Record<string, string> = {
    triangles: "md:absolute md:left-[24.9%] md:top-[55%] md:w-[53.3%]",
    heading: "md:absolute md:left-[28.2%] md:top-[58%] md:w-[46.2%]",
  };

  const BUBBLE_WIDTH = "md:w-[66.7%] md:self-start";

  // Each bubble is drawn to sit in one place in the illustration, so the copy is
  // matched to the art by position — renaming a bubble does not move it.
  const bubbleOffset = ["md:ml-[33.3%]", "md:ml-0", "md:ml-[10%]"];

  const bubblePadding = [
    "md:px-[clamp(1.5rem,4vw,1rem)] md:pb-[clamp(2rem,6vw,5rem)] md:px-[8%] md:mb-[4%]",
    "md:mr-16 md:px-[clamp(0.5rem,2vw,1rem)] md:py-[clamp(1.1rem,2.2vw,1.75rem)] md:px-[2%] md:py-[6%]",
    "md:mr-12 md:px-[clamp(0.5rem,2.5vw,1rem)] md:py-[clamp(1rem,2vw,1.5rem)] md:px-[2%] md:py-[4%]",
  ];

  const bubbleImage = $derived([
    images.pitchBubble1,
    images.pitchBubble2,
    images.pitchBubble3,
  ]);

  const alignment = {
    start: "md:self-start",
    center: "md:self-center",
    end: "md:self-end",
  } as const;
</script>

<section
  class="relative flex flex-col items-stretch gap-[clamp(1.5rem,3vw,2.5rem)] md:px-3 pb-[clamp(2rem,5vw,4rem)] pt-[clamp(2.5rem,6vw,5rem)] md:contents"
>
  <img
    src={images.pitchTriangles}
    alt=""
    aria-hidden="true"
    width="952"
    height="248"
    class="pointer-events-none hidden select-none md:block {stage.triangles}"
  />

  <h2
    class={[
      "glow-yellow mx-auto max-w-[14ch] text-center font-display text-display text-white md:max-w-none md:text-[4.17cqw] md:leading-[0.8]",
      stage.heading,
    ]}
  >
    {heading}
  </h2>

  <div class="flex items-center md:gap-4 pt-4 pb-8 md:contents z-20">
    <div
      class="flex flex-col left-0 md:absolute md:left-[13.26%] md:top-[65%] md:flex md:w-[61.11%] md:flex-col md:gap-[2.83cqw]"
    >
      {#each items as pitch, index (index)}
        <div
          class={[
            "relative w-full md:max-w-none",
            alignment[pitch.align],
            BUBBLE_WIDTH,
            bubbleOffset[index],
          ]}
        >
          <img
            src={images.pitchBubbleMobile}
            alt=""
            aria-hidden="true"
            class={[
              "pointer-events-none absolute inset-0 z-5 h-full w-full object-contain md:hidden",
              index === 0 ? "block" : "hidden",
            ]}
          />

          <img
            src={images.pitchPanelMobile}
            alt=""
            aria-hidden="true"
            class={[
              "pointer-events-none absolute inset-0 z-5 h-full w-full object-contain md:hidden",
              index === 0 ? "hidden" : "block",
            ]}
          />

          <img
            src={bubbleImage[index] ?? images.pitchBubble1}
            alt=""
            aria-hidden="true"
            class={[
              "pointer-events-none absolute inset-0 z-5 hidden h-full w-full object-contain md:block",
              index === 0 ? "md:scale-[120%]" : "md:scale-125",
            ]}
          />
          <p
            class={[
              "relative aspect-1268/331 w-full z-10 min-h-[80%] max-w-[90%] px-[clamp(1rem,8vw,6rem)] ml-2 py-[clamp(1.1rem,4vw,2.5rem)] text-center font-body text-[clamp(0.7rem,3vw,1.2rem)] leading-[clamp(0.8rem,3.7vw,6rem)] text-haven-orange-deep md:aspect-auto md:text-[1.55cqw] md:leading-[1.3]",
              bubblePadding[index],
            ]}
          >
            {#each pitch.body as segment}{#if segment.mark}<span class="marker"
                  >{segment.text}</span
                >{:else}{segment.text}{/if}{/each}
          </p>
        </div>
      {/each}
    </div>

    <img
      src={images.pitchDaven}
      alt=""
      aria-hidden="true"
      class="w-[10%] scale-[500%] -translate-x-3/8 -translate-y-[180%] shrink-0 object-contain md:hidden"
    />
  </div>
</section>
