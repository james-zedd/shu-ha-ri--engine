export type CuratedPack = {
  id: string;
  name: string;
  description: string;
  author: string;
  url: string;
  /**
   * The pack's current published version. Kept in sync by hand with the
   * `version` field inside the pack's own JSON whenever a new version is
   * published. The Packs view (#35) compares this against the locally
   * installed pack to decide "update available" without fetching each pack.
   */
  version: string;
};

// This array is the PR-reviewed authoring surface only — the running app
// never reads this file. The Packs view fetches the directory gist at
// CURATED_PACKS_DIRECTORY_URL (see fetch-curated-packs.ts) instead, so any
// change here must also be mirrored to that gist by hand (see issue #41)
// before it takes effect in the app.
export const CURATED_PACKS: CuratedPack[] = [
  {
    id: "js-ts-fundamentals",
    name: "JavaScript & TypeScript Fundamentals",
    description:
      "200 multiple-choice and text-answer questions covering core JavaScript and TypeScript concepts, including closures, scope, prototypes, async/await, the event loop, and TypeScript's type system (generics, narrowing, and utility types).",
    author: "James Zedd",
    url: "https://gist.githubusercontent.com/james-zedd/8d9d605800b38f36e7a678a58ffc4511/raw/js-ts-fundamentals.json",
    version: "1.2.0",
  },
  {
    id: "html-fundamentals",
    name: "HTML Fundamentals",
    description:
      "200 multiple-choice and text-answer questions covering core HTML: document structure, semantic elements, text formatting, lists, links, images and media, forms and validation, tables, global attributes, accessibility/ARIA, metadata, embedding, HTML5 interactive elements, character entities, deprecated markup, and HTML's history and versioning.",
    author: "James Zedd",
    url: "https://gist.githubusercontent.com/james-zedd/3817803ddfa6188b961ad4c5d31db313/raw/html-fundamentals.json",
    version: "1.1.0",
  },
  {
    id: "css-scss-fundamentals",
    name: "CSS & SCSS Fundamentals",
    description:
      "240 multiple-choice and text-answer questions covering core CSS and SCSS, with deep coverage of flexbox and grid: selectors, the cascade and specificity, the box model, positioning, typography, colors, units, custom properties, transitions and transforms, responsive design, and SCSS variables, nesting, mixins, @extend, control flow, modules, functions, and maps.",
    author: "James Zedd",
    url: "https://gist.githubusercontent.com/james-zedd/f11bdb4ce3766aedddef7a54f47fb1d6/raw/css-scss-fundamentals.json",
    version: "1.0.0",
  },
];
