<script lang="ts">
  // Who Hack Club is, and where to find it: the same on every page, and not
  // something a city page may reword. Only the artwork here is overridable.
  import { footerBody, footerLinks } from "$lib/data/content";
  import { defaultSiteData } from "$lib/data/site";
  import type { SiteImages } from "$lib/data/images";

  interface Props {
    images?: SiteImages;
  }

  let { images = defaultSiteData.images }: Props = $props();
</script>

<footer
  class="relative pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(2rem,6vw,3rem)] text-white px-[clamp(1rem,4vw,5rem)] md:px-[clamp(3rem,8vw,8rem)]"
>
  <img
    src={images.footerBushes}
    alt=""
    aria-hidden="true"
    class="absolute inset-x-0 bottom-0 w-full object-cover -z-10"
  />

  <div
    class="relative shell z-20 grid grid-cols-1 gap-[clamp(2rem,5vw,4rem)] md:grid-cols-[minmax(0,22rem)_1fr]"
  >
    <div>
      <img
        src={images.logo}
        alt="Hack Club Haven"
        width="778"
        height="445"
        class="w-[clamp(5rem,22vw,12rem)]"
      />

      <nav aria-label="Hack Club" class="mt-[clamp(1.5rem,3vw,2.5rem)]">
        <ul class="flex flex-wrap gap-x-6 gap-y-1 md:flex-col">
          {#each footerLinks as link (link.href)}
            <li>
              <a
                href={link.href}
                class="font-display text-[clamp(0.75rem,3vw,1.5em)] leading-1 tracking-[-0.05em] transition-colors hover:text-haven-yellow"
              >
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>
    </div>

    <div
      class="flex flex-col gap-4 font-body text-[clamp(0.5rem,1.65vw,1rem)] leading-[1.4] md:pt-[clamp(1rem,3vw,2rem)]"
    >
      {#each footerBody as paragraph, i (i)}
        <p>{#each paragraph as seg}{#if seg.href}<a
                class="underline decoration-from-font underline-offset-2 hover:text-haven-yellow"
                href={seg.href}
                target={seg.href.startsWith("http") ? "_blank" : undefined}
                rel={seg.href.startsWith("http")
                  ? "noopener"
                  : undefined}>{seg.text}</a
              >{:else}{seg.text}{/if}{/each}</p>
      {/each}
    </div>
  </div>
</footer>
