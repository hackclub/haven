<script lang="ts">
  // Everything on this page comes from src/lib/data/team.json.
  import Meta from "$lib/components/Meta.svelte";
  import SiteFooter from "$lib/components/SiteFooter.svelte";
  import { defaultSiteData } from "$lib/data/site";

  let { data } = $props();

  const team = $derived(data.team);
  const images = defaultSiteData.images;

  // The cards lean like the polaroids on the home page. Cycling through a few
  // angles keeps neighbours from all leaning the same way.
  const TILTS = ["-3deg", "2deg", "-1.5deg", "2.5deg", "-2deg", "1.5deg"];

  /** Stand-in for a missing portrait: "Ada Lovelace" becomes "AL". */
  function initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => Array.from(word)[0])
      .join("")
      .toUpperCase();
  }

  const isExternal = (href: string) => href.startsWith("http");
</script>

<Meta
  title={team.meta.title ?? `Haven — ${team.heading}`}
  description={team.meta.description}
  image={team.meta.image}
/>

<main
  id="main"
  class="relative overflow-x-clip pb-[clamp(4rem,10vw,8rem)]"
>
  <img
    src={images.stepsFlowersTopLeft}
    alt=""
    aria-hidden="true"
    width="864"
    height="1945"
    class="pointer-events-none absolute left-0 top-0 w-[clamp(5rem,18vw,15rem)] select-none"
  />
  <img
    src={images.stepsFlowersTopRight}
    alt=""
    aria-hidden="true"
    width="872"
    height="1372"
    class="pointer-events-none absolute right-0 top-0 w-[clamp(5rem,18vw,15rem)] select-none"
  />

  <header
    class="relative z-10 flex flex-col items-center px-4 pt-[clamp(2rem,5vw,4rem)] text-center"
  >
    <a href="/" aria-label="Hack Club Haven — home">
      <img
        src={images.logo}
        alt="Hack Club Haven"
        width="778"
        height="445"
        class="w-[clamp(8rem,16vw,13rem)] transition-transform hover:scale-105"
      />
    </a>

    <h1
      class="mt-[clamp(1.5rem,3vw,2.5rem)] font-display text-hero text-white text-shadow-[0_0_10px_var(--color-haven-green-deep)]"
    >
      {team.heading}
    </h1>

    {#if team.subheading}
      <p
        class="mt-[clamp(0.75rem,1.5vw,1.25rem)] max-w-[40ch] font-body text-subheading text-white"
      >
        {team.subheading}
      </p>
    {/if}
  </header>

  {#each team.sections as section, sectionIndex (sectionIndex)}
    {#if section.members.length > 0}
      <section
        class="relative z-10 mx-auto mt-[clamp(3rem,7vw,6rem)] max-w-7xl px-4"
      >
        {#if section.heading}
          <h2
            class="-rotate-2 text-center font-display text-display text-white text-shadow-[0_0_10px_var(--color-haven-green-deep)]"
          >
            {section.heading}
          </h2>
        {/if}

        {#if section.blurb}
          <p
            class="mx-auto mt-4 max-w-[48ch] text-center font-body text-lead text-white"
          >
            {section.blurb}
          </p>
        {/if}

        <ul
          class="mt-[clamp(2rem,4vw,3.5rem)] flex flex-wrap justify-center gap-x-[clamp(1.5rem,3vw,2.5rem)] gap-y-[clamp(2rem,4vw,3rem)]"
        >
          {#each section.members as member, i (i)}
            <li class="w-[min(100%,17rem)]">
              <article
                class="polaroid flex h-full flex-col items-center gap-3 px-5 pb-6 pt-5 text-center"
                style:--tilt={TILTS[i % TILTS.length]}
              >
                {#if member.image}
                  <img
                    src={member.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    class={[
                      "aspect-square w-full rounded-[1.25rem] border-2 border-white bg-haven-butter object-cover",
                      member.position,
                    ]}
                  />
                {:else}
                  <div
                    aria-hidden="true"
                    class="flex aspect-square w-full items-center justify-center rounded-[1.25rem] border-2 border-white bg-haven-yellow font-display text-[5rem] leading-none text-haven-orange-deep"
                  >
                    {initials(member.name)}
                  </div>
                {/if}

                <div class="flex flex-col items-center gap-1">
                  <h3
                    class="font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-[0.9] tracking-[-0.05em] text-white"
                  >
                    {member.name}
                  </h3>
                  {#if member.pronouns}
                    <p class="font-body text-base text-white/80">
                      {member.pronouns}
                    </p>
                  {/if}
                </div>

                {#if member.role}
                  <p class="marker font-body text-lg leading-tight">
                    {member.role}
                  </p>
                {/if}

                {#if member.bio}
                  <p class="font-body text-base leading-[1.3] text-white">
                    {member.bio}
                  </p>
                {/if}

                {#if member.links.length > 0}
                  <ul class="mt-auto flex flex-wrap justify-center gap-2 pt-1">
                    {#each member.links as link, linkIndex (linkIndex)}
                      <li>
                        <a
                          href={link.href}
                          target={isExternal(link.href) ? "_blank" : undefined}
                          rel={isExternal(link.href) ? "noopener" : undefined}
                          class="inline-block rounded-full bg-haven-yellow px-3 pb-1.5 pt-1 font-display text-lg leading-none tracking-[-0.03em] text-haven-orange-deep transition-colors hover:bg-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    {/each}
                  </ul>
                {/if}
              </article>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  {/each}

  {#if team.cta}
    <div
      class="relative z-10 mt-[clamp(3rem,7vw,6rem)] flex justify-center px-4"
    >
      <a
        href={team.cta.href}
        target={isExternal(team.cta.href) ? "_blank" : undefined}
        rel={isExternal(team.cta.href) ? "noopener" : undefined}
        class="rounded-[1.875rem] bg-haven-green-deep px-[clamp(1.5rem,3vw,2.5rem)] py-[clamp(1rem,2vw,1.5rem)] text-center font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-none tracking-[-0.03em] text-white shadow-[0_0_10px_var(--color-haven-green-deep)] transition-transform hover:scale-[1.02] active:scale-100"
      >
        {team.cta.label}
      </a>
    </div>
  {/if}
</main>

<SiteFooter />
