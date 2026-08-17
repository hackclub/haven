/**
 * Single source of truth for page copy, mirroring the Figma file
 * "Haven (Copy)" — https://www.figma.com/design/acqqsRYXbvzKRJqIb9zw5l
 *
 * The event is framed as a *game jam* in the current design; a few strings
 * still say "hackathon" because the design does.
 */

export const event = {
  name: "Haven",
  dates: "Nov 14–15",
  audience: "For teens 13-18 around the world",
  tagline: ["Organize a game jam", "in your city!"],
} as const;

/** A run of copy where some spans get the yellow highlighter treatment. */
export type Marked = { text: string; mark?: boolean }[];

/** A run of copy where some spans are links. */
export type Linked = { text: string; href?: string }[];

/* ── What is a game jam ─────────────────────────────────────────────────── */

export const about = {
  title: "What is a game jam?",
  body: "It’s a social coding event where you make a video game with friends + free food!",
} as const;

/* ── Perk cards ─────────────────────────────────────────────────────────── */

export type Perk = {
  id: string;
  title: string;
  /** Sits under the images, per the current design. */
  blurb: string[];
  /** Which side the card hangs off, mirroring the staggered Figma layout. */
  side: "start" | "end";
  /** Aspect ratio of this group's photo cells, taken from the Figma frame. */
  aspect: string;
  photos: {
    src: string;
    alt: string;
    position?: string;
    /** Projects link out to itch.io and carry a title + author credit. */
    href?: string;
    caption?: { title: string; author: string };
  }[];
};

export const perks: Perk[] = [
  {
    id: "build",
    title: "Learn and Build",
    side: "start",
    aspect: "aspect-[131/88]",
    blurb: [
      "follow workshops or create at your own pace",
      "here are some cool projects at past hackathons!",
    ],
    photos: [
      {
        src: "/images/projects-1.webp",
        alt: "Return to the Sender, a game made at a past event",
        href: "https://i1rs7.itch.io/return-to-the-sender",
        caption: { title: "return to the sender", author: "by i1rs7" },
      },
      {
        src: "/images/projects-2.webp",
        alt: "Deathleap, a game made at a past event",
        href: "https://qrosp-games-oy.itch.io/deathleap",
        caption: {
          title: "deathleap",
          author: "by qrosp, juusaktmii, & 1100010101",
        },
      },
      {
        src: "/images/projects-3.webp",
        alt: "Office Click Clack, a game made at a past event",
        href: "https://theavgeekbee.itch.io/office-click-clack",
        caption: { title: "office click clack", author: "by bunnyguy" },
      },
    ],
  },
  {
    id: "friends",
    title: "Make Friends",
    side: "end",
    aspect: "aspect-[198/120]",
    blurb: ["meet new people and form relationships that will last a lifetime"],
    photos: [
      { src: "/images/friends-1.webp", alt: "Attendees hanging out together" },
      {
        src: "/images/friends-2.webp",
        alt: "A group of teens working at a shared table",
      },
      {
        src: "/images/friends-3.webp",
        alt: "Attendees celebrating at an event",
      },
    ],
  },
  {
    id: "food",
    title: "Free Food and Prizes",
    side: "start",
    aspect: "aspect-[176/116]",
    blurb: ["can’t say no to free snacks :)"],
    photos: [
      { src: "/images/food-1.webp", alt: "A spread of snacks and merch" },
      {
        src: "/images/food-2.webp",
        alt: "Boxes of snacks laid out on a table",
      },
      { src: "/images/food-3.webp", alt: "Attendees holding up their prizes" },
    ],
  },
];

/* ── Pitch bubbles ──────────────────────────────────────────────────────── */

export type Pitch = {
  id: string;
  align: "start" | "center" | "end";
  /** Custom properties for `.speech`; omit for a bubble with no tail. */
  tail?: Record<string, string>;
  body: Marked;
};

export const pitchHeading = "Don’t game jams sound awesome?";

export const pitches: Pitch[] = [
  {
    id: "invite",
    align: "end",
    tail: {
      "--tail-size": "4.5rem",
      "--tail-rotate": "18deg",
      "--tail-right": "2.5rem",
      "--tail-bottom": "-2.25rem",
    },
    body: [
      { text: "This November, " },
      { text: "we want YOU", mark: true },
      {
        text: " to run a game jam. Yes, you! It doesn’t matter if you have years of experience, or just learned what they are today.",
      },
    ],
  },
  {
    id: "support",
    align: "start",
    body: [
      { text: "You’ll " },
      { text: "join hundreds of teens", mark: true },
      {
        text: " from around the world, all running game jams in their own cities. Hack Club (a global nonprofit) will provide guides, funding, merch, and 1-on-1 mentorship!",
      },
    ],
  },
  {
    id: "impact",
    align: "center",
    // The hedgehog sits directly to the right of this bubble, level with it —
    // so the tail leaves the right edge at mid-height and points at it. It used
    // to hang off the top corner pointing up and *away* from the hedgehog.
    tail: {
      "--tail-size": "4.5rem",
      "--tail-rotate": "-28deg",
      "--tail-right": "-2.25rem",
      "--tail-top": "2.5rem",
    },
    body: [
      { text: "It may be challenging but this is your chance to " },
      { text: "start something truly impactful", mark: true },
      {
        text: ", learn real leadership skills, and make life-changing friendships along the way.",
      },
    ],
  },
];

/* ── How you organize ───────────────────────────────────────────────────── */

export const stepsHeading =
  "Here is how you can organize a game jam this November!";

export const steps = [
  {
    title: "find a team of coorganizers",
    image: "/images/step-1.webp",
    alt: "Organizers standing together at an event",
  },
  {
    title: "find a venue to host your game jam",
    image: "/images/step-2.webp",
    alt: "An organizer giving a thumbs up in a booked venue",
  },
  {
    title: "find sponsors to buy merch and prizes",
    image: "/images/step-3.webp",
    alt: "Trophies laid out on a prize table",
  },
  {
    title: "buy supplies and prepare workshops",
    image: "/images/step-4.webp",
    alt: "A workshop being run for attendees",
  },
];

/* ── Past events ────────────────────────────────────────────────────────── */

export const pastEventsHeading = [
  "We’ve helped teens organize hundreds of events around the world!",
  "Check out some of our past events ~",
];

export type PastEvent = {
  title: string;
  caption: string;
  image: string;
  alt: string;
  play: string;
  href: string;
  position?: string;
};

export const pastEvents: PastEvent[] = [
  {
    title: "Scrapyard",
    caption:
      "Build wacky stuff, get wacky prizes! In-person hackathon in 70+ cities.",
    image: "/images/scrapyard-pic.webp",
    alt: "Teens building at Scrapyard",
    play: "/images/play-triangle-1.svg",
    href: "https://www.youtube.com/watch?v=8iM1W8kXrQA",
  },
  {
    title: "Daydream",
    caption:
      "Students led game jams in 100 cities worldwide, from London to NYC to Penang!",
    image: "/images/daydream-pic.webp",
    alt: "Attendees at a Daydream game jam",
    play: "/images/play-triangle-2.svg",
    href: "https://www.youtube.com/watch?v=vvdoW2gh9YU",
  },
  {
    title: "Campfire",
    caption:
      "Our largest game jam yet: 10k teens, 1 weekend, making games at the same time!",
    image: "/images/scrapyard-pic-2.webp",
    alt: "A packed room of teens at Campfire",
    play: "/images/play-triangle-3.svg",
    href: "https://www.youtube.com/watch?v=0aMAHuLxg3s",
    position: "object-bottom",
  },
];

/* ── FAQ ────────────────────────────────────────────────────────────────── */

const HAVEN_EMAIL = "mailto:haven@hackclub.com";

/**
 * Order matches the Figma reading order: odd entries fill the left column,
 * even entries the right.
 */
export const faqs: { q: string; a: Linked }[] = [
  {
    q: "Am I eligible?",
    a: [
      {
        text: "If you’re age 13-18, you’re eligible! No prior experience required.",
      },
    ],
  },
  {
    q: "Can I organize a Haven?",
    a: [
      {
        text: "Absolutely! We’re always looking for passionate organizers. If you’re ready to bring the magic of game development to your community, we’d love to help.",
      },
    ],
  },
  {
    q: "Is this free?",
    a: [
      {
        text: "Yes! Hack Club is a nonprofit helping teens build technical projects at no cost.",
      },
    ],
  },
  {
    q: "Why should I organize a Haven?",
    a: [
      {
        text: "You’ll make an impact on your community, whether inspiring someone to make their first game or helping someone find friends in tech. Leading an event is usually very difficult, but we are providing support to help you along the way!",
      },
    ],
  },
  {
    q: "But I’ve never coded before!",
    a: [
      {
        text: "Perfect! Game jams are designed for beginners. You’ll have workshops, mentors, and teammates to help you every step of the way.",
      },
    ],
  },
  {
    q: "What are the steps to organizing?",
    a: [
      {
        text: "First, apply through our organizer form. Then we’ll guide you through venue booking, team building, workshop planning, and day-of coordination.",
      },
    ],
  },
  {
    q: "What if my parents are concerned?",
    a: [
      // TODO: the Figma still has "[parent guide]" bracketed — no URL yet.
      {
        text: "We’re here to help! You can see our [parent guide] here, or they can reach out to us at ",
      },
      { text: "haven@hackclub.com", href: HAVEN_EMAIL },
      { text: " for questions." },
    ],
  },
  {
    q: "Do we get volunteer hours?",
    a: [
      {
        text: "Many schools accept organizing hours as community service. If your school requires documentation, we can provide it!",
      },
    ],
  },
  {
    q: "I still have questions!",
    a: [
      { text: "Join #haven-help on " },
      { text: "Slack", href: "https://hackclub.com/slack/" },
      { text: " or reach out to us at " },
      { text: "haven@hackclub.com", href: HAVEN_EMAIL },
      { text: "!" },
    ],
  },
  {
    q: "Can I join an organizing team?",
    a: [
      {
        text: "Of course! Many cities have organizing teams. Reach out to organizers in your area or apply to join an existing team.",
      },
    ],
  },
];

/* ── Chrome ─────────────────────────────────────────────────────────────── */

export const footerLinks = [
  { label: "Hack Club", href: "https://hackclub.com" },
  { label: "Slack", href: "https://hackclub.com/slack/" },
  { label: "Clubs", href: "https://hackclub.com/clubs/" },
  { label: "Hackathons", href: "https://hackathons.hackclub.com" },
];

export const navLinks = [
  // Back to the top of the page, where the hero's email field is.
  { label: "Sign up", href: "#top" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];
