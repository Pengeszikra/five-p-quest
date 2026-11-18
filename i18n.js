(function(){
"use strict";
const lang = localStorage.getItem("five-percent-language") === "en" ? "en" : "hu";
window.gameLanguage=lang;
const en=lang==="en";
const dictionary={
"Quest próba":"Quest Prototype","WU–3463 · állomás":"WU–3463 · station","Átjáró zárva":"Passage closed","felderítőhajó":"exploration ship","Ellenőrzés…":"Checking…",
"7-ES KVADRÁNS · REPÜLÉSI NAPLÓ":"SECTOR 7 · FLIGHT LOG","Jelölj ki legfeljebb három szereplőt az induláshoz.":"Choose up to three characters to begin.",
"SZEREPLŐVÁLASZTÁS":"CHARACTER SELECTION","Kivel indulsz?":"Who will you travel with?",
"Válassz 1–3 szereplőt. A kapitányt külön is kinevezheted a 64 szereplő közül; a kinevezésnek következményei lesznek.":"Select 1–3 characters. You can appoint any of the 64 characters as captain; the appointment has consequences.",
"KAPITÁNY KINEVEZÉSE":"APPOINT CAPTAIN","Belépés ":"Enter ","Belépés":"Enter","IRÁNYÍTOTT SZEREPLŐ":"CONTROLLED CHARACTER",
"Csere":"Change","Fedélzeti rádió ":"Ship radio ","Fedélzeti rádió":"Ship radio","Ki jár erre?":"Who's around?",
"Lépj neki egy figurának, vagy kattints a portréjára. Ha odaérsz, itt indul a beszélgetés.":"Walk up to someone or click their portrait to start a conversation.",
"Te":"You","Beszélgetőpartner":"Contact","Átjáró":"Passage","Küldetés":"Mission","Fedélzeti ügy":"Crew issue",
"vagy nyilak":"or arrows","bezárás":"close","Átjárás szabad":"Passage open","Dokkolva · zárva":"Docked · closed","Nincs kapcsolat":"Disconnected",
"Parancsnoki állás":"Command station","FEDÉLZETI POLITIKA":"CREW POLITICS",
"Üdvözlöm. Miben segíthetek?":"Greetings. How can I help?","Üdv. Van egy percem, mielőtt visszatérek a laborhoz. Miről beszéljünk?":"Hello. I have a minute before returning to the lab. What shall we discuss?",
"Szia! Új vagy itt, vagy csak a következő műszakot várod?":"Hey! New here, or waiting for your next shift?",
"Szia. Épp levegőhöz jutottam két műszak között. Mondd!":"Hello. I have a moment between shifts. Go ahead.",
"Rendben. Rögzítettem a küldetésnaplóban.":"Understood. Recorded in the mission log.",
"Groq · fedélzeti eligazítás":"Groq · crew briefing",
"BÁR":"BAR","UP LABOR":"UP LAB","ÜVEGHÁZ":"GREENHOUSE","DOKK":"DOCK","MŰHELY":"WORKSHOP","BESZÁLLÓ":"BOARDING",
"HÍD":"BRIDGE","LAKÓTÉR":"QUARTERS","MINTATÁR":"SAMPLE STORAGE","GÉPTÉR":"ENGINE ROOM","HANGÁR":"HANGAR","ZSILIP":"AIRLOCK",
"ÁLLOMÁS":"STATION","FELDERÍTŐHAJÓ":"EXPLORATION SHIP","A HAJÓHOZ":"TO SHIP","WYOMINGRA":"TO WYOMING",
"A hajó":"The ship","Wyoming":"Wyoming","UP Labor":"UP Lab","Robotok":"Robots",
"Felderítő menet teljesítve":"Exploration completed",
"Biztonságos próbakör":"Safe test circuit","Ross 128 b · megközelítés":"Ross 128 b · approach","Felderítési körzet":"Survey area","Wyoming · dokk":"Wyoming · dock",
"Földi irányítás":"Ground control","Helyi válasz":"Offline reply","Groq-párbeszéd":"Groq dialogue","A válasz készül…":"Composing a reply…",
"Helyi mód":"Offline mode","Kulcs beállítva":"Key configured","Aktív · gpt-oss-120b":"Active · gpt-oss-120b","Nem elérhető":"Unavailable",
"Újra a játékba ":"Return to game ","Vissza a játékba ":"Return to game "
};
const steps={
briefing:["UP briefing","Speak with the briefing officer in the Wyoming bar.","UP is sending your crew on a survey mission. Before Sector 7 departs, the safety officer will review outstanding concerns.","Acknowledge briefing"],
safety:["Departure risks","Find the yellow question mark near boarding.","We can operate SNP technology, but nobody knows where it came from. If instruments disagree, stop the test and repeat the readings.","Review risks"],
cargo:["Final dock check","Confirm the crew and cargo at the dock.","Crew and cargo manifests are ready. The green arrow at boarding now leads to Sector 7.","Request boarding clearance"],
board:["Boarding","Step on the green arrow at the end of the boarding area to enter Sector 7."],
drive:["Drive test","Request a launch report in the engine room.","Cooling is stable and SNP is on standby. Use the command station on the bridge to undock.","Record drive test"],
launch:["Departure from Wyoming","Step onto the COMMAND STATION square on the bridge."],
survey:["First measurements","Speak to bridge sensor staff and record the test circuit readings.","The first sensor window is open. Measure the drive signature separately from background noise, then submit both readings.","Record test measurements"],
conflict:["Engine room or laboratory?","Hear both arguments in the engine room and decide how to allocate power.","Engineering wants more cooling reserve. UP wants greater sensor sensitivity before approach. Only one can have priority.","",["Prioritize engineering","Prioritize the UP Lab"]],
transit:["Journey to Ross 128 b","Return to the bridge command station for the SNP jump."],
planet:["Planetary survey","Discuss the first Ross 128 b survey in sample storage.","Record the distance and orbit. The surface shown is a visualization, so distinguish measurement from speculation in the report.","Record planetary survey"],
"report-conflict":["Send now or verify?","On the bridge, decide whether to send preliminary results now or review the discrepant reading first.","Communications wants to send preliminary data on the open Earth channel. The UP data analyst wants to verify the outlier.","",["Send a preliminary report","Verify the data again"]],
report:["Report to Earth","Submit the measurements and the crew's decisions from the bridge.","The Earth channel is open. The report includes the test measurements, energy allocation decision, and Ross 128 b survey.","Send report to Earth"],
complete:["Exploration completed","The report is on its way to Earth. You can explore the ship while ground communications remain active."]
};
const extra={
"return-flight":["Return to Wyoming","Start the return journey at the bridge command station."],
"return-dock":["Disembark at Wyoming","Step on the green arrow by the airlock."],
debrief:["Debrief and resupply","Find the yellow question mark on Wyoming.","Wyoming receives the survey report and resupplies the ship. Dock control clears the next mission.","Submit report and request clearance"],
reboard:["Return to Sector 7","Use the green arrow at boarding to re-enter the ship."],
relaunch:["New survey mission","Start the next mission at the bridge command station."]
};
function translatedField(object,key,value) {
 const original=object[key];
 Object.defineProperty(object,key,{configurable:true,enumerable:true,get(){return window.gameLanguage==="en"?value:original;},set(v){Object.defineProperty(object,key,{value:v,writable:true,enumerable:true,configurable:true});}});
}
function localizeStep(step,arr){
 if(!step||!arr)return;
 ["title","goal","briefing","action"].forEach((field,i)=>{if(arr[i]&&step[field])translatedField(step,field,arr[i]);});
 if(arr[4]&&step.choices)step.choices.forEach((choice,i)=>{if(arr[4][i])translatedField(choice,"label",arr[4][i]);});
}
if(en){
 document.documentElement.lang="en";
 const names={
 "7-es Kvadráns":"Sector 7",
 "Kapitány":"Captain"
 };
 const actorRoles={};
 actors.forEach(actor=>{
   const role=actor.role.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()).replace("Snp","SNP").replace("Eva","EVA");
   const name=actor.id==="crew.captain"?"Captain":role;
   actorRoles[actor.id]=name;
   translatedField(actor,"name",name);
   translatedField(actor,"work","I serve as the "+role.toLowerCase()+" in the Five Percent expedition. My responsibility is "+role.toLowerCase()+" operations.");
   translatedField(actor,"sample","I'm the "+role.toLowerCase()+". Tell me what you need to know.");
 });
 questBook.steps.forEach(step=>localizeStep(step,steps[step.id]));
 if(campaignBook.stages)Object.values(campaignBook.stages).forEach(step=>localizeStep(step,extra[step.id]));
 const finished=questBook.current({index:999});
 localizeStep(finished,steps.complete);
 conflictBook.forEach(conflict=>{
   translatedField(conflict,"title",conflict.heading);
   translatedField(conflict,"brief",conflict.premise);
 });
}
function convert(text) {
 if(!en||!text||!text.trim())return text;
 const match=text.match(/^(\s*)(.*?)(\s*)$/s);
 const source=match[2];
 if(dictionary[source])return match[1]+dictionary[source]+match[3];
 return text;
}
function translateTree(node){
 if(!en)return;
 const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const item of nodes){
   if(item.parentElement?.closest("script,style,textarea"))continue;
   const v=convert(item.nodeValue);if(v!==item.nodeValue)item.nodeValue=v;
 }
 for(const el of [node,...(node.querySelectorAll?.("[title],[aria-label],[placeholder]")||[])]){
   if(!el.getAttribute)continue;
   for(const attr of ["title","aria-label","placeholder"]){const value=el.getAttribute(attr);if(value){const v=convert(value);if(v!==value)el.setAttribute(attr,v);}}
 }
}
const choose=document.createElement("select");
choose.id="language-switch";choose.setAttribute("aria-label","Language / Nyelv");choose.title="Language / Nyelv";
choose.innerHTML='<option value="hu">HU</option><option value="en">EN</option>';
choose.value=lang;
choose.addEventListener("change",()=>{localStorage.setItem("five-percent-language",choose.value);location.reload();});
const header=document.querySelector(".masthead");
header.append(choose);
choose.style.cssText="margin-left:8px;background:#172b31;color:#e6f5ed;border:1px solid #6a9695;border-radius:8px;padding:7px 9px;cursor:pointer";
if(en){
 translateTree(document.body);
 const observer=new MutationObserver(changes=>{
  for(const change of changes){
   if(change.type==="characterData"){const n=change.target;const v=convert(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;}
   else change.addedNodes.forEach(n=>{if(n.nodeType===1||n.nodeType===3)translateTree(n);});
  }
 });
 observer.observe(document.body,{childList:true,characterData:true,subtree:true});
}
})();
