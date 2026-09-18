<script lang="ts">
  import { pitchHeading, pitches, pitchesPoc } from "$lib/data/content";

  interface Props {
    poc: boolean;
  }

  let { poc }: Props = $props();

  const stage: Record<string, string> = {
    triangles: "md:absolute md:left-[24.9%] md:top-[55%] md:w-[53.3%]",
    heading: "md:absolute md:left-[28.2%] md:top-[58%] md:w-[46.2%]",
  };

  const BUBBLE_WIDTH = "md:w-[66.7%] md:self-start";
  const bubbleOffset: Record<string, string> = {
    invite: "md:ml-[33.3%]",
    support: "md:ml-0",
    impact: "md:ml-[10%]",
  };

  const bubbleImage: Record<string, string> = {
    invite: "/images/pitch/bubble-1.webp",
    support: "/images/pitch/bubble-2.webp",
    impact: "/images/pitch/bubble-3.webp",
  };

  const alignment = {
    start: "md:self-start",
    center: "md:self-center",
    end: "md:self-end",
  } as const;

  const bubblePadding: Record<string, string> = {
    invite:
      "md:px-[clamp(1.5rem,4vw,1rem)] md:pb-[clamp(2rem,6vw,5rem)] md:px-[8%] md:mb-[4%]",
    support:
      "md:mr-16 md:px-[clamp(0.5rem,2vw,1rem)] md:py-[clamp(1.1rem,2.2vw,1.75rem)] md:px-[2%] md:py-[6%]",
    impact:
      "md:mr-12 md:px-[clamp(0.5rem,2.5vw,1rem)] md:py-[clamp(1rem,2vw,1.5rem)] md:px-[2%] md:py-[4%]",
  };

  const items = $derived(poc ? pitchesPoc : pitches);
</script>

<section
  class="relative flex flex-col items-stretch gap-[clamp(1.5rem,3vw,2.5rem)] md:px-3 pb-[clamp(2rem,5vw,4rem)] pt-[clamp(2.5rem,6vw,5rem)] md:contents"
>
  <img
    src="/images/banner-triangles.webp"
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
    {pitchHeading}
  </h2>

  <div class="flex items-center md:gap-4 pt-4 pb-8 md:contents z-20">
    <div
      class="flex flex-col left-0 md:absolute md:left-[13.26%] md:top-[65%] md:flex md:w-[61.11%] md:flex-col md:gap-[2.83cqw]"
    >
      {#each items as pitch (pitch.id)}
        <div
          class={[
            "relative w-full md:max-w-none",
            alignment[pitch.align],
            BUBBLE_WIDTH,
            bubbleOffset[pitch.id],
          ]}
        >
          <img
            src="/images/pitch/bubble-2.webp"
            alt=""
            aria-hidden="true"
            class={[
              "pointer-events-none absolute inset-0 z-5 h-full w-full object-contain md:hidden",
              pitch.id === "invite" ? "block" : "hidden",
            ]}
          />

          <img
            src="/images/pitch/rounded-rectangle.webp"
            alt=""
            aria-hidden="true"
            class={[
              "pointer-events-none absolute inset-0 z-5 h-full w-full object-contain md:hidden",
              pitch.id === "invite" ? "hidden" : "block",
            ]}
          />

          <img
            src={bubbleImage[pitch.id]}
            alt=""
            aria-hidden="true"
            class={[
              "pointer-events-none absolute inset-0 z-5 hidden h-full w-full object-contain md:block",
              pitch.id === "invite" ? "md:scale-[120%]" : "md:scale-125",
            ]}
          />
          <p
            class={[
              "relative aspect-1268/331 w-full z-10 min-h-[80%] max-w-[90%] px-[clamp(1rem,8vw,6rem)] ml-2 py-[clamp(1.1rem,4vw,2.5rem)] text-center font-body text-[clamp(0.7rem,3vw,1.2rem)] leading-[clamp(0.8rem,3.7vw,6rem)] text-haven-orange-deep md:aspect-auto md:text-[1.55cqw] md:leading-[1.3]",
              bubblePadding[pitch.id],
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
      src="/images/pitch/excited-daven.webp"
      alt=""
      aria-hidden="true"
      class="w-[10%] scale-[500%] -translate-x-3/8 -translate-y-[180%] shrink-0 object-contain md:hidden"
    />
  </div>
</section>
