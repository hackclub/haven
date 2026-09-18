<script lang="ts">
  const EMBED_ALLOW =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

  interface Props {
    videoId: string;
    title?: string;
    class?: string;
  }

  let {
    videoId,
    title = "Watch the Haven intro video",
    class: className,
  }: Props = $props();

  const poster = $derived(`https://i.ytimg.com/vi/${videoId}/hq720.jpg`);

  let open = $state(true);
  let playing = $state(false);

  // Closing the panel tears the iframe down so the video stops.
  $effect(() => {
    if (!open) playing = false;
  });
</script>

<details
  bind:open
  class={[
    "group rounded-[1rem] bg-white/80 p-[clamp(0.1rem,0.9vw,1rem)] shadow-[0_0_4px_2px_rgb(255_255_255/0.5)] sm:shadow-none",
    className,
  ]}
>
  <summary
    class="hidden cursor-pointer list-none items-center justify-between gap-3 px-1 font-body text-[clamp(1rem,1vw,1.7rem)] leading-none text-haven-orange-mid group-open:pb-2 sm:flex [&::-webkit-details-marker]:hidden"
  >
    <span class="group-open:hidden">watch video</span>
    <span class="hidden group-open:inline">close video</span>
    <img
      src="/images/faq-chevron.webp"
      alt=""
      aria-hidden="true"
      width="416"
      height="256"
      class="w-[clamp(1.5rem,1.8vw,2.5rem)] rotate-180 shrink-0 transition-transform duration-200 group-open:rotate-0"
    />
  </summary>

  <div
    class="relative aspect-video w-full overflow-hidden rounded-[0.75rem] bg-haven-orange-mid"
  >
    {#if playing}
      <iframe
        src="https://www.youtube-nocookie.com/embed/{videoId}?autoplay=1&rel=0"
        {title}
        allow={EMBED_ALLOW}
        allowfullscreen
        class="absolute inset-0 h-full w-full border-0"
      ></iframe>
    {:else}
      <button
        type="button"
        onclick={() => (playing = true)}
        class="absolute inset-0 grid h-full w-full cursor-pointer place-items-center border-0 bg-transparent p-0"
      >
        <span class="sr-only">{title}</span>
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <img
          src="/images/play-triangle-1.svg"
          alt=""
          aria-hidden="true"
          width="72"
          height="65"
          class="relative w-[22%] -rotate-[33deg] select-none drop-shadow-[0_2px_6px_rgb(0_0_0/0.45)] transition-transform duration-200 ease-bounce group-hover:scale-110"
        />
      </button>
    {/if}
  </div>
</details>
