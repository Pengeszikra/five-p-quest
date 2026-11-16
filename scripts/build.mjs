import {copyFile, mkdir, rm} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const files = [
  "index.html", "favicon.svg", "version.js", "style.css", "actors.js", "quest.js", "conflicts.js", "campaign.js", "social.js", "game.js",
  "portraits/crew.webp", "portraits/machines.webp", "portraits/up.webp", "portraits/wyoming.webp",
];

await rm(dist, {recursive: true, force: true});
await mkdir(new URL("portraits/", dist), {recursive: true});
await Promise.all(files.map(file => copyFile(new URL(file, root), new URL(file, dist))));
