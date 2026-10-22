// One-off: pulls official brand glyphs from Simple Icons and emits a typed
// module. Writing these paths by hand from memory is how you ship a subtly
// wrong logo, so they are fetched instead.
import { writeFileSync } from "node:fs";

const wanted = [
  { key: "github", label: "GitHub", color: "#181717" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { key: "instagram", label: "Instagram", color: "#E4405F" },
];

const out = [];
for (const icon of wanted) {
  const res = await fetch(
    `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${icon.key}.svg`,
  );
  if (!res.ok) throw new Error(`${icon.key}: HTTP ${res.status}`);
  const svg = await res.text();
  const match = svg.match(/<path d="([^"]+)"/);
  if (!match) throw new Error(`${icon.key}: no path found`);
  out.push({ ...icon, d: match[1] });
  console.log(`${icon.key}: ${match[1].length} chars of path data`);
}

const body = out
  .map(
    (i) =>
      `  ${i.key}: {\n    label: "${i.label}",\n    color: "${i.color}",\n    path: "${i.d}",\n  },`,
  )
  .join("\n");

writeFileSync(
  "components/icons.ts",
  `/**
 * Official brand glyphs, fetched from Simple Icons (CC0-1.0).
 * Regenerate with .design_refs/gen-icons.mjs rather than editing by hand.
 */
export type BrandIcon = { label: string; color: string; path: string };

export const brandIcons: Record<"github" | "linkedin" | "instagram", BrandIcon> = {
${body}
};
`,
);

console.log("wrote components/icons.ts");
