# Customizing your Haven page

Your city's page (`haven.hackclub.com/<your-slug>`) is built from one JSON
document. Paste it into the form and the site picks it up within a couple of
minutes automatically!

**Change only what you want to change.** Every key you leave out uses the
wording and artwork from the main Haven page, so the shortest useful document
is just about:

```json
{}
```

That's it! This will include sensible defaults on most parts of the page.

You'd probably want to at least customize these fields, though:

```json
{
  "tagline": ["Game jam for teens 13-18", "Nov 14-15 @ Burlington, VT"],
  "schedule": {
    "days": [
      {
        "day": "Saturday, November 14",
        "items": [
          {
            "time": "10:00 am",
            "title": "doors open",
            "body": "Come find your team and grab breakfast."
          },
          { "time": "11:00 am", "title": "opening ceremony" },
          { "time": "12:00 pm", "title": "start building" }
        ]
      }
    ]
  },
  "sponsors": {
    "items": [
      {
        "name": "A Local Company",
        "image": "https://assets.hackclub.com/icon-rounded.png",
        "href": "https://hackclub.com/"
      }
    ]
  }
}
```

Anything you _do_ include is frozen to what you typed. If you paste the whole
template below and never touch the FAQ, your FAQ stops following the main
site's, so delete the sections you are not editing.

### Five rules

1. **No comments and no trailing commas.** `// like this` or a `,` before a
   closing `}` makes the whole document invalid.
2. **Straight quotes only** (`"`), not the curly `“ ”` a word processor makes.
   Curly quotes are fine _inside_ a piece of text (`It’s` is fine) just not
   around it.
3. **Links** must start with `https://` or `mailto:`.
4. **Pictures** must start with `https://` or `/`. Upload yours somewhere public
   first (like https://cdn.hackclub.com) and paste the link; a `/images/...`
   path means one of Haven's own.
5. **No spaces, quotes or brackets in a link or picture address.** If yours has
   one, your file host will give you an encoded version (a space becomes `%20`)
   - use that. An address with those characters in it is refused.

If the document is invalid the site keeps the previous version and says
nothing, so if an edit seems to do nothing, paste it into a JSON checker before
you go hunting elsewhere.

## The schema

This is an example of everything you can change, with Haven's defaults filled
in. Copy it, delete what you are not editing, and change the rest.

```json
{
  "meta": {
    "title": "Haven — Burlington",
    "description": "Hack Club Haven is a global event for hundreds of teenagers to organize their own game jams",
    "image": "/images/haven-logo-color.webp"
  },
  "tagline": ["Game jam for teens 13-18", "Nov 14–15 · Burlington, VT"],
  "hero": {
    "organizeCta": "Want to organize your own Hack Club Haven?",
    "mapLabel": "find an event near you",
    "scrollLabel": "more info",
    "signup": { "placeholder": "you@hackclub.com", "button": "sign up!" }
  },
  "about": {
    "title": "What is a game jam?",
    "body": "It’s a social coding event where you make a video game with friends + free food!",
    "perks": [
      {
        "title": "Learn & Build",
        "side": "start",
        "blurb": ["follow workshops or create at your own pace"],
        "photos": [
          {
            "src": "/images/projects-1.webp",
            "alt": "Return to the Sender, a game made at a past event",
            "href": "https://i1rs7.itch.io/return-to-the-sender",
            "caption": { "title": "return to the sender", "author": "by i1rs7" }
          },
          {
            "src": "/images/projects-3.webp",
            "alt": "Office Click Clack, a game made at a past event",
            "href": "https://theavgeekbee.itch.io/office-click-clack",
            "caption": {
              "title": "office click clack",
              "author": "by bunnyguy and nathan"
            }
          }
        ]
      },
      {
        "title": "Make Friends",
        "side": "end",
        "blurb": ["meet new people and form lifelong relationships"],
        "photos": [
          {
            "src": "/images/friends-1.webp",
            "alt": "Attendees hanging out together"
          },
          {
            "src": "/images/friends-2.webp",
            "alt": "A group of teens working at a shared table"
          }
        ]
      },
      {
        "title": "Free Food & Prizes",
        "side": "start",
        "blurb": ["can’t say no to free snacks :)"],
        "photos": [
          {
            "src": "/images/food-1.webp",
            "alt": "A spread of snacks and merch"
          },
          {
            "src": "/images/food-3.webp",
            "alt": "Attendees holding up their prizes"
          }
        ]
      }
    ]
  },
  "pitch": {
    "heading": "Don’t game jams sound awesome?",
    "items": [
      {
        "align": "end",
        "body": [
          { "text": "This November, " },
          {
            "text": "YOU can join the world's largest teen game jam.",
            "mark": true
          },
          {
            "text": " Yes, you! It doesn’t matter if you have years of experience, or just learned what they are today."
          }
        ]
      },
      {
        "align": "start",
        "body": [
          { "text": "You’ll " },
          { "text": "join thousands of teens", "mark": true },
          {
            "text": " making games from all around the world. Don't consider yourself a game dev? No problem - we have tons of workshops for you to make your game!"
          }
        ]
      },
      {
        "align": "center",
        "body": [
          { "text": "This is your chance to " },
          { "text": "learn something new,", "mark": true },
          { "text": " " },
          { "text": "meet new friends,", "mark": true },
          { "text": " and" },
          { "text": "go on an incredible adventure together!", "mark": true }
        ]
      }
    ]
  },
  "steps": {
    "heading": "Here is how you can join a game jam this November!",
    "subheading": "(Don't worry, we'll guide you through each step)",
    "cta": {
      "label": "Read the organizer guide for more info!",
      "href": "https://docs.google.com/document/d/1CHgiBmXzeSj7Ng21wMoXsnwjzrLzSbg0siVn8AUoqQ0/edit"
    }
  },
  "schedule": {
    "heading": "What happens on the day?",
    "tbd": {
      "title": "TBD!",
      "body": "We’re still working out the schedule. Sign up and we'll let you know as soon as we figure it out!"
    },
    "days": [
      {
        "day": "Saturday",
        "items": [
          {
            "time": "10:00 am",
            "title": "doors open",
            "body": "Come find your team and grab breakfast."
          },
          { "time": "11:00 am", "title": "opening ceremony" },
          { "time": "12:00 pm", "title": "start building" }
        ]
      },
      {
        "day": "Sunday",
        "items": [
          { "time": "12:00 pm", "title": "submissions due" },
          { "time": "1:00 pm", "title": "demos + prizes" }
        ]
      }
    ]
  },
  "pastEvents": {
    "heading": [
      "Hack Club has helped teens organize hundreds of events woldwide!",
      "Check out some of our past events ~"
    ],
    "items": [
      {
        "title": "Scrapyard",
        "caption": "Build wacky stuff, get wacky prizes! In-person hackathon in 70+ cities.",
        "image": "/images/scrapyard-pic.webp",
        "alt": "Teens building at Scrapyard",
        "play": "/images/play-triangle-1.svg",
        "href": "https://www.youtube.com/watch?v=8iM1W8kXrQA"
      },
      {
        "title": "Daydream",
        "caption": "Students led game jams in 200 cities worldwide, from London to NYC to Penang!",
        "image": "/images/daydream-pic.webp",
        "alt": "Attendees at a Daydream game jam",
        "play": "/images/play-triangle-2.svg",
        "href": "https://www.youtube.com/watch?v=vvdoW2gh9YU"
      },
      {
        "title": "Campfire",
        "caption": "Our largest game jam yet: 10k teens, 1 weekend, making games at the same time!",
        "image": "/images/scrapyard-pic-2.webp",
        "alt": "A packed room of teens at Campfire",
        "play": "/images/play-triangle-3.svg",
        "href": "https://www.youtube.com/watch?v=0aMAHuLxg3s",
        "position": "object-bottom"
      }
    ]
  },
  "sponsors": {
    "heading": "Our sponsors",
    "items": [
      {
        "name": "A Local Company",
        "image": "https://example.com/their-logo.png",
        "href": "https://example.com"
      }
    ]
  },
  "faq": {
    "heading": "FAQ",
    "cta": "Sign up!",
    "items": [
      {
        "q": "Am I eligible?",
        "a": [
          {
            "text": "If you’re age 13-18, you’re eligible! No prior experience required."
          }
        ]
      },
      {
        "q": "Can I organize a Haven?",
        "a": [
          {
            "text": "Absolutely! We’re always looking for passionate organizers. If you’re ready to bring the magic of game development to your community, we’d love to help."
          }
        ]
      },
      {
        "q": "Is this free?",
        "a": [
          {
            "text": "Yes! Hack Club is a nonprofit helping teens build technical projects at no cost."
          }
        ]
      },
      {
        "q": "Why should I organize a Haven?",
        "a": [
          {
            "text": "You’ll make an impact on your community, whether inspiring someone to make their first game or helping someone find friends in tech. Leading an event is usually very difficult, but we are providing support to help you along the way!"
          }
        ]
      },
      {
        "q": "But I’ve never coded before!",
        "a": [
          {
            "text": "Perfect! Game jams are designed for beginners. You’ll have workshops, mentors, and teammates to help you every step of the way."
          }
        ]
      },
      {
        "q": "What are the steps to organizing?",
        "a": [
          {
            "text": "First, apply through our organizer form. Then we’ll guide you through venue booking, team building, workshop planning, and day-of coordination."
          }
        ]
      },
      {
        "q": "What if my parents are concerned?",
        "a": [
          { "text": "We’re here to help! You can see our " },
          {
            "text": "parent guide",
            "href": "https://docs.google.com/document/d/1f_uFvFP4gD01YhXBmU9jBfEBU9QMvr1L5yJTKWBBhbA/edit?usp=sharing"
          },
          { "text": " here, or they can reach out to us at " },
          { "text": "haven@hackclub.com", "href": "mailto:haven@hackclub.com" },
          { "text": " for questions." }
        ]
      },
      {
        "q": "Do we get volunteer hours?",
        "a": [
          {
            "text": "Many schools accept organizing hours as community service. If your school requires documentation, we can provide it!"
          }
        ]
      },
      {
        "q": "I still have questions!",
        "a": [
          { "text": "Join #haven-help on " },
          { "text": "Slack", "href": "https://hackclub.com/slack/" },
          { "text": " or reach out to us at " },
          { "text": "haven@hackclub.com", "href": "mailto:haven@hackclub.com" },
          { "text": "!" }
        ]
      },
      {
        "q": "Can I join an organizing team?",
        "a": [
          {
            "text": "Of course! Many cities have organizing teams. Reach out to organizers in your area or apply to join an existing team."
          }
        ]
      }
    ]
  },
  "fonts": { "display": "Darumadrop One", "body": "Jua" },
  "images": { "hedgehog": "https://example.com/our-mascot.png" }
}
```

The one thing missing above is the full list of picture names for `"images"`;
there are 72 of them, so they are listed at the end instead.

## Field by field

### `meta` - what shows up when the link is shared

| Field         | What it is                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `title`       | The browser tab, and the headline in a Slack or iMessage preview. Leave it out and you get "Haven - <your city>". |
| `description` | The grey line under the title in that preview.                                                                    |
| `image`       | The picture in that preview. Make it at least 1200×630 or it shows up as a small square.                          |

### `tagline` - the lines under your city's name

Each entry is its own line. The first one is kept on a single line even on a
narrow phone, so keep it short - dates and venues go in the later lines.

The big word above it is your event's name from your Airtable row, which is not
set from here. If it is wrong, fix the row (or ask us to) and the page follows.

### `hero` - the rest of the top of the page

| Field                | What it is                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `organizeCta`        | The small underlined link below the signup box, for people who want to run their own event. |
| `mapLabel`           | The handwritten label pointing at the map.                                                  |
| `scrollLabel`        | The label on the arrow that scrolls down.                                                   |
| `signup.placeholder` | The grey example text inside the email box.                                                 |
| `signup.button`      | The button next to it. Keep it to a couple of words.                                        |

### `about` - "what is a game jam?" and the three signs

`title` and `body` are the heading and sentence at the top of the section.

`perks` are the three wooden signs. They sit in three places painted into the
illustration, so **the first three entries land in those three spots, in
order**. A fourth sign will not have a spot and stacks underneath the picture
instead - three is the number to aim for.

| Field    | What it is                                                                             |
| -------- | -------------------------------------------------------------------------------------- |
| `title`  | The heading on the sign.                                                               |
| `side`   | `"start"` or `"end"` - which way the signpost leans.                                   |
| `blurb`  | The line(s) under the photos.                                                          |
| `photos` | Two photos per sign looks right. Each has a `src` and an `alt`.                        |

In a photo, `alt` describes it for people using a screen reader, `href` makes it
clickable, and `caption` (`{ "title": ..., "author": ... }`) prints a credit
underneath - handy for linking games your attendees made.

### `pitch` - the speech bubbles

`heading` is the line above them. `items` are the bubbles, and like the signs
there are **three painted-in spots filled in order**.

`body` is a list of pieces of text so you can highlight part of a sentence:
`{ "text": "...", "mark": true }` draws the orange marker-pen stroke behind it,
and a piece without `mark` is ordinary text. Mind the spaces at the ends of your
pieces - they are joined exactly as written.

`align` (`"start"`, `"center"`, `"end"`) nudges the bubble left, middle or right.

### `steps` - "how to join"

`heading` and `subheading` are the two lines of text. The four illustrated steps
underneath are part of the background picture and cannot be edited as text.

`cta` is the button below them (`{ "label": ..., "href": ... }`), which only
appears on the organizer page.

### `schedule` - the timetable

Leave `days` out or empty and visitors see the `tbd` note instead
(`{ "title": ..., "body": ... }`) - which is the right thing to show until you
know your plan, so put your real schedule in when you have it.

Each day is `{ "day": "Saturday", "items": [...] }` and each item is
`{ "time": ..., "title": ..., "body": ... }`. `time` is free text, so write it
however you like (`"10:00 am"`, `"10am"`, `"all day"`). `body` is optional - use
it for the line of detail under a title, and leave it out for a one-liner.

A day with no items is skipped entirely, so you can add Sunday early and fill it
in later.

### `pastEvents` - the three photo cards

`heading` is a list, one line per entry. `items` are the cards, and again there
are **three spots**.

| Field           | What it is                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `title`         | The name above the photo.                                                                             |
| `image` / `alt` | The photo and its description.                                                                        |
| `caption`       | The sentence under it.                                                                                |
| `href`          | Where clicking it goes - usually a video.                                                             |
| `play`          | The play triangle drawn over the photo.                                                               |
| `position`      | Optional. Picks which part of a photo to keep when it is cropped. One of `"object-top"`, `"object-bottom"`, `"object-center"`, `"object-left"`, `"object-right"` - anything else is refused. |

### `sponsors` - logos

Empty by default, and **the whole section disappears when there are none**, so
add it only once you have sponsors. Each is
`{ "name": ..., "image": ..., "href": ... }`. They are laid out three per row,
so three, six or nine look tidiest. Logos with a transparent background sit best
on the illustration.

### `faq` - the questions

`heading` is the word above them and `cta` is the button underneath that jumps
back to the signup box.

Each question is `{ "q": ..., "a": [...] }`, and the answer is a list of pieces
so you can put links in the middle of a sentence:

```json
{
  "q": "What if my parents are concerned?",
  "a": [
    { "text": "They can email us at " },
    { "text": "haven@hackclub.com", "href": "mailto:haven@hackclub.com" },
    { "text": "." }
  ]
}
```

A piece with no `href` is plain text. Questions fill two columns, alternating
left and right, so an even number balances.

This is the section most worth adding to rather than replacing: copy the default
list from the template and add your own venue, parking and food questions to it.

### `fonts` - the lettering

There are two fonts on the page: `display` is the big rounded one used for the
name at the top and the headings, and `body` is everything else. Change either,
both or neither.

The easy way is to pick a font from [Google Fonts](https://fonts.google.com)
and type its name exactly as it appears there:

```json
{ "fonts": { "display": "Press Start 2P", "body": "Nunito" } }
```

To use a font that is not on Google Fonts, upload the font file (a `.woff2` is
best) somewhere public and give it a name of your choosing:

```json
{
  "fonts": {
    "display": {
      "family": "Burlington Hand",
      "src": "https://cdn.hackclub.com/burlington-hand.woff2"
    }
  }
}
```

Font names may only use letters, numbers, spaces and hyphens. Only the regular
weight is loaded, and if the font cannot be found the page quietly falls back to
Haven's own, so if nothing changes, check the spelling first. The sizes and
spacing on the page were tuned for Haven's fonts, so a much wider font can push
long headings onto an extra line - have a look on a phone.

### What you cannot change

These things are not in the JSON document:

- **The name at the top**, which always follows your event's name in Airtable.
- **The links in the top-right corner** (Sign up, About, FAQ).
- **The footer** - the Hack Club links and the paragraphs about who we are.

The artwork around them is still yours to change: `logo`, `navBanner` and
`footerBushes` are all in `images`. If you include a `"title"`, `"nav"` or
`"footer"` key anyway, it is ignored rather than breaking your document.

### `images` - every picture on the page

Each picture has a name. Include only the ones you are replacing:

```json
{
  "images": {
    "hedgehog": "https://example.com/our-mascot.png",
    "heroBackground": "https://example.com/our-skyline.jpg"
  }
}
```

Everything you leave out keeps Haven's artwork. Most cities change none of
these - the photos worth swapping (your attendees, your past events, your
sponsors) live in `about`, `pastEvents` and `sponsors` instead.

Match the shape of what you are replacing. The background art is drawn to fit
the page, so a photo in place of an illustration usually looks stretched.

**Everywhere**

| Key         | Default                  |
| ----------- | ------------------------ |
| `logo`      | `/images/logo.webp`      |
| `navBanner` | `/images/nav-banner.png` |
| `mapPin`    | `/images/map-flag.png`   |

**Top of the page**

| Key               | Default                                    |
| ----------------- | ------------------------------------------ |
| `heroBackground`  | `/images/hero/hero-bg-no-sticky-tree.webp` |
| `heroArrow`       | `/images/hero/hero-arrow.webp`             |
| `heroArrowMobile` | `/images/hero/hero-arrow-white.webp`       |
| `heroForeground`  | `/images/hero-foreground.webp`             |
| `hedgehog`        | `/images/hedgehog.webp`                    |
| `scrollArrow`     | `/images/triangle-down.svg`                |
| `signupArrow`     | `/images/signup-arrow.webp`                |
| `videoChevron`    | `/images/faq-chevron.webp`                 |
| `videoPlay`       | `/images/play-triangle-1.svg`              |

**Section backdrops**

| Key                 | Default                                |
| ------------------- | -------------------------------------- |
| `stageMiddle`       | `/images/bg-middle.webp`               |
| `stageMiddleMobile` | `/images/middle/mid-phone-bg.webp`     |
| `stagePicnic`       | `/images/middle/picnic-bg.webp`        |
| `stagePicnicMobile` | `/images/middle/picnic-bg-mobile.webp` |

**"What is a game jam?"**

| Key             | Default                        |
| --------------- | ------------------------------ |
| `aboutDaven`    | `/images/daven.webp`           |
| `aboutSignSide` | `/images/about/sign-side.webp` |
| `aboutSignBack` | `/images/about/sign-back.webp` |

**Speech bubbles**

| Key                 | Default                                |
| ------------------- | -------------------------------------- |
| `pitchTriangles`    | `/images/banner-triangles.webp`        |
| `pitchDaven`        | `/images/pitch/excited-daven.webp`     |
| `pitchBubbleMobile` | `/images/pitch/bubble-2.webp`          |
| `pitchPanelMobile`  | `/images/pitch/rounded-rectangle.webp` |
| `pitchBubble1`      | `/images/pitch/bubble-1.webp`          |
| `pitchBubble2`      | `/images/pitch/bubble-2.webp`          |
| `pitchBubble3`      | `/images/pitch/bubble-3.webp`          |

**"How to join"**

| Key                       | Default                                  |
| ------------------------- | ---------------------------------------- |
| `stepsFlowerBorder`       | `/images/flower-border.webp`             |
| `stepsFlowersTopLeft`     | `/images/steps/flowers-top-l.webp`       |
| `stepsFlowersTopRight`    | `/images/steps/flowers-top-r.webp`       |
| `stepsFlowersBottomLeft`  | `/images/steps/flowers-bottom-l.webp`    |
| `stepsFlowersBottomRight` | `/images/steps/flowers-bottom-r.webp`    |
| `stepsBackground`         | `/images/steps/step-bg-desktop.webp`     |
| `stepsBackgroundPoc`      | `/images/steps/step-poc-bg-desktop.webp` |
| `stepsBackgroundMobile`   | `/images/steps/step-bg-mobile.webp`      |

**Schedule**

| Key                   | Default                               |
| --------------------- | ------------------------------------- |
| `scheduleTrail`       | `/images/schedule/trail-w.webp`       |
| `scheduleTrailSide`   | `/images/schedule/trail-v.webp`       |
| `schedulePlantsSmall` | `/images/schedule/side-plants-1.webp` |
| `schedulePlantsLarge` | `/images/schedule/side-plants-2.webp` |
| `scheduleSheep`       | `/images/schedule/sheep.webp`         |
| `scheduleDaven`       | `/images/schedule/daven-smol.webp`    |
| `schedulePlantLeft`   | `/images/schedule/plant-l.webp`       |
| `schedulePlantRight`  | `/images/schedule/plant-r.webp`       |

**Sponsors**

| Key                  | Default                                 |
| -------------------- | --------------------------------------- |
| `sponsorsEdgeTop`    | `/images/sponsors/map-edge-daven.webp`  |
| `sponsorsEdgeBottom` | `/images/sponsors/map-edge.webp`        |
| `sponsorsBushSmall`  | `/images/sponsors/bushes-1.webp`        |
| `sponsorsBushMedium` | `/images/sponsors/bushes-2.webp`        |
| `sponsorsBushLarge`  | `/images/sponsors/bushes-3.webp`        |
| `sponsorsGrassSmall` | `/images/sponsors/grass-1.webp`         |
| `sponsorsGrassLarge` | `/images/sponsors/grass-2.webp`         |
| `sponsorsPumpkins`   | `/images/sponsors/pumpkin-patch.webp`   |
| `sponsorsHouseLeft`  | `/images/sponsors/houses-1-l.webp`      |
| `sponsorsHouseRight` | `/images/sponsors/houses-1-r.webp`      |
| `sponsorsHouseTop`   | `/images/sponsors/top-house.webp`       |
| `sponsorsBoxXl`      | `/images/sponsors/brown-box-xl.webp`    |
| `sponsorsBoxTall`    | `/images/sponsors/brown-box-tall.webp`  |
| `sponsorsBoxShort`   | `/images/sponsors/brown-box-short.webp` |
| `sponsorsTrail`      | `/images/sponsors/lil-brown-trail.webp` |

**FAQ**

| Key                 | Default                        |
| ------------------- | ------------------------------ |
| `faqSky`            | `/images/faq/sky.webp`         |
| `faqGround`         | `/images/faq/ground.webp`      |
| `faqBushLeft`       | `/images/faq/bushes-1.webp`    |
| `faqBushRight`      | `/images/faq/bushes-2.webp`    |
| `faqBushBack`       | `/images/faq/bushes-3.webp`    |
| `faqBushFrontRight` | `/images/faq/bushes-4.webp`    |
| `faqBushFrontLeft`  | `/images/faq/bushes-5.webp`    |
| `faqPondLeft`       | `/images/faq/pond-1.webp`      |
| `faqPondRight`      | `/images/faq/pond-2.webp`      |
| `faqPondFront`      | `/images/faq/pond-3.webp`      |
| `faqLeaves`         | `/images/faq/full-fall.webp`   |
| `faqCard`           | `/images/faq/big-fall.webp`    |
| `faqChevron`        | `/images/faq/faq-chevron.webp` |
| `faqArrow`          | `/images/footer/arrow.webp`    |

**Footer**

| Key            | Default                             |
| -------------- | ----------------------------------- |
| `footerBushes` | `/images/footer/bottom-bushes.webp` |

`stageMiddle` and `stagePicnic` are the big painted backdrops the middle of the
page sits on; the `…Mobile` versions are the taller crops used on phones, so
change both or your page will look different on a laptop and a phone.
