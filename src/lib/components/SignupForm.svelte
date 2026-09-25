<script lang="ts">
  import { signupCopy, signupCopyPoc } from "$lib/data/content";
  import { imageDefaults } from "$lib/data/images";

  interface Props {
    class?: string;
    poc: boolean;
    /** Where the address is submitted; query params ride along as hidden fields. */
    action: string;
    /** Unique per instance: both hero variants render a form into the page. */
    id?: string;
    email?: string;
    /** Mirrors the input's own validity, so callers can reuse the address. */
    valid?: boolean;
    placeholder?: string;
    /** Label on the submit button; the poc hero shows an arrow instead. */
    button?: string;
    arrow?: string;
  }

  let {
    class: className = "",
    poc,
    action,
    id = "signup-email",
    email = $bindable(""),
    valid = $bindable(false),
    placeholder = poc ? signupCopyPoc.placeholder : signupCopy.placeholder,
    button = poc ? signupCopyPoc.button : signupCopy.button,
    arrow = imageDefaults.signupArrow,
  }: Props = $props();

  let input: HTMLInputElement | undefined = $state();

  // A GET form drops the query string of its own action, so anything already on
  // the target URL (Fillout prefills, the `r` referral) is re-sent as a field.
  const target = $derived(new URL(action, "https://haven.hackclub.com"));
  const hidden = $derived([...target.searchParams]);
  const formAction = $derived(action.split("?")[0]);

  $effect(() => {
    // Read `email` so this re-runs on every keystroke.
    email;
    valid = input?.validity.valid ?? false;
  });
</script>

<form
  method="get"
  action={formAction}
  class="flex items-center gap-2 rounded-[clamp(0.5rem,2.5vw,1.5rem)] bg-white/70 p-[clamp(0.4rem,0.5vw,0.625rem)] shadow-[0_0_8px_2px_rgb(250_104_27/0.65)] transition-transform hover:scale-[1.04] active:scale-100 {className}"
>
  {#each hidden as [name, value] (name)}
    <input type="hidden" {name} {value} />
  {/each}
  <label for={id} class="sr-only">Your email address</label>
  <input
    {id}
    name="email"
    type="email"
    required
    autocomplete="email"
    bind:this={input}
    bind:value={email}
    {placeholder}
    class="min-w-0 flex-1 bg-transparent px-[clamp(0.75rem,1.6vw,1.5rem)] py-1 font-body text-[clamp(1rem,2vw,3.125rem)] leading-tight tracking-[-0.03em] text-haven-orange-deep placeholder:text-haven-orange-deep focus:outline-none"
  />
  <button
    type="submit"
    class="shrink-0 rounded-[clamp(0.25rem,2.5vw,1.25rem)] bg-haven-orange-bright px-[clamp(0.9rem,1.9vw,2rem)] py-[clamp(0.5rem,0.7vw,1rem)] transition-transform hover:scale-[1.04] active:scale-100"
  >
    <span class="sr-only">Sign up for Haven</span>
    <img
      src={arrow}
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
      {button}
    </p>
  </button>
</form>
