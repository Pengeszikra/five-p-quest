"use strict";

const $ = (id) => document.getElementById(id);
const actorById = new Map(actors.map((actor) => [actor.id, actor]));
const columns = 20;
const rows = 12;
const cellSize = 50;
const directions = {left: [-1, 0], up: [0, -1], down: [0, 1], right: [1, 0]};
const keys = {ArrowLeft: "left", ArrowUp: "up", ArrowDown: "down", ArrowRight: "right", a: "left", w: "up", s: "down", d: "right"};
const groups = ["A hajó", "Wyoming", "UP Labor", "Robotok"];
const sheets = ["crew", "wyoming", "up", "machines"];
const sheetRows = [[65,385,670,967,1250],[62,374,701,997,1250],[62,393,705,994,1250],[69,357,630,930,1250]];
const selectIds = (...ids) => ids.map((id) => actorById.get(id));
const crew = actors.filter((actor) => actor.sheet === 0);
const placed = new Set();
const hall = {id: "hall", x: 1, y: 5, w: 18, h: 2};
const room = (id, label, x, y, w, h, doors, people) => ({id, label, x, y, w, h, doors, people});
const stationVisitors = [
  "up.crew-liaison", "up.mission-director", "up.safety-officer", "up.flight-instructor",
  "up.instrument-maker","up.snp-physicist","up.exoplanet-scientist","up.data-analyst",
];
const maps = {
  wyoming: {
    title: "Wyoming", code: "WU–3463  /  ÁLLOMÁS", spawn: [4,5], entry: [17,7], exit: [17,10],
    to: "ship", gateLabel: "A HAJÓHOZ", colors: ["#e6c88d", "#c1d4c6", "#c6d7a7", "#ddc9a9", "#cad3cb", "#b7d4c4"],
    rooms: [
      room("bar","BÁR",1,1,7,4,[3,6],selectIds("wyoming.bar-owner","wyoming.short-order-cook","wyoming.station-hand","wyoming.freight-broker","up.crew-liaison","up.mission-director","robot.bartender")),
      room("lab","UP LABOR",9,1,6,4,[10,13],actors.filter(a=>a.sheet===2&&!stationVisitors.includes(a.id))),
      room("garden","ÜVEGHÁZ",16,1,3,4,[17],selectIds("wyoming.greenhouse-tech","wyoming.station-paramedic","robot.cleaning")),
      room("dock","DOKK",1,7,6,4,[2,5],selectIds("wyoming.dockmaster","wyoming.tug-pilot","wyoming.cargo-loader","wyoming.shift-supervisor","wyoming.station-master","robot.cargo","robot.tug","up.flight-instructor")),
      room("shop","MŰHELY",8,7,7,4,[9,12],selectIds("wyoming.salvager","wyoming.hull-welder","wyoming.quartermaster","wyoming.scrap-dealer","up.instrument-maker","robot.hull-repair","robot.inspection-drone")),
      room("gate","BESZÁLLÓ",16,7,3,4,[17],selectIds("wyoming.airlock-tech","up.safety-officer","android.reception","android.guide")),
    ],
  },
  ship: {
    title: "7-es Kvadráns", code: "7Q  /  FELDERÍTŐHAJÓ", spawn: [16,6], entry: [17,7], exit: [17,10],
    to: "wyoming", gateLabel: "WYOMINGRA", colors: ["#c0d8cb", "#cad4db", "#e5cda2", "#ddc9a9", "#c7d5c8", "#b7d4c4"],
    rooms: [
      room("bridge","HÍD",1,1,7,4,[3,6],[...crew.slice(0,3),...selectIds("crew.comms-officer","crew.sensor-operator","android.pilot","android.translator")]),
      room("hab","LAKÓTÉR",9,1,6,4,[10,13],selectIds("crew.flight-medic","crew.mission-cook","android.medic","android.archivist","up.data-analyst")),
      room("sample","MINTATÁR",16,1,3,4,[17],selectIds("crew.field-geologist","robot.sample","android.lab","up.exoplanet-scientist")),
      room("engine","GÉPTÉR",1,7,6,4,[2,5],selectIds("crew.chief-engineer","crew.snp-technician","crew.systems-engineer","crew.life-support-tech","crew.robotics-tech","up.snp-physicist")),
      room("hangar","HANGÁR",8,7,7,4,[9,12],selectIds("crew.cargo-master","crew.lander-pilot","crew.eva-specialist","android.deckhand","robot.survey-drone")),
      room("gate","ZSILIP",16,7,3,4,[17],[]),
    ],
  },
};

function inside([x,y], area) {
  return x>=area.x && y>=area.y && x<area.x+area.w && y<area.y+area.h;
}
function areaAt(map, cell) {
  return inside(cell,hall) ? hall : map.rooms.find((area) => inside(cell,area));
}
function canStep(map, from, to) {
  const a=areaAt(map,from), b=areaAt(map,to);
  if (!a || !b) return false;
  if (a===b) return true;
  const offHall=a===hall ? b : b===hall ? a : null;
  return Boolean(offHall?.doors.includes(to[0]) && from[0]===to[0]);
}
const keyOf = ([x,y]) => x+","+y;
const equal = (a,b) => a[0]===b[0] && a[1]===b[1];
const neighbors = ([x,y]) => Object.values(directions).map(([dx,dy])=>[x+dx,y+dy]);

function routeMap(map,start,blocked) {
  const found=new Map([[keyOf(start),null]]);
  const queue=[start];
  for(let i=0;i<queue.length;i++){
    for(const cell of neighbors(queue[i])) {
      const key=keyOf(cell);
      if(found.has(key)||blocked.has(key)||!canStep(map,queue[i],cell)) continue;
      found.set(key,queue[i]);
      queue.push(cell);
    }
  }
  return found;
}
function walkingBlockers(map, occupied, destination) {
  const blocked=new Set(occupied.map(keyOf));
  if(!destination||!equal(destination,map.exit))blocked.add(keyOf(map.exit));
  if(map===maps.ship&&(!destination||!equal(destination,questBook.seat)))blocked.add(keyOf(questBook.seat));
  return blocked;
}
function approaches(map, destination, reached) {
  return neighbors(destination).filter(cell=>canStep(map,cell,destination)&&reached.has(keyOf(cell)));
}
function assignNpcs(map) {
  const reserved=new Set([map.spawn,map.entry,map.exit].map(keyOf));
  if(map===maps.ship)reserved.add(keyOf(questBook.seat));
  for(const area of map.rooms) {
    const doorY=area.y<5 ? area.y+area.h-1 : area.y;
    for(const x of area.doors) reserved.add(keyOf([x,doorY]));
  }
  const list=[];
  for(const area of map.rooms) {
    const options=[];
    for(let y=area.y;y<area.y+area.h;y++) for(let x=area.x;x<area.x+area.w;x++) {
      const edge=Math.min(x-area.x,area.x+area.w-1-x,y-area.y,area.y+area.h-1-y);
      const away=area.y<5 ? area.y+area.h-1-y : y-area.y;
      if(!reserved.has(keyOf([x,y]))) options.push({cell:[x,y],rank:edge*18-away*3+x/20});
    }
    options.sort((a,b)=>a.rank-b.rank);
    for(const actor of area.people) {
      if(!actor || placed.has(actor.id)) throw new Error("Ismétlődő vagy hiányzó szereplő.");
      const match=options.findIndex(({cell})=>{
        const occupied=[...list.map(n=>n.cell),cell];
        const reached=routeMap(map,map.spawn,walkingBlockers(map,occupied));
        return reached.has(keyOf(map.entry)) && approaches(map,map.exit,reached).length>0 &&
          (map!==maps.ship||approaches(map,questBook.seat,reached).length>0) &&
          occupied.every(cell=>approaches(map,cell,reached).length>0);
      });
      if(match<0) throw new Error("Nincs elérhető hely: "+actor.id);
      const [{cell}]=options.splice(match,1);
      list.push({actor,cell,area:area.label});
      placed.add(actor.id);
    }
  }
  return list;
}
Object.values(maps).forEach(map=>{map.npcs=assignNpcs(map);});
if(placed.size!==actors.length) throw new Error("Szereplő hiányzik az alaprajzról.");

function sketchMap(map) {
  const context=$("plan").getContext("2d");
  const p=cellSize;
  context.clearRect(0,0,1000,600);
  context.fillStyle="#eee6cd";
  context.fillRect(0,0,1000,600);
  const wash=context.createRadialGradient(420,230,80,500,300,560);
  wash.addColorStop(0,"#faf2db"); wash.addColorStop(1,"#dcd1b4");
  context.fillStyle=wash; context.fillRect(0,0,1000,600);
  for(let x=0;x<=1000;x+=10) {
    context.strokeStyle=x%50===0?"#81999764":"#95aaa138";
    context.lineWidth=x%50===0?1:.6;
    context.beginPath(); context.moveTo(x,0); context.lineTo(x,600); context.stroke();
  }
  for(let y=0;y<=600;y+=10) {
    context.strokeStyle=y%50===0?"#81999764":"#95aaa138";
    context.lineWidth=y%50===0?1:.6;
    context.beginPath(); context.moveTo(0,y); context.lineTo(1000,y); context.stroke();
  }
  context.fillStyle="#f8f1db89"; context.fillRect(hall.x*p,hall.y*p,hall.w*p,hall.h*p);
  map.rooms.forEach((area,i)=>{
    context.fillStyle=map.colors[i]+"80";
    context.fillRect(area.x*p,area.y*p,area.w*p,area.h*p);
    drawFittings(context,area,p);
  });
  const pen=(x1,y1,x2,y2)=>{
    context.strokeStyle="#3e4c4c";context.lineWidth=2.5;context.lineCap="round";
    context.beginPath();context.moveTo(x1,y1);context.quadraticCurveTo((x1+x2)/2+.75,(y1+y2)/2-1.25,x2,y2);context.stroke();
    context.strokeStyle="#59635b55";context.lineWidth=1;
    context.beginPath();context.moveTo(x1+2,y1+2);context.lineTo(x2+2,y2+2);context.stroke();
  };
  for(let y=0;y<rows;y++) for(let x=0;x<columns;x++){
    const cell=[x,y], zone=areaAt(map,cell);
    if(!zone) continue;
    const left=x*p, top=y*p, right=left+p, bottom=top+p;
    for(const [next,line] of [
      [[x-1,y],[left,top,left,bottom]],[[x+1,y],[right,top,right,bottom]],
      [[x,y-1],[left,top,right,top]],[[x,y+1],[left,bottom,right,bottom]],
    ]){
      if(canStep(map,cell,next)) continue;
      if(areaAt(map,next)&&(next[0]<x||next[1]<y)) continue;
      pen(...line);
    }
  }
  for(const area of map.rooms) for(const x of area.doors) {
    const y=area.y<5 ? 5 : 7;
    context.strokeStyle="#408175";
    context.lineWidth=2;
    context.beginPath();context.moveTo(x*p+3,y*p+4);context.lineTo((x+1)*p-3,y*p+4);context.stroke();
  }
  const [gx,gy]=map.exit.map(v=>v*p);
  context.fillStyle="#6f9f7955";context.fillRect(gx+3,gy+3,p-6,p-6);
}
function drawFittings(context,area,p) {
  const x=area.x*p, y=area.y*p, w=area.w*p, h=area.h*p;
  context.save();
  context.strokeStyle="#53635b64";context.lineWidth=1.4;context.setLineDash([5,3]);
  const r=(left,top,width,height)=>context.strokeRect(x+left,y+top,width,height);
  if(["bar","lab","bridge","engine"].includes(area.id)){
    r(12,13,w-24,18);
    for(let left=26;left<w-34;left+=34)r(left,15,18,12);
    if(area.id==="bar") r(w/2-40,h/2-17,80,34);
  } else if(["dock","hangar"].includes(area.id)){
    r(18,29,w-36,h-48);
    context.beginPath();context.moveTo(x+25,y+h-25);context.lineTo(x+w-25,y+34);context.stroke();
  } else if(["garden","sample","shop"].includes(area.id)){
    r(13,14,25,h-27);r(w-38,14,25,h-27);
    for(let top=26;top<h-24;top+=25)r(17,top,17,7);
  } else {
    r(15,15,w-30,h-30);
  }
  context.restore();
}

const state={mapId:"wyoming", filter:0, chosen:[], active:null, started:false, positions:{}, contact:null, pathId:0, logs:new Map(), hint:"",mission:questBook.start(),radio:[],unread:0,groundIndex:0,groundTimer:null,campaign:null,crewMemory:[],episodeBriefs:new WeakMap()};
const politics=crewPolitics.create(actors);
const ai={status:"checking",pending:new Set(),results:new Map()};
const currentMap=()=>maps[state.mapId];
const position=()=>state.positions[state.mapId];
const currentNpcs=()=>currentMap().npcs.filter(npc=>!state.chosen.includes(npc.actor.id));
const objective=()=>state.campaign?.step??questBook.current(state.mission);
const questGiver=()=>{
  const step=objective();
  if(step.map!==state.mapId||!step.givers)return null;
  const present=new Set(currentNpcs().map(npc=>npc.actor.id));
  return step.givers.find(id=>present.has(id))??null;
};
const posStyle=(el,[x,y])=>{
  el.style.left=((x+.5)/columns*100)+"%";
  el.style.top=((y+.5)/rows*100)+"%";
};
function portrait(actor, close=false) {
  const span=document.createElement("span");
  span.className="portrait";
  span.setAttribute("aria-hidden","true");
  const col=actor.cell%4, row=Math.floor(actor.cell/4);
  const bounds=sheetRows[actor.sheet], lo=bounds[row], hi=bounds[row+1];
  const mobileMachine=actor.sheet===3&&row<2;
  const square=close&&(row<3||actor.sheet!==1)?(mobileMachine?232:188):275;
  const ratio=1254/square;
  const cx=(col+.5)*313.5;
  const cy=lo+(hi-lo)*(close && !mobileMachine ? .40 : .44);
  const startX=Math.max(0,Math.min(1254-square,cx-square/2));
  const startY=Math.max(lo,Math.min(hi-27-square,cy-square/2));
  span.style.setProperty("--portrait","url('portraits/"+sheets[actor.sheet]+".webp')");
  span.style.backgroundSize=(ratio*100)+"% "+(ratio*100)+"%";
  span.style.backgroundPosition=(startX/(1254-square)*100)+"% "+(startY/(1254-square)*100)+"%";
  return span;
}
function makeButton(text,action) {
  const button=document.createElement("button");
  button.type="button";
  button.textContent=text;
  button.addEventListener("click",action);
  return button;
}
function renderRoster(resetScroll=false) {
  if(resetScroll) $("roster").scrollTop=0;
  if(!$("filters").children.length) groups.forEach((name,i)=>{
    const b=makeButton(name,()=>{state.filter=i;renderRoster(true);});
    $("filters").append(b);
  });
  [...$("filters").children].forEach((b,i)=>b.setAttribute("aria-pressed",String(i===state.filter)));
  const scroll=$("roster").scrollTop;
  const restore=document.activeElement?.dataset.actor;
  $("roster").replaceChildren();
  actors.filter(actor=>actor.sheet===state.filter).forEach(actor=>{
    const button=makeButton("",()=>{
      const selected=state.chosen.indexOf(actor.id);
      if(selected>=0) state.chosen.splice(selected,1);
      else if(state.chosen.length<3) state.chosen.push(actor.id);
      else {$("pick-status").textContent="Egyszerre legfeljebb három szereplőt választhatsz.";return;}
      renderRoster();
      renderMap();
    });
    button.dataset.actor=actor.id;
    button.className="cast-card";
    button.title=actor.name;
    button.setAttribute("aria-pressed",String(state.chosen.includes(actor.id)));
    button.append(portrait(actor));
    const label=document.createElement("span");label.className="cast-name";label.textContent=actor.name;
    button.append(label);
    $("roster").append(button);
    if(restore===actor.id)button.focus({preventScroll:true});
  });
  $("roster").scrollTop=scroll;
  $("pick-status").textContent=state.chosen.length+"/3 kiválasztva"+(state.chosen.length?" · "+state.chosen.map(id=>actorById.get(id).name).join(", "):"");
  $("start").disabled=!state.chosen.length;
  $("start").firstChild.textContent=state.started?"Vissza a játékba ":"Belépés ";
}
function renderMap() {
  const map=currentMap();
  $("map-name").textContent=map.title;
  $("map-code").textContent=map.code;
  document.querySelectorAll("[data-map]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.map===state.mapId)));
  sketchMap(map);
  const tokens=$("tokens");
  tokens.replaceChildren();
  for(const zone of map.rooms) {
    const label=document.createElement("span");
    label.className="room-label";
    label.textContent=zone.label;
    posStyle(label,[zone.x+(zone.w-1)/2,zone.y<5?.05:10.85]);
    tokens.append(label);
  }
  const exitLabel=document.createElement("span");
  exitLabel.className="room-label gate";
  exitLabel.textContent=map.gateLabel;
  posStyle(exitLabel,[map.exit[0],8.25]);
  tokens.append(exitLabel);
  const gate=makeButton("→",()=>go(map.exit));
  gate.className="map-gate";
  gate.setAttribute("aria-label","Átjáró · "+maps[map.to].title);
  gate.disabled=!state.started||!$("pick").hidden||!canTransfer();
  posStyle(gate,map.exit);
  tokens.append(gate);
  if(map===maps.ship) {
    const seat=makeButton("✦",()=>go(questBook.seat));
    seat.className="map-gate command-seat"+(objective().kind==="flight"?" ready":"");
    seat.setAttribute("aria-label","Parancsnoki állás");
    seat.disabled=!state.started||!$("pick").hidden||state.mission.inFlight;
    posStyle(seat,questBook.seat);
    tokens.append(seat);
    const label=document.createElement("span");
    label.className="room-label command-label";
    label.textContent="Parancsnoki állás";
    posStyle(label,[questBook.seat[0],questBook.seat[1]+.55]);
    tokens.append(label);
  }
  const giver=state.started&&$("pick").hidden?questGiver():null;
  for(const npc of currentNpcs()) {
    const b=makeButton("",()=>{if(state.started && $("pick").hidden) go(npc.cell,npc);});
    b.className="token";
    b.dataset.actor=npc.actor.id;
    b.dataset.cell=npc.cell.join(",");
    b.setAttribute("aria-label",npc.actor.name);
    b.title=npc.actor.name+" · "+npc.area.toLowerCase();
    if(npc.actor.id===giver) {
      b.classList.add("quest-giver");
      const mark=document.createElement("span");
      mark.className="quest-mark";mark.setAttribute("aria-hidden","true");mark.textContent="?";
      b.append(mark);
    }
    const socialEvent=politics.state.events.find(e=>e.actorId===npc.actor.id);
    if(socialEvent && state.started && $("pick").hidden){
      b.classList.add("social-giver");
      const mark=document.createElement("span");mark.className="quest-mark social-mark";
      mark.textContent="!";mark.setAttribute("aria-hidden","true");b.append(mark);
      b.title+=" · "+socialEvent.title;
    }
    if(state.contact?.actor.id===npc.actor.id)b.classList.add("is-contact");
    b.tabIndex=state.started && $("pick").hidden ? 0 : -1;
    posStyle(b,npc.cell);
    b.append(portrait(npc.actor,true));
    tokens.append(b);
  }
  const player=document.createElement("div");
  player.id="player-token";player.className="player";
  if(state.active && position() && $("pick").hidden) {
    player.append(portrait(actorById.get(state.active),true));
    posStyle(player,position());
    player.setAttribute("aria-label","Te: "+actorById.get(state.active).name);
    tokens.append(player);
  }
  const playing=state.started && $("pick").hidden && !state.mission.inFlight;
  document.querySelectorAll("[data-move]").forEach(b=>{b.disabled=!playing;});
  updateHint();
  renderMission();
  renderPolitics();
}
function updateHint() {
  $("map-help").textContent=state.hint||
    (state.started&&$("pick").hidden?"Lépj vagy kattints egy figurához. A zöld nyíl átvisz a másik helyszínre.":"Jelölj ki legfeljebb három szereplőt az induláshoz.");
}
function tell(text) {
  state.hint=text;
  updateHint();
  $("game-status").textContent=text;
}
function renderPolitics(){
  const panel=$("politics-panel");panel.hidden=!state.started;
  if(!state.started)return;
  panel.replaceChildren();
  const title=document.createElement("h3");title.textContent="FEDÉLZETI POLITIKA";
  const captain=actorById.get(politics.state.captain);
  const info=document.createElement("p");info.textContent="Kapitány: "+captain.name+" · Tekintély: "+politics.state.authority+"/100";
  const bar=document.createElement("progress");bar.max=100;bar.value=politics.pressure();
  bar.setAttribute("aria-label","Bizalmatlansági nyomás");
  const note=document.createElement("p");note.className="politics-note";
  note.textContent="Bizalmatlanság: "+politics.pressure()+"% · Szövetségesek: "+politics.supporters()+
    " · Ellenfelek: "+politics.opponents()+" · Nyitott ügyek: "+politics.state.events.length;
  const msg=document.createElement("p");msg.textContent=politics.state.lastMessage;
  panel.append(title,info,bar,note,msg);
  for(const event of politics.state.events.slice(0,4)){
    const actor=actorById.get(event.actorId);
    const place=Object.entries(maps).find(([,map])=>map.npcs.some(npc=>npc.actor.id===event.actorId));
    const hint=document.createElement("p");hint.className="politics-event";
    hint.textContent="! "+actor.name+" · "+(place?.[1].title||"fedélzet")+" · "+event.title;
    panel.append(hint);
  }
}
function renderSocialOffer(){
  const panel=$("social-offer");panel.replaceChildren();
  const npc=state.contact, event=npc&&politics.state.events.find(e=>e.actorId===npc.actor.id);
  panel.hidden=!event;
  if(!event)return;
  const title=document.createElement("strong");title.textContent="! "+event.title;
  const description=document.createElement("p");description.textContent=event.text;
  const relation=document.createElement("p");
  relation.textContent="Viszony a kapitányhoz: "+politics.label(politics.relation(npc.actor.id,politics.state.captain));
  panel.append(title,description,relation);
  for(const option of event.options){
    panel.append(makeButton(option.label,()=>{
      const result=politics.resolve(event.id,option.id);
      if(!result)return;
      state.logs.get(dialogueKey(npc))?.push({who:actorById.get(state.active).name,text:option.label,player:true},{who:npc.actor.name,text:politics.state.lastMessage});
      renderSocialOffer();paintLog();renderMap();
      tell(politics.state.lastMessage);
    }));
  }
}
function renderParty() {
  $("active-name").textContent=actorById.get(state.active).name;
  $("party").replaceChildren();
  state.chosen.forEach((id,i)=>{
    const actor=actorById.get(id);
    const b=makeButton("",()=>switchActor(i));
    b.setAttribute("aria-pressed",String(state.active===id));
    b.title=(i+1)+" · "+actor.name;
    b.append(portrait(actor,true),document.createTextNode(actor.name));
    $("party").append(b);
  });
}
function begin() {
  if(!state.chosen.length)return;
  if(!state.started)state.mapId="wyoming";
  state.active=state.chosen.includes(state.active)?state.active:state.chosen[0];
  if(!state.started) state.positions=Object.fromEntries(Object.entries(maps).map(([id,map])=>[id,[...map.spawn]]));
  if(!state.started){
    const captainId=$("captain-select").value||state.chosen[0];
    // The captain is a playable protagonist, not merely a remote NPC.
    if(!state.chosen.includes(captainId)){
      if(state.chosen.length>=3)state.chosen.pop();
      state.chosen.unshift(captainId);
    }
    state.active=captainId;
    politics.setCaptain(captainId);
    politics.seed();
    // A controlled party member cannot simultaneously appear as a separate conversation NPC.
    for(const event of politics.state.events){
      if(!state.chosen.includes(event.actorId))continue;
      const alternative=politics.state.crew.find(id=>!state.chosen.includes(id)&&!politics.state.events.some(other=>other!==event&&other.actorId===id));
      if(alternative)event.actorId=alternative;
    }
  }
  state.started=true;
  for(const [id,map] of Object.entries(maps)) {
    const occupied=map.npcs.filter(npc=>!state.chosen.includes(npc.actor.id)).map(npc=>npc.cell);
    const reachable=routeMap(map,map.spawn,walkingBlockers(map,occupied,state.positions[id]));
    if(!reachable.has(keyOf(state.positions[id]))) state.positions[id]=[...map.spawn];
  }
  $("pick").hidden=true;$("play").hidden=false;
  state.hint="";
  renderParty();renderMap();
  revealPlayer(true);
  if(matchMedia("(max-width: 770px)").matches)$("map-scroll").scrollIntoView({block:"nearest"});
}
function switchActor(i) {
  if(state.mission.inFlight||state.chosen[i]===undefined||state.chosen[i]===state.active)return;
  stopRoute();closeChat();
  state.active=state.chosen[i];
  state.hint="";
  renderParty();renderMap();
}
function canTransfer() {
  if(state.campaign)return !state.mission.inFlight&&objective().kind==="gate"&&objective().map===state.mapId;
  return !state.mission.launched&&!state.mission.inFlight&&(state.mission.boarded||objective().kind==="gate");
}
function switchMap(id,viaGate=false) {
  if(state.mapId===id)return;
  if(state.started&&!$("pick").hidden&&!viaGate)return;
  if(state.started&&!canTransfer()){
    tell(state.mission.launched?"A hajó már az űrben van.":"Az átjáró még zárva van.");
    return;
  }
  if(state.started&&!viaGate){go(currentMap().exit);return;}
  stopRoute();closeChat();
  if(viaGate&&state.campaign)campaignBook.advance(state.campaign,"gate");
  else if(viaGate&&state.mapId==="wyoming")questBook.advance(state.mission,"gate");
  state.mapId=id;
  if(viaGate) state.positions[id]=[...currentMap().entry];
  state.hint="";
  renderMap();
  if(state.started&&$("pick").hidden)revealPlayer(true);
}
function revealPlayer(force=false) {
  const scroller=$("map-scroll");
  const player=$("player-token");
  if(!player)return;
  const width=scroller.clientWidth;
  const x=((position()[0]+.5)/columns)*$("map").offsetWidth;
  if(force || x<scroller.scrollLeft+38 || x>scroller.scrollLeft+width-38)scroller.scrollLeft=x-width/2;
}
function stopRoute(){state.pathId++;}
function moveTo(cell) {
  state.positions[state.mapId]=cell;
  posStyle($("player-token"),cell);
  if(equal(cell,currentMap().exit)&&canTransfer()){switchMap(currentMap().to,true);return;}
  if(state.mapId==="ship"&&equal(cell,questBook.seat)&&objective().kind==="flight"){commandUse();return;}
  if(state.hint)tell("");
  revealPlayer();
}
function takeStep(direction) {
  if(!state.started||!$("pick").hidden||state.contact||state.mission.inFlight)return;
  stopRoute();
  const from=position();
  const [dx,dy]=directions[direction];
  const dest=[from[0]+dx,from[1]+dy];
  if(!canStep(currentMap(),from,dest))return;
  if(equal(dest,currentMap().exit)&&!canTransfer()){
    tell(state.mission.launched?"A zsilip zárva van az űrben.":"A beszálló még zárva van.");return;
  }
  const npc=currentNpcs().find(person=>equal(person.cell,dest));
  if(npc){openChat(npc);return;}
  moveTo(dest);
}
function go(dest,npc) {
  if(!state.started||!$("pick").hidden||state.mission.inFlight)return;
  if(equal(dest,currentMap().exit)&&!canTransfer()){tell("A zsilip zárva van.");return;}
  if(state.contact) closeChat();
  stopRoute();
  const mark=state.pathId;
  const map=currentMap();
  const occupied=currentNpcs().map(npc=>npc.cell);
  const reached=routeMap(map,position(),walkingBlockers(map,occupied,dest));
  let target=dest;
  if(npc) {
    const distance=(cell)=>{
      let count=0;
      for(let prev=reached.get(keyOf(cell));prev;prev=reached.get(keyOf(prev)))count++;
      return count;
    };
    const options=approaches(map,dest,reached);
    options.sort((a,b)=>distance(a)-distance(b));
    target=options[0];
  }
  if(!target||!reached.has(keyOf(target))){tell("Arra fal van, vagy most nem férsz el.");return;}
  const steps=[];
  for(let cell=target;!equal(cell,position());cell=reached.get(keyOf(cell)))steps.unshift(cell);
  const walk=()=>{
    if(mark!==state.pathId)return;
    const next=steps.shift();
    if(next){moveTo(next);setTimeout(walk,92);return;}
    if(npc)openChat(npc);
    else if(map===maps.ship&&equal(dest,questBook.seat))commandUse();
  };
  walk();
}

const sayings={
  "wyoming.bar-owner":"Ülj le. Ha az UP miatt jöttél, ide hallatszik az eligazítás is.",
  "robot.bartender":"Üdvözlöm a Wyoming bárjában. Ital, kérdés, esetleg mindkettő?",
  "up.mission-director":"Az eligazítás mindjárt kezdődik. Ha van kérdésed, most még ráérünk.",
  "crew.captain":"Szervusz. Ha van egy perced, beszéljünk az útról.",
  "android.archivist":"Az állomási és a fedélzeti naplók elérhetők. Mit keres?",
  "wyoming.station-master":"Szervusz. Merre indultál, és hol akadtál el?",
  "crew.chief-engineer":"Ha szerelni jöttél, a nyolcas ott van. Ha beszélgetni, van egy percem.",
  "up.snp-physicist":"Épp két mérés közé estél. Van kedved belenézni, vagy inkább kérdeznél?",
};
const topicWords={
  work:/munk|foglalkoz|beosztas|mi a dolgod|mit csinalsz|szereped/,
  drive:/snp|hajtas|inverzit|eredet|ki talalta|up tech|technolog/,
  place:/wyoming|allomas|kvadrans|hol |merre|hova|zsilip|dokkol|dokk|barban|hangar|mi van itt/,
  mood:/foglalkoztat|veszely|felel|szerinted|velemeny|pletyk|mi ujsag|miert/,
  hello:/^(szia|szervusz|hello|helo|udv|jo napot|szevasz)[ !?.]*$/,
  thanks:/kosz|koszon|viszlat|szia$/,
};
function dialogueKey(npc){return state.active+"|"+npc.actor.id;}
function openChat(npc) {
  if(state.contact)return;
  stopRoute();
  state.contact=npc;
  $("waiting").hidden=true;$("conversation").hidden=false;
  $("contact-art").replaceChildren(portrait(npc.actor,true));
  $("contact-location").textContent=currentMap().title+" · "+npc.area.toLowerCase();
  $("contact-name").textContent=npc.actor.name;
  $("tokens").querySelector(`[data-actor="${npc.actor.id}"]`)?.classList.add("is-contact");
  const key=dialogueKey(npc);
  if(!state.logs.has(key)){
    const greeting=sayings[npc.actor.id]||greetingFor(npc.actor);
    state.logs.set(key,[{who:npc.actor.name,text:greeting}]);
  }
  paintLog();
  renderQuestOffer();renderSocialOffer();
  if(objective().conflict&&npc.actor.id===questGiver())requestEpisodeBrief(objective(),npc);
  tell("Beszélgetés · "+npc.actor.name);
  $("close-chat").focus({preventScroll:true});
  if(matchMedia("(max-width: 770px)").matches)$("conversation").scrollIntoView({block:"nearest"});
}
function greetingFor(actor) {
  if(actor.id.startsWith("robot."))return actor.work;
  if(actor.id.startsWith("android."))return "Üdvözlöm. Miben segíthetek?";
  if(actor.sheet===2)return "Üdv. Van egy percem, mielőtt visszatérek a laborhoz. Miről beszéljünk?";
  if(actor.sheet===1)return "Szia! Új vagy itt, vagy csak a következő műszakot várod?";
  return "Szia. Épp levegőhöz jutottam két műszak között. Mondd!";
}
function closeChat(returnFocus=false) {
  if(!state.contact)return;
  const last=state.contact.actor.id;
  $("tokens").querySelector(`[data-actor="${last}"]`)?.classList.remove("is-contact");
  state.contact=null;
  $("conversation").hidden=true;$("waiting").hidden=false;
  $("chat-input").value="";
  renderQuestOffer();renderSocialOffer();
  tell("");
  if(returnFocus){
    $("map").focus({preventScroll:true});
    if(matchMedia("(max-width: 770px)").matches)$("map-scroll").scrollIntoView({block:"nearest"});
  }
}
function paintLog() {
  const log=$("log");
  log.replaceChildren();
  for(const line of state.logs.get(dialogueKey(state.contact))){
    const bubble=document.createElement("p");
    bubble.className="bubble"+(line.player?" player-line":"");
    const name=document.createElement("b");name.textContent=line.who;
    bubble.append(name,document.createTextNode(line.text));
    if(line.model) {
      const badge=document.createElement("small");
      badge.textContent="Groq · "+line.model;
      bubble.append(badge);
    }
    log.append(bubble);
  }
  log.scrollTop=log.scrollHeight;
  paintAiStatus();
}
const driveByActor={
  "up.snp-physicist":"Induláskor ismétlődik a görbe. Két magyarázatom van rá, és még egyikhez sincs elég mérésem. Az eredetéről ennyit sem tudok.",
  "up.inverzit-engineer":"A tartályt és a kezelést ismerem. El tudom mondani, mit mértünk. Arról, hogyan jutottunk az egész technikához, itt sincs hiteles adat.",
  "up.safety-officer":"A mérhető veszélyek rajta vannak a listán. Az eredet körüli részt nyitva hagytuk. Én azt szeretném, ha indulás előtt mindenki látná.",
  "up.mission-director":"Használni tudjuk. Az eredete nyitott kérdés, ezt az eligazításon is elmondom. Az indulásról ettől még ma kell döntenem.",
  "crew.chief-engineer":"A hűtéshez és a csatlakozókhoz nyúlok. A zárt részről annyit mondhatok, amennyi a használati naplóban van.",
  "android.archivist":"Az archívum a használati naplókkal kezdődik. A technológia eredetéhez nincs hiteles bejegyzés.",
  "wyoming.scrap-dealer":"Láttam már céget fél bolygónyi erőforrással világot váltani. Az SNP-ről meg azt látom, hogy a hajók elindulnak. Honnan jött, arról csak szóbeszéd van.",
  "robot.bartender":"Az SNP eredete nincs az itallapon. Az UP asztalát kérdezheti. A választ a vízhez hasonlóan itt sem garantáljuk.",
};
function answer(npc,topic) {
  const actor=npc.actor;
  const robot=actor.id.startsWith("robot.");
  if(topic==="work")return actor.work;
  if(topic==="mood")return actor.sample;
  if(topic==="drive"){
    if(driveByActor[actor.id])return driveByActor[actor.id];
    if(actor.sheet===2)return "Vannak megismételhető próbáink. Hogy honnan származik? Arról nekem sincs hiteles forrásom.";
    if(actor.sheet===0)return "Az eligazításon megtanultuk, mihez nyúlhatunk menet közben. Az eredetéről a fedélzeten is csak találgatnak.";
    if(robot)return "SNP-eredet: nincs hiteles rekord. Részletekért: UP Labor.";
    return "Mindenki el akar indulni vele. Arról, hogy honnan került ide, mindenki mást hallott.";
  }
  if(topic==="place"){
    if(robot)return "Helyszín: "+currentMap().title+". Állomáshely: "+npc.area.toLowerCase()+". Átjáró: a zöld nyílnál.";
    return state.mapId==="wyoming"
      ? "Most a Wyomingon vagyunk, itt van a bár, a dokk meg az UP Labor. A 7-es Kvadránsra a beszállón át jutsz."
      : "Ez a 7-es Kvadráns. A híd és a lakótér a folyosó egyik oldalán, a géptér és a hangár a másikon. A zsilipen át visszaérsz a Wyomingra.";
  }
  if(topic==="hello")return sayings[actor.id]||greetingFor(actor);
  if(topic==="thanks")return robot?"Nyugtázva.":"Szívesen. Jó utat odakint.";
  return (robot?"Téma nincs a nyilvántartásban. ":"Erről nem tudok biztosat mondani. ")+actor.work;
}
function updateGroq(mode) {
  ai.status=mode;
  $("groq-badge").dataset.mode=mode;
  $("groq-state").textContent={
    checking:"Ellenőrzés…",off:"Helyi mód",ready:"Kulcs beállítva",active:"Aktív · gpt-oss-120b",error:"Nem elérhető",
  }[mode];
}
function paintAiStatus() {
  if(!state.contact)return;
  const key=dialogueKey(state.contact);
  const busy=ai.pending.has(key);
  const result=ai.results.get(key);
  $("ai-status").textContent=busy?"A válasz készül…":
    result?.model?"Groq · "+result.model:
    result?.offline||ai.status==="off"||ai.status==="error"?"Helyi válasz":"Groq-párbeszéd";
  for(const button of document.querySelectorAll("#chat-form button"))button.disabled=busy;
}

async function configureAi() {
  if(location.protocol==="file:"){updateGroq("off");return false;}
  try {
    const result=await fetch("/api/dialogue",{signal:AbortSignal.timeout(3500)});
    if(!result.ok)throw new Error("Groq configuration unavailable");
    const {providers}=await result.json();
    const ready=Array.isArray(providers)&&providers.includes("gpt-oss");
    updateGroq(ready?"ready":"off");paintAiStatus();
    return ready;
  } catch {updateGroq("off");paintAiStatus();return false;}
}
const aiReady=configureAi();

async function requestGroq(payload) {
  if(!await aiReady)return null;
  try {
    const response=await fetch("/api/dialogue",{
      method:"POST",headers:{"Content-Type":"application/json"},
      signal:AbortSignal.timeout(21_000),body:JSON.stringify(payload),
    });
    if(!response.ok)throw new Error("Groq unavailable");
    const data=await response.json();
    if(typeof data.reply!=="string"||!data.reply.trim()||data.model!=="openai/gpt-oss-120b")throw new Error("Invalid Groq response");
    updateGroq("active");
    return {reply:data.reply.trim(),model:"gpt-oss-120b"};
  } catch {updateGroq("error");return null;}
}
async function ask(message,topic) {
  if(!state.contact||!message)return;
  const npc=state.contact;
  const key=dialogueKey(npc);
  if(ai.pending.has(key))return;
  const log=state.logs.get(key);
  const history=log.slice(-8).map(line=>({role:line.player?"player":"actor",text:line.text}));
  const playerId=state.active;
  const location=state.mapId;
  const normalized=message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const selected=topic||Object.keys(topicWords).find(t=>topicWords[t].test(normalized));
  const fallback=answer(npc,selected);
  politics.activity("conversation",npc.actor.id);
  const lastOrder=[...state.radio].reverse().find(entry=>entry.kind==="ground"&&entry.actorId===npc.actor.id);
  log.push({who:actorById.get(playerId).name,text:message,player:true});
  ai.pending.add(key);
  paintLog();
  const reply=await requestGroq({
    actorId:npc.actor.id,playerId,location,room:npc.area,history,message,
    stage:objective().id,choice:state.mission.choice,reportChoice:state.mission.reportChoice,order:lastOrder?.text,
    ...storyContext(),conflictId:objective().conflict?.id,
    social:politics.context(npc.actor.id),
  });
  const response=reply?.reply??fallback;
  log.push({who:npc.actor.name,text:response,model:reply?.model});
  const notes=state.crewMemory;
  notes.push({actorId:npc.actor.id,playerId,location,question:message.slice(0,160),reply:response.slice(0,220)});
  if(notes.length>5)notes.shift();
  ai.pending.delete(key);
  ai.results.set(key,reply||{offline:true});
  if(state.contact&&dialogueKey(state.contact)===key)paintLog();
  renderMap();
}

function storyContext() {
  if(!state.campaign)return {};
  return {
    decisions:state.campaign.history.slice(-3),
    exchanges:state.crewMemory.slice(),
  };
}

async function requestEpisodeBrief(step,npc) {
  let briefs=state.episodeBriefs.get(step);
  if(!briefs)state.episodeBriefs.set(step,briefs=new Map());
  if(briefs.has(npc.actor.id))return;
  briefs.set(npc.actor.id,null);
  const reply=await requestGroq({
    kind:"story-opening",actorId:npc.actor.id,conflictId:step.conflict.id,...storyContext(),
  });
  briefs.set(npc.actor.id,reply);
  if(objective()===step&&state.contact===npc)renderQuestOffer();
}

function renderMission() {
  const step=objective();
  const campaign=state.campaign;
  $("mission-counter").textContent=campaign
    ? `${campaign.voyage}. FELDERÍTÉSI KÖR · ${campaign.total} LEZÁRT ÜGY`
    : `KÜLDETÉS ${state.mission.index+1}/${questBook.steps.length}`;
  $("mission-title").textContent=step.title;
  $("mission-goal").textContent=step.goal;
  document.querySelectorAll("[data-map]").forEach(button=>{
    button.disabled=state.mission.inFlight||(state.campaign
      ? button.dataset.map!==state.mapId&&!canTransfer()
      : state.mission.launched&&button.dataset.map==="wyoming");
  });
}

function renderQuestOffer() {
  const panel=$("quest-offer");
  panel.replaceChildren();
  const step=objective(), npc=state.contact;
  panel.hidden=!npc||npc.actor.id!==questGiver();
  if(panel.hidden)return;
  const description=document.createElement("p");
  description.textContent=step.briefing;
  if(step.id==="report") {
    description.textContent+=" "+(state.mission.reportChoice==="send"
      ?"A bizonytalan mérést előzetes adatként jelöltük."
      :"A megismételt ellenőrzés eredményét külön csatoltuk.");
  }
  panel.append(description);
  const episodeBrief=state.episodeBriefs.get(step)?.get(npc.actor.id);
  if(episodeBrief) {
    const lines=document.createElement("p");
    lines.textContent=episodeBrief.reply;
    const source=document.createElement("small");
    source.textContent="Groq · fedélzeti eligazítás";
    panel.append(lines,source);
  }
  if(step.id==="debrief") {
    const recap=document.createElement("ul");
    for(const decision of state.campaign.history.slice(-3)) {
      const conflict=campaignBook.byId.get(decision.conflictId);
      const line=document.createElement("li");
      line.textContent=`${conflict.title} · ${conflict.choices[decision.choice]}`;
      recap.append(line);
    }
    panel.append(recap);
  }
  if(step.kind==="choice") {
    const debate=state.radio.find(item=>item.kind==="conflict"&&item.stage===step.id);
    if(debate?.text) {
      const lines=document.createElement("p");
      lines.textContent=debate.text;
      panel.append(lines);
    }
  }
  const options=step.choices||[{label:step.action,id:null}];
  for(const option of options)panel.append(makeButton(option.label,()=>completeOffer(step,npc,option)));
}

function completeOffer(step,npc,option) {
  if(step!==objective()||npc!==state.contact||npc.actor.id!==questGiver())return;
  const campaign=state.campaign;
  const context=step.conflict?storyContext():null;
  const advanced=campaign
    ? campaignBook.advance(campaign,step.kind,option.id)
    : questBook.advance(state.mission,step.kind,option.id);
  if(!advanced)return;
  if(step.kind==="choice")politics.activity("decision",npc.actor.id);
  const log=state.logs.get(dialogueKey(npc));
  log.push({who:actorById.get(state.active).name,text:option.label,player:true});
  log.push({who:npc.actor.name,text:option.effect||"Rendben. Rögzítettem a küldetésnaplóban."});
  if(step.conflict) {
    const decision=campaign.history.at(-1);
    radioItem("story-outcome",step.title+" · következmény",{
      actorId:npc.actor.id,conflictId:step.conflict.id,option:option.id,...context,
    },"A legénység rögzítette a döntést: "+option.label+". Az ügy bekerül a következő wyomingi jelentésbe.")
      .then(item=>{if(item.model)decision.outcome=item.text.slice(0,220);});
  }
  if(!campaign&&objective().kind==="done")state.campaign=campaignBook.start();
  if(objective().debate)publishConflict(objective());
  renderMap();renderQuestOffer();renderSocialOffer();paintLog();
  if(step.id==="report")tell("Jelentés elküldve. Új feladat érkezett a fedélzeten.");
  if(objective().id==="return-flight")tell("A kör lezárult. A Wyoming várja a legénységet.");
}

function commandUse() {
  if(state.mapId!=="ship"||!equal(position(),questBook.seat))return;
  if(state.mission.inFlight)return;
  const campaign=state.campaign;
  const step=objective();
  const flight=campaign?step.flight:questBook.beginFlight(state.mission);
  if(!flight){tell("A parancsnoki állás a következő repülési szakasznál lesz használható.");return;}
  if(campaign)state.mission.inFlight=true;
  stopRoute();closeChat();
  renderMap();
  $("flight-route").textContent=flight.from+" → "+flight.to;
  $("flight-progress").value=0;
  $("flight-marker").style.left="0%";
  $("flight-phase").textContent="Pálya beállítása…";
  $("flight-overlay").hidden=false;
  $("reselect").disabled=true;
  const started=performance.now();
  const tick=now=>{
    const ratio=Math.min(1,(now-started)/flight.duration);
    $("flight-progress").value=ratio*100;
    $("flight-marker").style.left=ratio*100+"%";
    const phase=ratio<.2?"Pálya beállítása…":ratio<.76?"Utazás a kijelölt pályán…":"Lassítás és helyzetellenőrzés…";
    if($("flight-phase").textContent!==phase)$("flight-phase").textContent=phase;
    if(ratio<1){requestAnimationFrame(tick);return;}
    if(campaign) {
      campaignBook.advance(campaign,"flight");
      state.mission.inFlight=false;
      state.mission.launched=step.id==="relaunch";
    } else questBook.advance(state.mission,"flight");
    $("flight-overlay").hidden=true;
    $("reselect").disabled=false;
    renderMap();
    tell("Megérkeztél · "+flight.to);
    sendGround();
  };
  requestAnimationFrame(tick);
}

function paintRadio() {
  $("comms").hidden=!state.radio.length;
  $("comms-count").textContent=state.unread?"· "+state.unread+" új":"";
  const log=$("comms-log");
  log.replaceChildren();
  for(const item of [...state.radio].reverse()) {
    const row=document.createElement("div");
    row.className="radio-item";
    const author=document.createElement("b"), line=document.createElement("p");
    author.textContent=item.title+(item.model?" · Groq":item.pending?" · vétel folyamatban":" · helyi");
    line.textContent=item.text;
    row.append(author,line);log.append(row);
  }
}
$("comms").addEventListener("toggle",()=>{if($("comms").open){state.unread=0;paintRadio();}});

async function radioItem(kind,title,context,offline) {
  const item={kind,title,text:offline,pending:true,actorId:context.actorId,stage:context.stage};
  state.radio.push(item);
  if(state.radio.length>18)state.radio.shift();
  if(!$("comms").open)state.unread++;
  paintRadio();
  const reply=await requestGroq({kind,...context});
  if(reply)Object.assign(item,{text:reply.reply,model:reply.model});
  item.pending=false;
  paintRadio();
  if(kind==="conflict"&&objective().kind==="choice")renderQuestOffer();
  return item;
}

function sendGround() {
  clearTimeout(state.groundTimer);
  if(!state.mission.launched)return;
  state.groundTimer=setTimeout(sendGround,65_000);
  if(document.hidden||state.mission.inFlight||!$("pick").hidden)return;
  const number=state.groundIndex++;
  const directive=questBook.directives[number%questBook.directives.length];
  const present=currentNpcs();
  const recipient=directive.recipients.map(id=>present.find(npc=>npc.actor.id===id)).find(Boolean) || present[0];
  if(!recipient)return;
  return radioItem("ground","Földi irányítás → "+recipient.actor.name,{
    actorId:recipient.actor.id,directive:number%questBook.directives.length,stage:objective().id,choice:state.mission.choice,reportChoice:state.mission.reportChoice,
    conflictId:objective().conflict?.id,
    decisions:state.campaign?.history.slice(-3),
  },objective().conflict
    ? "Földi irányítás. Az aktuális ügy kockázatáról kérünk rövid helyzetjelentést."
    : directive.fallback);
}

function publishConflict(step) {
  return radioItem("conflict",step.debate.title,{stage:step.id,choice:state.mission.choice},step.debate.fallback);
}

for(const actor of actors){
  const option=document.createElement("option");option.value=actor.id;option.textContent=actor.name+" · "+actor.role;
  $("captain-select").append(option);
}
$("captain-select").value="crew.captain";
$("start").addEventListener("click",()=>{begin();$("map").focus({preventScroll:true});});
$("reselect").addEventListener("click",()=>{
  if(state.mission.inFlight)return;
  stopRoute();closeChat();
  $("pick").hidden=false;$("play").hidden=true;
  renderRoster(true);renderMap();
  $("filters").firstElementChild.focus();
});
$("close-chat").addEventListener("click",()=>closeChat(true));
$("chat-form").addEventListener("submit",(event)=>{
  event.preventDefault();
  const input=$("chat-input");
  ask(input.value.trim());
  input.value="";
});
document.querySelectorAll("[data-map]").forEach(b=>b.addEventListener("click",()=>switchMap(b.dataset.map)));
document.querySelectorAll("[data-move]").forEach(b=>b.addEventListener("click",()=>takeStep(b.dataset.move)));
$("map").tabIndex=0;
$("map").addEventListener("click",(event)=>{
  if(event.target.closest("button") || !state.started || !$("pick").hidden)return;
  const rect=$("map").getBoundingClientRect();
  go([Math.floor((event.clientX-rect.left)/rect.width*columns),Math.floor((event.clientY-rect.top)/rect.height*rows)]);
});
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&state.contact){event.preventDefault();closeChat(true);return;}
  if(event.ctrlKey||event.altKey||event.metaKey||!state.started||!$("pick").hidden||event.target.matches("input,textarea,select,[contenteditable]"))return;
  const key=event.key.length===1?event.key.toLowerCase():event.key;
  if(!state.contact&&keys[key]){event.preventDefault();takeStep(keys[key]);}
  if(/^[1-3]$/.test(key)){event.preventDefault();switchActor(Number(key)-1);}
});

renderRoster();
renderMap();
