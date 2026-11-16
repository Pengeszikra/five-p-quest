// Same YY.M.DNNN scheme as 3Draft; display as YY.MM.DD.NNN.
import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const root=new URL("../",import.meta.url);
export function nextVersion(current,date=new Date()){
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Budapest",year:"2-digit",month:"numeric",day:"numeric"}).formatToParts(date);
  const item=(type)=>Number(parts.find(p=>p.type===type)?.value);
  const [year,month,last]=current.split(".").map(Number);
  const yy=item("year"),mm=item("month"),day=item("day");
  const same=year===yy&&month===mm&&Math.floor(last/1000)===day;
  const build=same?last%1000+1:1;
  if(build>999)throw Error("Daily build limit exceeded");
  return `${yy}.${mm}.${day*1000+build}`;
}
export function display(version){
  const [year,month,last]=version.split(".").map(Number);
  return `${String(year).padStart(2,"0")}.${String(month).padStart(2,"0")}.${String(Math.floor(last/1000)).padStart(2,"0")}.${String(last%1000).padStart(3,"0")}`;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const pkgUrl=new URL("package.json",root),browserUrl=new URL("version.js",root);
  const pkg=JSON.parse(readFileSync(pkgUrl,"utf8")),next=nextVersion(pkg.version);
  console.log(`${pkg.version} -> ${next} (${display(next)})`);
  if(!process.argv.includes("--dry")){
    pkg.version=next;
    writeFileSync(pkgUrl,JSON.stringify(pkg,null,2)+"\n");
    const source=readFileSync(browserUrl,"utf8");
    const changed=source.replace(/globalThis\.FIVE_PERCENT_VERSION = "[^"]+";/,`globalThis.FIVE_PERCENT_VERSION = "${next}";`);
    if(source===changed)throw Error("Version constant missing or version unchanged");
    writeFileSync(browserUrl,changed);
  }
}
