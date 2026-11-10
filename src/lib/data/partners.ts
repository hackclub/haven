/**
 * A partner co-branding some city pages: its logo sits next to Hack Club's at
 * the top of the hero, as "Hack Club × <partner>".
 */
export interface Partner {
  name: string;
  href: string;
  /** White, to read on the hero's art like the Haven logo does. */
  logo: string;
  width: number;
  height: number;
}

export const gamesForChange: Partner = {
  name: "Games for Change",
  href: "https://www.gamesforchange.org/",
  logo: "/images/partners/games-for-change.svg",
  width: 78,
  height: 101,
};

/** The events Games for Change is backing, by slug. */
const gamesForChangeSlugs = new Set([
  // Midwest
  "aurora",
  "chicago",
  "dunlap",
  "elgin",
  "muncie",
  "detroit",
  "minneapolis",
  "spamtown",
  "omaha",
  "columbus",
  "mason",
  // South
  "birmingham-us",
  "bentonville",
  "dc",
  "gainesville",
  "miami",
  "orlando",
  "sarasota",
  "st-augustine",
  "tallahassee",
  "atlanta",
  "augusta",
  "louisville",
  "denham-springs",
  "bethesda",
  "columbia",
  "charlotte",
  "winston-salem",
  "edmond",
  "greenville",
  "memphis",
  "nashville",
  "austin",
  "beaumont",
  "dallas",
  "fort-worth",
  "frisco",
  "houston",
  "leander",
  "san-antonio",
  "spring",
  "tyler",
  "richmond",
  "roanoke",
]);

export function partnerFor(slug: string): Partner | undefined {
  return gamesForChangeSlugs.has(slug) ? gamesForChange : undefined;
}
