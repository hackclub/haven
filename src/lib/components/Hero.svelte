<script lang="ts">
  import {
    event,
    eventPoc,
    organizeCta,
    organizeCtaPoc,
  } from "$lib/data/content";
  import HavenMap from "$lib/components/Map.svelte";
  import type { City } from "$lib/map";
  import SignupForm from "./SignupForm.svelte";
  import VideoPanel from "./VideoPanel.svelte";

  const ORGANIZE_PATH = "/api/auth/redirect";

  interface Props {
    title?: readonly string[];
    tagline?: readonly string[];
    poc: boolean;
    /** Attendee signup form; absent falls the box back to the organizer signup. */
    signupUrl?: string | undefined;
    /** Referral code from `?r=`, forwarded to the signup form. */
    referral?: string | null;
    cities?: City[];
  }

  let {
    poc,
    title = poc ? eventPoc.title : event.title,
    tagline = poc ? eventPoc.tagline : event.tagline,
    signupUrl,
    referral = null,
    cities = [],
  }: Props = $props();

  // Carry whatever the visitor typed into the signup box over to the organizer
  // signup, so they do not have to type their address twice.
  let email = $state("");
  let emailValid = $state(false);

  // A tap opens the full map; a drag pans the small one. Distinguished by how
  // far the pointer travelled between down and up, since MapLibre's own pan
  // handling means a plain click listener can't tell the two apart.
  let mapExpanded = $state(false);
  let mapPointerDown: { x: number; y: number } | null = null;

  // `#top`'s `isolate` (and the `z-20` wrapper the page renders this Hero
  // into) caps this modal's stacking priority no matter what z-index it's
  // given, since the whole section paints as a single layer against
  // SiteHeader's fixed, z-30 nav. Moving the node to <body> escapes that.
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return { destroy: () => node.remove() };
  }

  function handleMapPointerDown(e: PointerEvent) {
    mapPointerDown = { x: e.clientX, y: e.clientY };
  }

  function handleMapPointerUp(e: PointerEvent) {
    if (!mapPointerDown) return;
    const moved = Math.hypot(e.clientX - mapPointerDown.x, e.clientY - mapPointerDown.y);
    mapPointerDown = null;
    if (moved < 6) mapExpanded = true;
  }

  $effect(() => {
    if (!mapExpanded) return;

    document.body.style.overflow = "hidden";
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") mapExpanded = false;
    };
    window.addEventListener("keydown", onKeydown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeydown);
    };
  });

  const signupAction = $derived.by(() => {
    if (!signupUrl) return undefined;
    const url = new URL(signupUrl);
    if (referral) url.searchParams.set("r", referral);
    return url.toString();
  });

  const formAction = $derived(signupAction ?? ORGANIZE_PATH);

  const organizeHref = $derived(
    emailValid && email
      ? `${ORGANIZE_PATH}?email=${encodeURIComponent(email)}`
      : ORGANIZE_PATH,
  );
</script>

<svelte:head>
  {#if signupUrl}<link rel="preconnect" href={new URL(signupUrl).origin} />{/if}
</svelte:head>

<section
  id="top"
  class="rule-frame relative isolate flex min-h-svh flex-col bg-haven-green bg-[url('/images/hero/hero-bg-no-sticky-tree.webp')] bg-cover bg-top bg-no-repeat px-4 pb-[36vw] sm:pb-[clamp(3rem,10vw,min(8rem,8svh))] [--frame-gap:clamp(0.75rem,1.1vw,1rem)] [--frame-offset:clamp(0.5rem,1.1vw,1rem)] [--frame-weight:clamp(3px,0.35vw,5px)]"
>
  <div class={poc ? "hidden" : "block sm:contents"}>
    <div
      class="pointer-events-none relative z-10 flex flex-1 items-center justify-center mt-[clamp(5rem,14vw,20rem)] sm:mt-[clamp(1rem,2vw,15rem)]"
    >
      <div
        class="mx-auto flex w-full flex-col items-center px-[clamp(1rem,4vw,8rem)] text-center sm:pl-[clamp(1rem,4vw,8rem)] sm:items-start sm:pr-[clamp(20rem,45vw,60rem)]"
      >
        <div class="grid grid-cols-2 translate-x-[4%] sm:translate-x-0">
          <img
            src="/images/logo.webp"
            alt="Hack Club Haven"
            width="778"
            height="445"
            class="w-[120%] max-w-none"
          />
          <h1
            class="m-0 font-display text-hero text-white translate-y-[75%] translate-x-[-12%]"
          >
            {title}
          </h1>
        </div>

        <p
          class="glow-orange mt-[clamp(1rem,2.5vw,5rem)] text-[clamp(1rem,4vw,8rem)] leading-[clamp(1rem,4.75vw,5rem)] font-body text-center text-white sm:ml-[clamp(1rem,3vw,8rem)] sm:text-[clamp(1.25rem,2vw,4rem)] sm:leading-[clamp(1.5rem,2.75vw,5rem)] sm:text-start"
        >
          {#each tagline as part, i}
            <span class={i === 0 ? "whitespace-nowrap" : "block"}>{part}</span>
          {/each}
        </p>

        <SignupForm
          {poc}
          action={formAction}
          id="signup-email"
          bind:email
          bind:valid={emailValid}
          class="pointer-events-auto mt-[clamp(1rem,1vw,5rem)] w-[min(90%,28rem)] sm:ml-[clamp(1rem,3vw,8rem)] sm:w-[clamp(15rem,35vw,60rem)]"
        />
        {#if signupAction}
          <a
            href={organizeHref}
            class="pointer-events-auto glow-orange mt-[clamp(0.75rem,1.5vw,1.25rem)] font-body text-[clamp(0.5rem,1vw,1.5rem)] text-white underline decoration-from-font underline-offset-4 transition-opacity hover:opacity-80 sm:ml-[clamp(1rem,3vw,8rem)] sm:text-start sm:text-[clamp(0.9rem,1.6vw,1.75rem)]"
          >
            {organizeCta.label}
          </a>
        {/if}
      </div>
    </div>

    <div
      class="absolute z-10 shell left-1/2 -translate-x-1/2 bottom-[clamp(3rem,3vw,10rem)] justify-center"
    >
      <a href="#about" class="flex-col items-center gap-1">
        <span
          class="font-body text-[clamp(0.5rem,4vw,3rem)] text-white/60 md:text-[clamp(0.5rem,2vw,3rem)]"
          >more info</span
        >
        <img
          src="/images/triangle-down.svg"
          alt=""
          aria-hidden="true"
          width="207"
          height="69"
          class="w-[clamp(2rem,16vw,12rem)] -scale-y-100 md:w-[clamp(2rem,8vw,12rem)]"
        />
      </a>
    </div>

    <div
      class={[
        "panel relative z-0 mx-auto mt-[clamp(2rem,8vw,8rem)] w-[min(85%,28rem)] h-[clamp(20rem,60vw,40rem)] sm:absolute sm:right-10 sm:top-1/2 sm:mx-[clamp(1.5rem,4vw,8rem)] sm:mt-[clamp(2rem,4vw,8rem)] sm:w-[clamp(15rem,35vw,52rem)] sm:h-[clamp(10rem,25vw,50rem)] sm:-translate-y-1/2 lg:w-[clamp(15rem,35vw,80rem)] transition-transform hover:scale-[1.04] active:scale-100",
        poc ? "hidden" : "block",
      ]}
      role="button"
      tabindex="0"
      aria-label="Open full map of Haven events"
      onpointerdown={handleMapPointerDown}
      onpointerup={handleMapPointerUp}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          mapExpanded = true;
        }
      }}
    >
      <div class="absolute inset-0 overflow-hidden rounded-[inherit]">
        <HavenMap
          {cities}
          height="100%"
        />
      </div>

      <img
        src="/images/hero/hero-arrow.webp"
        alt=""
        aria-hidden="true"
        class="absolute rotate-24 right-[clamp(1rem,4vw,8rem)] top-[clamp(0rem,0vw,10rem)] z-20 w-[clamp(2rem,12vw,6rem)] sm:right-[clamp(1rem,12vw,30rem)] sm:top-[clamp(-10rem,-3vw,0rem)] sm:w-[clamp(2rem,8vw,20rem)] hidden sm:block"
      />
      <img
        src="/images/hero/hero-arrow-white.webp"
        alt=""
        aria-hidden="true"
        class="absolute rotate-24 right-[clamp(1rem,6vw,10rem)] top-[clamp(-10rem,-2vw,0rem)] z-20 w-[clamp(2rem,12vw,6rem)] block sm:hidden"
      />
      <p
        class="text-white text-center -translate-y-[120%] left-50 text-[clamp(0.875rem,4vw,10rem)] sm:text-haven-butter sm:left-0 sm:-rotate-8 sm:text-[clamp(1rem,3vw,10rem)] sm:-translate-y-[120%] sm:-translate-x-[40%]"
      >
        find an event near you
      </p>
    </div>

    <img
      src="/images/hedgehog.webp"
      alt=""
      aria-hidden="true"
      width="422"
      height="308"
      class="pointer-events-none absolute object-contain bottom-0 right-[6%] z-20 w-[clamp(8rem,40vw,14rem)] scale-x-[-1] aspect-422/308 select-none sm:right-[9.6%] sm:max-h-[30svh] sm:w-[15%] sm:max-w-[21rem]"
    />

    <img
      src="/images/hero-foreground.webp"
      alt=""
      aria-hidden="true"
      width="1414"
      height="501"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-20 w-full max-w-none translate-y-[55%] select-none"
    />
  </div>

  <!-- poc version ok don't change thisss -->
  <div class={poc ? "block" : "hidden"}>
    <div class="relative z-10 flex flex-1 items-center justify-center">
      <div
        class="mx-auto flex w-full mt-[clamp(10rem,15vw,25rem)] max-w-[120rem] flex-col items-center text-center"
      >
        <h1
          class="glow-orange font-display text-hero text-white [word-spacing:0.18em]"
        >
          {#each title as line, i}
            <span class="block">{i > 0 ? " " : ""}{line}</span>
          {/each}
        </h1>

        <p
          class="glow-orange mt-[clamp(1rem,2.5vw,4rem)] font-body text-subheading text-white"
        >
          {#each tagline as part, i}
            {#if i > 0}
              <span aria-hidden="true" class="mx-2 hidden sm:inline"
                >&hearts;</span
              >
            {/if}
            <span class={i === 0 ? "whitespace-nowrap" : "block sm:inline"}>
              {part}
            </span>
          {/each}
        </p>

        <SignupForm
          {poc}
          action={formAction}
          id="signup-email-poc"
          bind:email
          bind:valid={emailValid}
          class="mt-[clamp(1.5rem,3vw,4rem)] w-[clamp(15rem,35vw,52rem)]"
        />

        {#if signupAction}
          <a
            href={organizeHref}
            class="glow-orange mt-[clamp(0.75rem,1.5vw,1.25rem)] font-body text-[clamp(0.9rem,1.6vw,1.75rem)] text-white underline decoration-from-font underline-offset-4 transition-opacity hover:opacity-80"
          >
            {poc ? organizeCtaPoc.label : organizeCta.label}
          </a>
        {/if}
      </div>
    </div>

    <div
      class="absolute z-10 shell left-1/2 -translate-x-1/2 bottom-[clamp(3rem,3vw,10rem)] justify-center"
    >
      <a href="#about" class="flex-col items-center gap-1">
        <span class="font-body text-[clamp(0.5rem,3vw,1.5rem)] text-white/60"
          >more info</span
        >
        <img
          src="/images/triangle-down.svg"
          alt=""
          aria-hidden="true"
          width="207"
          height="69"
          class="w-[clamp(2rem,12vw,6rem)] -scale-y-100"
        />
      </a>
    </div>

    <VideoPanel
      videoId="8tNEPMI5wss"
      class="relative z-20 mx-auto mt-8 w-full max-w-[25rem] sm:absolute sm:right-[clamp(1.25rem,2.4vw,2.5rem)] sm:bottom-[clamp(1.25rem,2.4vw,2.5rem)] sm:m-0 sm:w-[min(24vw,26rem,34svh)] sm:max-w-none"
    />

    <img
      src="/images/hedgehog.webp"
      alt=""
      aria-hidden="true"
      width="422"
      height="308"
      class="pointer-events-none absolute object-contain bottom-0 left-[6%] z-10 w-[clamp(8rem,40vw,14rem)] aspect-422/308 select-none sm:left-[9.6%] sm:max-h-[30svh] sm:w-[24%] sm:max-w-[21rem]"
    />

    <img
      src="/images/hero-foreground.webp"
      alt=""
      aria-hidden="true"
      width="1414"
      height="501"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-20 w-full max-w-none translate-y-[55%] select-none"
    />
  </div>

  {#if mapExpanded}
    <!-- svelte-ignore a11y_click_events_have_key_events -- Escape is handled globally in the $effect above, regardless of focus -->
    <div
      use:portal
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-10"
      role="dialog"
      aria-modal="true"
      aria-label="Map of Haven events"
      tabindex="-1"
      onclick={(e) => {
        if (e.target === e.currentTarget) mapExpanded = false;
      }}
    >
      <button
        type="button"
        onclick={() => (mapExpanded = false)}
        aria-label="Close map"
        class="fixed left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-haven-orange-deep shadow-lg transition-transform hover:scale-110 active:scale-100"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div class="panel relative h-[min(90vh,56rem)] w-[min(94vw,80rem)] overflow-hidden">
        <HavenMap
          {cities}
          height="100%"
        />
      </div>
    </div>
  {/if}
</section>
