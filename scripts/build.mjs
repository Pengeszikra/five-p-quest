import {copyFile, mkdir, rm} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);
const files = [
  "index.html", "guide.html", "favicon.svg", "version.js", "style.css", "actors.js", "quest.js", "conflicts.js", "campaign.js", "social.js", "i18n.js", "game.js",
  "portraits/crew.webp", "portraits/machines.webp", "portraits/up.webp", "portraits/wyoming.webp",
];

await rm(dist, {recursive: true, force: true});
await mkdir(new URL("portraits/", dist), {recursive: true});
await Promise.all(files.map(file => copyFile(new URL(file, root), new URL(file, dist))));

// Copy world-guide illustrations and report all missing image files.
const guideFiles = ["crew.webp","wyoming-crew.webp","up-laboratory.webp","robots.webp","wyoming-station.webp","up-explorer.webp","quantum-shield.webp"];
await mkdir(new URL("guide-assets/",dist),{recursive:true});
const missing = [];
await Promise.all(guideFiles.map(async name=>{
  try { await copyFile(new URL("guide-assets/"+name,root),new URL("guide-assets/"+name,dist)); }
  catch(error) { if(error.code==="ENOENT")missing.push("guide-assets/"+name);else throw error; }
}));
if(missing.length)console.warn("\nWARNING: World Guide images missing:\n"+missing.sort().map(p=>" - "+p).join("\n")+"\nUpload guide-assets/ to the repository root.\n");
