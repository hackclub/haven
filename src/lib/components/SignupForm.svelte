<script lang="ts">
  interface Props {
    class?: string;
    poc: boolean;
    /** Unique per instance: both hero variants render a form into the page. */
    id?: string;
    email?: string;
    /** Mirrors the input's own validity, so callers can reuse the address. */
    valid?: boolean;
  }

  let {
    class: className = "",
    poc,
    id = "signup-email",
    email = $bindable(""),
    valid = $bindable(false),
  }: Props = $props();

  let input: HTMLInputElement | undefined = $state();

  $effect(() => {
    // Read `email` so this re-runs on every keystroke.
    email;
    valid = input?.validity.valid ?? false;
  });
</script>

<form
  method="get"
  action="/api/auth/redirect"
  class="flex items-center gap-2 rounded-[clamp(0.5rem,2.5vw,1.5rem)] bg-white/70 p-[clamp(0.4rem,0.5vw,0.625rem)] shadow-[0_0_8px_2px_rgb(250_104_27/0.65)] transition-transform hover:scale-[1.04] active:scale-100 {className}"
>
  <label for={id} class="sr-only">Your email address</label>
  <input
    {id}
    name="email"
    type="email"
    required
    autocomplete="email"
    bind:this={input}
    bind:value={email}
    placeholder={poc ? "enter email to organize" : "you@hackclub.com"}
    class="min-w-0 flex-1 bg-transparent px-[clamp(0.75rem,1.6vw,1.5rem)] py-1 font-body text-[clamp(1rem,2vw,3.125rem)] leading-tight tracking-[-0.03em] text-haven-orange-deep placeholder:text-haven-orange-deep focus:outline-none"
  />
  <button
    type="submit"
    class="shrink-0 rounded-[clamp(0.25rem,2.5vw,1.25rem)] bg-haven-orange-bright px-[clamp(0.9rem,1.9vw,2rem)] py-[clamp(0.5rem,0.7vw,1rem)] transition-transform hover:scale-[1.04] active:scale-100"
  >
    <span class="sr-only">Sign up to organize</span>
    <img
      src="/images/signup-arrow.webp"
      alt=""
      aria-hidden="true"
      width="293"
      height="252"
      class={["w-[clamp(1.75rem,3.4vw,3.5rem)]", poc ? "block" : "hidden"]}
    />
    <p
      class={[
        "text-[clamp(1rem,2vw,3.125rem)] text-white",
        poc ? "hidden" : "block",
      ]}
    >
      sign up!
    </p>
  </button>
</form>
