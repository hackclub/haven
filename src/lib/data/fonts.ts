/**
 * The two font roles a city page can restyle. Each one's default stack mirrors
 * `--font-display` / `--font-body` in app.css, and a custom font is put in
 * front of it so a font that fails to load falls back to Haven's own.
 */
export const fontDefaults = {
  display:
    '"Darumadrop One", "Jua Extras", "Jua", ui-rounded, system-ui, sans-serif',
  body: '"Jua Extras", "Jua", ui-rounded, system-ui, sans-serif',
} as const;

export type FontRole = keyof typeof fontDefaults;

export const fontRoles = Object.keys(fontDefaults) as FontRole[];

/**
 * A Google Fonts family by name, or a font file the organizer hosts, in which
 * case `family` is just the name the page refers to it by.
 */
export type FontSpec = { family: string; src?: string };

export type SiteFonts = Partial<Record<FontRole, FontSpec>>;

/**
 * One stylesheet URL for every Google Fonts family on the page, or undefined
 * when they are all self-hosted (or there are none).
 */
export function googleFontsUrl(fonts: SiteFonts): string | undefined {
  const families = new Set(
    fontRoles.flatMap((role) => {
      const font = fonts[role];
      return font && !font.src ? [font.family] : [];
    }),
  );
  if (families.size === 0) return undefined;

  const params = new URLSearchParams();
  for (const family of families) params.append("family", family);
  params.set("display", "swap");
  return `https://fonts.googleapis.com/css2?${params}`;
}

/**
 * The `@font-face` rules for self-hosted fonts and the custom properties that
 * point each role at its font, as one stylesheet for the page head.
 *
 * The schema already restricts family names to letters, digits, spaces and
 * hyphens and refuses quotes and brackets in a `src`, so nothing here can close
 * a string or the `<style>` element; `cssUrl`-style escaping is repeated anyway
 * so that stays true if a caller skips validation.
 */
export function fontsCss(fonts: SiteFonts): string {
  const faces: string[] = [];
  const vars: string[] = [];

  for (const role of fontRoles) {
    const font = fonts[role];
    if (!font) continue;

    const family = `"${font.family.replace(/[^A-Za-z0-9 -]/g, "")}"`;
    if (font.src) {
      const src = font.src.replace(/["'()<>\\`\s]/g, encodeURIComponent);
      faces.push(
        `@font-face { font-family: ${family}; src: url("${src}"); font-display: swap; }`,
      );
    }
    vars.push(`--font-${role}: ${family}, ${fontDefaults[role]};`);
  }

  if (vars.length === 0) return "";
  return [...faces, `:root { ${vars.join(" ")} }`].join("\n");
}
