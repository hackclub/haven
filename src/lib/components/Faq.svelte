<script lang="ts">
  import { defaultSiteData } from "$lib/data/site";
  import type { SiteImages } from "$lib/data/images";
  import type { FaqItem } from "$lib/data/types";

  interface Props {
    heading?: string;
    items?: FaqItem[];
    /** Label on the button that jumps back to the signup box. */
    cta?: string;
    images?: SiteImages;
  }

  let {
    heading = defaultSiteData.faq.heading,
    items = defaultSiteData.faq.items,
    cta = defaultSiteData.faq.cta,
    images = defaultSiteData.images,
  }: Props = $props();

  const columns = $derived([
    items.filter((_, i) => i % 2 === 0),
    items.filter((_, i) => i % 2 === 1),
  ]);
</script>

<section
  id="faq"
  class="relative pb-0 pt-[clamp(3.5rem,11vw,7.875rem)] md:pt-[clamp(2rem,6vw,15rem)] md:pb-[clamp(2rem,6vw,15rem)]"
>
  <img
    src={images.faqSky}
    alt=""
    aria-hidden="true"
    class="absolute z-10 pointer-events-none top-0 w-full -translate-y-[clamp(0.5rem,2vw,1rem)] md:-translate-y-[clamp(2rem,9vw,6rem)]"
  />
  <img
    src={images.faqGround}
    alt=""
    aria-hidden="true"
    class="absolute z-10 pointer-events-none top-[clamp(10rem,40vw,16rem)] w-full md:top-[clamp(3.5rem,32vw,25rem)]"
  />
  <img
    src={images.faqBushLeft}
    alt=""
    aria-hidden="true"
    class="absolute z-15 pointer-events-none -left-[clamp(2rem,24vw,17rem)] top-[clamp(9rem,28vw,16rem)] w-[clamp(8rem,40vw,30rem)] md:top-[clamp(3.5rem,20vw,18rem)]"
  />
  <img
    src={images.faqBushRight}
    alt=""
    aria-hidden="true"
    class="absolute z-15 pointer-events-none -right-[clamp(2rem,28vw,17rem)] top-[clamp(9rem,32vw,20rem)] w-[clamp(8rem,40vw,30rem)] md:top-[clamp(3.5rem,24vw,22rem)]"
  />
  <div
    class="shell pt-[clamp(1rem,8vw,10rem)] pb-[clamp(1rem,4vw,10rem)] md:pt-[clamp(3rem,10vw,10rem)] md:pb-[clamp(2rem,5vw,6rem)] md:px-[clamp(2rem,5vw,6rem)]"
  >
    <img
      src={images.faqBushBack}
      alt=""
      aria-hidden="true"
      class="absolute z-10 pointer-events-none left-1/2 -translate-x-1/2 bottom-[clamp(5rem,20vw,25rem)] w-[120%] max-w-none max-h-[80rem] md:bottom-[clamp(0rem,8vw,20rem)]"
    />
    <img
      src={images.faqPondLeft}
      alt=""
      aria-hidden="true"
      class="absolute z-10 pointer-events-none left-[clamp(2rem,5vw,5rem)] bottom-[clamp(7rem,28vw,35rem)] w-[88%] sm:w-[60%] md:bottom-[clamp(2rem,20vw,24rem)]"
    />
    <img
      src={images.faqPondRight}
      alt=""
      aria-hidden="true"
      class="absolute z-10 pointer-events-none right-[clamp(2rem,5vw,5rem)] bottom-[clamp(5rem,25vw,25rem)] w-[60%] md:bottom-[clamp(2rem,10vw,15rem)]"
    />
    <img
      src={images.faqPondFront}
      alt=""
      aria-hidden="true"
      class="absolute z-10 pointer-events-none left-1/2 -translate-x-1/2 bottom-[clamp(2rem,4vw,10rem)] w-[85%] md:bottom-[clamp(1rem,0vw,10rem)]"
    />
    <img
      src={images.faqBushFrontLeft}
      alt=""
      aria-hidden="true"
      class="absolute z-10 pointer-events-none -left-[clamp(2rem,12vw,15rem)] bottom-0 translate-y-1/8 w-[70%] max-w-none md:w-[50%] md:translate-y-1/8 md:bottom-0"
    />
    <img
      src={images.faqBushFrontRight}
      alt=""
      aria-hidden="true"
      class="absolute z-10 pointer-events-none -right-[clamp(2rem,12vw,15rem)] bottom-0 translate-y-1/8 w-[70%] max-w-none md:w-[50%] md:translate-y-1/8 md:bottom-0"
    />
    <h2
      class="relative z-15 text-center font-display text-[clamp(3.5rem,8vw,10rem)] leading-[0.8] tracking-tighter text-white text-shadow-[0_0_10px_var(--color-haven-blue-deep)]"
    >
      {heading}
    </h2>

    <div
      class="relative z-10 mt-[clamp(3rem,18vw,15rem)] grid grid-cols-1 items-start mx-[clamp(1rem,10vw,8rem)] gap-x-[clamp(1rem,2vw,1.75rem)] md:px-[clamp(1rem,5vw,6rem)] md:mx-auto md:w-[100%] md:grid-cols-2 md:gap-x-[2%] md:items-stretch"
    >
      {#each columns as column, colIndex}
        <ul
          class="relative flex flex-col md:z-auto"
          style="z-index: {columns.length - colIndex}"
        >
          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 -z-10 -top-[clamp(2rem,7vw,10rem)] overflow-hidden"
          >
            <img
              src={images.faqLeaves}
              alt=""
              aria-hidden="true"
              class="absolute left-1/2 top-0 -translate-x-[48%] w-[92%] h-auto object-cover object-top"
            />
          </div>
          {#each column as item, i (i)}
            <li
              class="relative overflow-hidden"
              style="z-index: {column.length - i}"
            >
              <details
                name="faq-accordion"
                class="group relative z-10 rounded-[1.25rem] md:rounded-[1.4cqw]"
              >
                <summary
                  class="relative z-10 flex cursor-pointer list-none items-center justify-between gap-4 px-[clamp(2rem,12vw,12rem)] pt-[clamp(1rem,2vw,5rem)] pb-[clamp(1rem,12vw,12rem)] font-display text-[clamp(1.125rem,1.9vw,1.875rem)] leading-[0.9] tracking-[-0.05em] text-white group-open:pb-2.5 sm:px-[clamp(2rem,12vw,12rem)] sm:pt-[clamp(1rem,3vw,6rem)] sm:pb-[clamp(1rem,12vw,15rem)] md:px-[clamp(2rem,8vw,8rem)] md:pt-[clamp(0rem,1vw,2rem)] md:pb-[clamp(2rem,6vw,10rem)] md:leading-[1.1] md:text-[clamp(1.125rem,1.6vw,2rem)] md:group-open:pb-[0.9cqw] [&::-webkit-details-marker]:hidden"
                >
                  {item.q}
                  <img
                    src={images.faqChevron}
                    alt=""
                    aria-hidden="true"
                    class="w-[clamp(1.125rem,1.6vw,1.875rem)] shrink-0 transition-transform transition-ease-in-out duration-200 group-open:rotate-180 md:w-[1.6cqw]"
                  />
                </summary>
                <p
                  class="relative z-10 px-[clamp(2rem,12vw,12rem)] pt-[clamp(0rem,1vw,3rem)] pb-[clamp(1rem,10vw,8rem)] font-body text-[clamp(1rem,2vw,2rem)] leading-[1.25] tracking-[-0.03em] text-white sm:px-[clamp(2rem,12vw,12rem)] md:px-[clamp(2rem,8vw,8rem)] md:pb-[clamp(1rem,8vw,10rem)] md:pt-[clamp(0.5rem,1.5vw,4rem)] md:text-[clamp(1rem,1.4vw,1.5rem)] md:leading-[1.25]"
                >{#each item.a as seg}{#if seg.href}<a
                        href={seg.href}
                        class="underline decoration-from-font underline-offset-2 hover:text-haven-orange-mid"
                        target={seg.href.startsWith("http")
                          ? "_blank"
                          : undefined}
                        rel={seg.href.startsWith("http")
                          ? "noopener"
                          : undefined}>{seg.text}</a
                      >{:else}{seg.text}{/if}{/each}</p>
              </details>

              <img
                src={images.faqCard}
                alt=""
                aria-hidden="true"
                class="pointer-events-none absolute left-0 bottom-0 z-0 w-full h-auto object-cover object-bottom [details[open]~&]:hidden"
              />
              <img
                src={images.faqCard}
                alt=""
                aria-hidden="true"
                class="pointer-events-none absolute left-0 bottom-0 z-0 hidden w-full h-auto object-cover object-bottom [details[open]~&]:block"
              />
            </li>
          {/each}
        </ul>
      {/each}
    </div>

    <div
      class="relative flex items-center justify-center mx-auto gap-[clamp(1rem,4vw,5rem)]"
    >
      <img
        src={images.faqArrow}
        alt=""
        aria-hidden="true"
        class="relative scale-x-[-1] pointer-events-none z-20 w-[18%] md:w-[10%] h-auto"
      />

      <a
        href="#top"
        class="relative translate-y-[80%] z-20 py-[clamp(1rem,3vw,5rem)] mt-[clamp(2rem,4vw,8rem)] mb-[clamp(4rem,24vw,20rem)] block w-[50%] rounded-[1.875rem] bg-haven-green-deep shadow-[0_0_10px_var(--color-haven-green-deep)] px-6 text-center font-display text-[clamp(1.5rem,4vw,2.5rem)] leading-none tracking-[-0.03em] text-white transition-transform hover:scale-[1.02] active:scale-100 md:mb-[clamp(4rem,14vw,6rem)] md:mt-[clamp(1rem,5vw,4rem)] md:w-[25%] md:max-w-none md:rounded-[2.1cqw] md:py-[1.5cqw] md:text-[clamp(1.5rem,3vw,2.5rem)]"
      >
        {cta}
      </a>

      <img
        src={images.faqArrow}
        alt=""
        aria-hidden="true"
        class="relative pointer-events-none z-20 w-[18%] md:w-[10%] h-auto"
      />
    </div>
  </div>
</section>
