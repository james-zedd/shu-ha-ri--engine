export type CuratedPack = {
  id: string;
  name: string;
  description: string;
  author: string;
  url: string;
};

export const CURATED_PACKS: CuratedPack[] = [
  {
    id: "js-ts-fundamentals",
    name: "JavaScript & TypeScript Fundamentals",
    description:
      "200 multiple-choice and text-answer questions covering core JavaScript and TypeScript concepts, including closures, scope, prototypes, async/await, the event loop, and TypeScript's type system (generics, narrowing, and utility types).",
    author: "James Zedd",
    url: "https://gist.githubusercontent.com/james-zedd/8d9d605800b38f36e7a678a58ffc4511/raw/js-ts-fundamentals.json",
  },
];
