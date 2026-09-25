import type {
  Linked,
  Link,
  PastEvent,
  Perk,
  PitchItem,
  ScheduleDay,
  Sponsor,
} from "./types";

export const meta = {
  title: "Haven — Organize a game jam in your city!",
  description:
    "Hack Club Haven is a global event for hundreds of teenagers to organize their own game jams",
  image: "/images/haven-logo-color.webp",
} as const;

export const event = {
  name: "Haven",
  title: [],
  tagline: ["Game jam for teens in 200+ cities", "Nov 14–15, 2026"],
} as const;

export const organizeCta = {
  label: "Want to organize your own Hack Club Haven?",
} as const;

export const eventPoc = {
  name: "Haven",
  title: ["Organize a game jam", "in your city!"],
  tagline: ["Nov 14–15", "For teens 13-18 around the world"],
} as const;

export const organizeCtaPoc = {
  label: "Want to organize a Hack Club Haven in your city?",
} as const;

/** Copy for the hero that is not the title or the tagline. */
export const heroCopy = {
  mapLabel: "find an event near you",
  scrollLabel: "more info",
} as const;

export const signupCopy = {
  placeholder: "you@hackclub.com",
  button: "sign up!",
} as const;

export const signupCopyPoc = {
  placeholder: "enter email to sign up",
  button: "sign up!",
} as const;

export const about = {
  title: "What is a game jam?",
  body: "It’s a social coding event where you make a video game with friends + free food!",
} as const;

export const perks: Perk[] = [
  {
    id: "build",
    title: "Learn & Build",
    side: "start",
    blurb: ["follow workshops or create at your own pace"],
    photos: [
      {
        src: "/images/projects-1.webp",
        alt: "Return to the Sender, a game made at a past event",
        href: "https://i1rs7.itch.io/return-to-the-sender",
        caption: { title: "return to the sender", author: "by i1rs7" },
      },
      {
        src: "/images/projects-3.webp",
        alt: "Office Click Clack, a game made at a past event",
        href: "https://theavgeekbee.itch.io/office-click-clack",
        caption: {
          title: "office click clack",
          author: "by bunnyguy and nathan",
        },
      },
    ],
  },
  {
    id: "friends",
    title: "Make Friends",
    side: "end",
    blurb: ["meet new people and form lifelong relationships"],
    photos: [
      { src: "/images/friends-1.webp", alt: "Attendees hanging out together" },
      {
        src: "/images/friends-2.webp",
        alt: "A group of teens working at a shared table",
      },
    ],
  },
  {
    id: "food",
    title: "Free Food & Prizes",
    side: "start",
    blurb: ["can’t say no to free snacks :)"],
    photos: [
      { src: "/images/food-1.webp", alt: "A spread of snacks and merch" },
      { src: "/images/food-3.webp", alt: "Attendees holding up their prizes" },
    ],
  },
];

export const pitchHeading = "Don’t game jams sound awesome?";

export const pitches: PitchItem[] = [
  {
    id: "invite",
    align: "end",
    body: [
      { text: "This November, " },
      { text: "YOU can join the world's largest teen game jam.", mark: true },
      {
        text: " Yes, you! It doesn’t matter if you have years of experience, or just learned what they are today.",
      },
    ],
  },
  {
    id: "support",
    align: "start",
    body: [
      { text: "You’ll " },
      { text: "join thousands of teens", mark: true },
      {
        text: " making games from all around the world. Don't consider yourself a game dev? No problem - we have tons of workshops for you to make your game!",
      },
    ],
  },
  {
    id: "impact",
    align: "center",
    body: [
      { text: "This is your chance to " },
      { text: "learn something new,", mark: true },
      { text: " " },
      { text: "meet new friends,", mark: true },
      { text: " and" },
      { text: "go on an incredible adventure together!", mark: true },
    ],
  },
];

export const pitchesPoc: PitchItem[] = [
  {
    id: "invite",
    align: "end",
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
    body: [
      { text: "It may be challenging but this is your chance to " },
      { text: "start something truly impactful", mark: true },
      {
        text: ", learn real leadership skills, and make life-changing friendships along the way.",
      },
    ],
  },
];

export const scheduleHeading = "What happens on the day?";

export const scheduleTbd = {
  title: "TBD!",
  body: "We’re still working out the schedule. Sign up and we'll let you know as soon as we figure it out!",
} as const;

export const schedule: ScheduleDay[] = [
  {
    day: "Saturday",
    items: [
      {
        time: "10:00 am",
        title: "check in :3",
        body: "yada yada body text",
      },
      {
        time: "11:00 am",
        title: "meow",
        body: "yada yada body text",
      },
      {
        time: "12:00 am",
        title: "mraow",
        body: "yada yada body text",
      },
      {
        time: "12:00 am",
        title: "mraow",
        body: "yada yada body text",
      },
      {
        time: "1:00 pm",
        title: "mraow",
        body: "yada yada body text",
      },
      {
        time: "2:00 pm",
        title: "mraow",
        body: "yada yada body text",
      },
      {
        time: "3:00 pm",
        title: "mraow",
        body: "yada yada body text",
      },
      {
        time: "4:00 pm",
        title: "mraow",
        body: "yada yada body text",
      },
    ],
  },
  {
    day: "Sundayy",
    items: [
      {
        time: "10:00 am",
        title: "check in :3",
        body: "yada yada body text",
      },
    ],
  },
];

export const stepsHeading =
  "Here is how you can join a game jam this November!";

export const stepsHeadingPoc =
  "Here is how you can organize a game jam this November!";

export const stepsSubheading =
  "(Don't worry, we'll guide you through each step)";

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

export const stepsCta: Link = {
  label: "Read the organizer guide for more info!",
  href: "https://docs.google.com/document/d/1CHgiBmXzeSj7Ng21wMoXsnwjzrLzSbg0siVn8AUoqQ0/edit",
};

export const pastEventsHeading = [
  "Hack Club has helped teens organize hundreds of events woldwide!",
  "Check out some of our past events ~",
];

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
      "Students led game jams in 200 cities worldwide, from London to NYC to Penang!",
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

export const supportersHeading = "Our Supporters";

export const supporters: Sponsor[] = [
  {
    name: "HCB 1",
    href: "https://hcb.hackclub.com",
    image: "/images/sponsors/logos/hcb-icon.webp",
  },
  {
    name: "HCB 2",
    href: "https://hcb.hackclub.com",
    image: "/images/sponsors/logos/hcb-icon.webp",
  },
  {
    name: "HCB 3",
    href: "https://hcb.hackclub.com",
    image: "/images/sponsors/logos/hcb-icon.webp",
  },
];

export const sponsorsHeading = "Our sponsors";

const HAVEN_GUIDE_LINK =
  "https://docs.google.com/document/d/1f_uFvFP4gD01YhXBmU9jBfEBU9QMvr1L5yJTKWBBhbA/edit?usp=sharing";
const HAVEN_EMAIL = "mailto:haven@hackclub.com";

export const faqHeading = "FAQ";

/** The button under the FAQ column, which scrolls back up to the signup box. */
export const faqCta = "Sign up!";

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
      {
        text: "We’re here to help! You can see our ",
      },
      { text: "parent guide", href: HAVEN_GUIDE_LINK },
      { text: " here, or they can reach out to us at " },
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

export const footerLinks: Link[] = [
  { label: "Hack Club", href: "https://hackclub.com" },
  { label: "Slack", href: "https://hackclub.com/slack/" },
  { label: "Clubs", href: "https://hackclub.com/clubs/" },
  { label: "Hackathons", href: "https://hackathons.hackclub.com" },
];

/** One entry per paragraph of the "who is Hack Club" blurb in the footer. */
export const footerBody: Linked[] = [
  [
    {
      text: "Hack Club is a 501(c)(3) nonprofit and network of 100k+ technical high schoolers. We believe you learn best by building, so we’re creating community and providing grants so you can make awesome projects. In the past few years, we’ve ",
    },
    {
      text: "sent 30 teen hackers hiking the Pacific Crest Trail",
      href: "https://www.youtube.com/watch?v=ufMUJ9D1fi8",
    },
    { text: ", " },
    {
      text: "hosted a hackathon for the worst ideas",
      href: "https://www.youtube.com/watch?v=8iM1W8kXrQA",
    },
    { text: ", and " },
    {
      text: "ran the largest teen hardware hackathon at GitHub HQ",
      href: "https://www.youtube.com/watch?v=kaEFv7e49mo",
    },
    { text: "." },
  ],
  [
    { text: "Read about Hack Club in " },
    {
      text: "The Wall Street Journal",
      href: "https://www.wsj.com/articles/teen-hackers-try-to-convince-parents-they-are-up-to-good-11569922200",
    },
    { text: ", " },
    {
      text: "CBS News",
      href: "https://www.cbsnews.com/sanfrancisco/news/hack-club-hosts-teen-coders-san-francisco/",
    },
    { text: ", and " },
    {
      text: "NASA.gov",
      href: "https://www.nasa.gov/learning-resources/space-out-this-summer-with-variety-of-nasa-stem-activities/",
    },
    { text: ", or watch us " },
    {
      text: "on stage with AMD CEO Lisa Su at CES",
      href: "https://www.youtube.com/live/UbfAhFxDomE?si=5DiK1_hGqKrB_r50&t=7033",
    },
    { text: "." },
  ],
  [{ text: "Made with ♥ by teenagers, for teenagers at Hack Club" }],
];

export const navLinks: Link[] = [
  { label: "Sign up", href: "#top" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];
