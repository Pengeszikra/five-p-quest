import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import {Readable} from "node:stream";
import {createDialogue} from "./lib/dialogue.mjs";
import {actors} from "./lib/actors.mjs";

const root = new URL("./",import.meta.url);
const read = (path,encoding) => readFileSync(new URL(path,root),encoding);
const assets = new Map(Object.entries({
  "/index.html":["index.html","text/html; charset=utf-8"],
  "/style.css":["style.css","text/css; charset=utf-8"],
  "/game.js":["game.js","text/javascript; charset=utf-8"],
  "/quest.js":["quest.js","text/javascript; charset=utf-8"],
  "/actors.js":["actors.js","text/javascript; charset=utf-8"],
  ...Object.fromEntries(["crew","wyoming","up","machines"].map(id=>[
    "/portraits/"+id+".webp",["portraits/"+id+".webp","image/webp"],
  ])),
}));

function loadKey() {
  if(process.env.GROQ_API_KEY!==undefined)return process.env.GROQ_API_KEY.trim();
  try {
    const match=read("ai-config.txt","utf8").match(/^\s*GROQ_API_KEY\s*=\s*([^\r\n]*)/m);
    return (match?.[1]||"").trim().replace(/^(["'])(.*)\1$/,"$2");
  } catch(error) {
    if(error.code!=="ENOENT")throw error;
    return "";
  }
}

const key=loadKey();
const dialogue=createDialogue(actors,key);
const port=Number(process.env.QUEST_PORT||"4173");
if(!Number.isInteger(port)||port<1||port>65535)throw new Error("A QUEST_PORT értéke 1 és 65535 közötti egész szám legyen.");
const origin="http://127.0.0.1:"+port;
const hosts=new Set(["127.0.0.1:"+port,"localhost:"+port]);

const server=createServer(async(incoming,outgoing)=>{
  if(!hosts.has(incoming.headers.host)){outgoing.writeHead(403).end("Csak helyi kapcsolat.");return;}
  const base="http://"+incoming.headers.host;
  const {pathname,search}=new URL(incoming.url,origin);
  try {
    if(pathname==="/api/dialogue") {
      const init={method:incoming.method,headers:incoming.headers};
      if(incoming.method!=="GET"&&incoming.method!=="HEAD"){
        init.body=Readable.toWeb(incoming);init.duplex="half";
      }
      const response=await dialogue(new Request(base+pathname+search,init));
      outgoing.writeHead(response.status,Object.fromEntries(response.headers));
      outgoing.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if(incoming.method!=="GET"&&incoming.method!=="HEAD"){outgoing.writeHead(405).end();return;}
    const asset=assets.get(pathname==="/"?"/index.html":pathname);
    if(!asset){outgoing.writeHead(404).end("Nincs ilyen oldal.");return;}
    outgoing.writeHead(200,{"content-type":asset[1],"cache-control":"no-cache","x-content-type-options":"nosniff"});
    outgoing.end(incoming.method==="HEAD"?undefined:read(asset[0]));
  } catch {
    if(outgoing.headersSent)outgoing.destroy();
    else outgoing.writeHead(500).end("Hiba a helyi szerveren.");
  }
});

server.on("error",error=>{
  console.error(error.code==="EADDRINUSE"?"Ez a port foglalt. Próbáld: QUEST_PORT=4174 node server.mjs":"A helyi szerver nem tudott elindulni.");
  process.exitCode=1;
});
server.listen(port,"127.0.0.1",()=>{
  console.log("Five Percent · Quest próba");
  console.log("Nyisd meg: "+origin);
  console.log(key?"Groq kulcs beállítva.":"Helyi válaszok. A Groq bekapcsolásához állítsd be a GROQ_API_KEY-t.");
});
