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
 const englishProfiles={"crew.captain":"Leads the expedition and takes personal responsibility for bringing the crew home.","crew.pilot":"Flies the exploration ship and handles flight operations and docking.","crew.navigator":"Plots routes and monitors the ship's trajectory.","crew.chief-engineer":"Keeps the ship's machinery, cooling and engineering systems operational.","crew.snp-technician":"Operates and maintains the experimental SNP drive.","crew.flight-medic":"Provides medical care during the mission.","crew.systems-engineer":"Maintains interconnected ship systems and diagnoses failures.","crew.sensor-operator":"Monitors sensors and gathers flight and survey measurements.","crew.eva-specialist":"Works outside the ship during spacewalks.","crew.field-geologist":"Studies samples and planetary geology.","crew.cargo-master":"Coordinates cargo loads, manifests and stowage.","crew.lander-pilot":"Pilots the landing craft on planetary missions.","crew.comms-officer":"Handles communications with Earth and other stations.","crew.life-support-tech":"Maintains life-support systems and environmental controls.","crew.robotics-tech":"Repairs and operates the ship's robotic systems.","crew.mission-cook":"Feeds the crew and supports life aboard ship.","wyoming.station-master":"Runs the Wyoming station and oversees daily operations.","wyoming.bar-owner":"Runs the station bar, a meeting place for travellers and crew.","wyoming.dockmaster":"Coordinates docking procedures and ship clearances.","wyoming.tug-pilot":"Moves ships and cargo around the station.","wyoming.salvager":"Recovers and sorts usable parts from wreckage.","wyoming.hull-welder":"Repairs damaged ship hulls and structural joints.","wyoming.airlock-tech":"Checks and maintains boarding airlocks.","wyoming.cargo-loader":"Loads and unloads freight on the dock.","wyoming.quartermaster":"Manages station stock and equipment.","wyoming.station-paramedic":"Responds to medical emergencies on the station.","wyoming.short-order-cook":"Prepares food for bar customers and visiting crews.","wyoming.scrap-dealer":"Trades salvaged parts and obsolete equipment.","wyoming.freight-broker":"Arranges freight transport and shipping jobs.","wyoming.greenhouse-tech":"Maintains the station's greenhouse systems.","wyoming.shift-supervisor":"Coordinates work shifts and station personnel.","wyoming.station-hand":"Handles the station's many practical day-to-day jobs.","up.mission-director":"Sets expedition priorities and authorizes missions.","up.crew-liaison":"Coordinates between UP leadership and the ship's crew.","up.flight-instructor":"Trains crews in piloting and flight procedures.","up.safety-officer":"Evaluates mission risks and safety protocols.","up.snp-physicist":"Studies repeatable effects of the mysterious SNP drive.","up.inverzit-engineer":"Engineers the inverzit systems used by SNP technology.","up.field-theorist":"Investigates physical field models and unresolved phenomena.","up.black-hole-researcher":"Studies black holes and extreme gravitational environments.","up.exoplanet-scientist":"Analyzes distant planets and their environments.","up.gravity-specialist":"Studies gravity and its practical applications.","up.data-analyst":"Cross-checks measurements and identifies anomalies.","up.instrument-maker":"Designs, builds and repairs scientific instruments.","up.test-pilot":"Performs experimental flight trials.","up.xenobiologist":"Investigates potential extraterrestrial biology.","up.simulation-engineer":"Models and simulates missions and equipment behaviour.","up.lab-technician":"Prepares samples and runs laboratory procedures.","robot.bartender":"Serves customers at the Wyoming bar.","robot.cargo":"Assists with loading, handling and moving freight.","robot.hull-repair":"Performs external hull maintenance and repairs.","robot.inspection-drone":"Surveys structures and searches for mechanical defects.","robot.tug":"Moves cargo and equipment at the station.","robot.cleaning":"Keeps the station and ship areas clean.","robot.survey-drone":"Carries out autonomous reconnaissance missions.","robot.sample":"Collects and handles scientific samples.","android.reception":"Welcomes visitors and assists with station services.","android.medic":"Provides automated medical assistance.","android.deckhand":"Supports crew operations and routine ship duties.","android.lab":"Assists with scientific experiments and laboratory samples.","android.translator":"Translates between languages and supports communications.","android.pilot":"Assists with piloting and navigation.","android.archivist":"Maintains and searches historical and technical records.","android.guide":"Helps visitors find their way around the station."};
 const englishChoices={"last-ping":["Reply to the beacon","Triangulate its direction first"],"borrowed-light":["Launch a rescue survey","Measure from another angle"],"old-news":["Save the entire broadcast","Yield the channel to the freighter"],"quiet-window":["Keep the measurement window","Give the time to the family call"],"wrong-voice":["Request confirmation on another channel","Keep the docking order"],"missing-minute":["Temporarily designate one master clock","Preserve both timelines"],"late-warning":["Turn onto a safer course","Continue observing from this course"],"two-distances":["Fly using onboard readings","Wait for independent measurements"],"coded-weather":["Investigate the extra pulse","Respect the channel restrictions"],"anonymous-fix":["Use it with an explicit warning","Set it aside until independently verified"],"last-filter":["Give the filter to the medical transport","Keep it and arrange urgent resupply"],"cold-cargo":["Give the medicine the reliable compartment","Keep the sample chilled and arrange a medicine handoff"],"fuel-ledger":["Offer the next survey slot","Renegotiate the escort arrangement"],"borrowed-bay":["Yield the bay and accept the delay","Finish the repair before yielding the bay"],"heavy-return":["Bring a smaller certified core sample","Carry the full sample and arrange another shipment"],"off-brand":["Wait for the certified part","Use the local part for ground testing only"],"orange-crate":["Open and inspect the disputed seal","Check using weight and shipping records"],"water-tally":["Shut down and inspect the recycler","Secure water for plants, then shut it down"],"hotel-load":["Reduce shared consumption","Shorten instrument operating time"],"spares-for-tomorrow":["Leave the pump at the base","Take it and arrange a temporary replacement"],"survey-claim":["Request a joint independent remeasurement","Publish the previously certified data"],"crew-waiver":["Let individuals decide and swap voluntarily","Postpone testing until conditions are agreed"],"first-map":["Give Wyoming a brief priority window","Release the data and credit its creators"],"last-seat":["Give the returning traveller a seat","Prioritize the incoming shift"],"nobody-signed":["Have the station master openly take responsibility","Wait for the authorized owner"],"night-contract":["Keep the original terms","Renegotiate only this rescue"],"blind-review":["Commission an independent review","Request a confidential signed review"],"queue-privilege":["Prioritize the maneuver already underway","Honor the contract and pay compensation"],"license-patch":["Keep using the licensed patch","Spend one shift on the old open code"],"closed-test":["Accept the restricted trial","Demand immediate release of navigation data"],"warm-bearing":["Enter a gentle test circuit","Continue with more frequent checks"],"ghost-thrust":["Preserve the state for a new measurement","Return to the usual configuration"],"same-dose":["Close the corridor until measurement is complete","Arrange a check within a short window"],"the-seal":["Document the problem and suspend launch","Run a sealed temperature cross-check"],"calibration-debt":["Calibrate on site","Launch in limited mode and postpone testing"],"one-in-ten":["Run a series of cold-start measurements","Choose a warm start and log the exception"],"competing-zeroes":["Keep two data series and document the difference","Choose a shared temporary zero"],"drive-echo":["Request a coordinated retest","Compare the current logs"],"power-ration":["Keep logging and evacuate the cabin","Keep the instrument rack powered and note the log gap"],"unexpected-drift":["Keep the passage closed until remote inspection","Request a supervised on-site inspection"],"dust-bloom":["Investigate possible contamination","Publish a cautious attributed observation now"],"sterile-downwind":["Choose a more distant landing site","Use the safer route with documented restrictions"],"ice-core":["Leave the control sample in place","Request immediate external freezer space for the ice sample"],"overhead-beacon":["Reduce disruptive observations","Maintain drone contact and shift to a more distant orbit"],"false-sunrise":["Keep the image clearly labeled as a visualization","Switch to a view based only on measured data"],"sample-victory":["Record it as an uncontextualized sample","Wait for independent resampling"],"radiant-stress":["Release a measured test quantity","Isolate the sample for further measurements"],"rainless-river":["Plan a second pass in different lighting","Log it as a preliminary observation and move on"],"white-tile":["Document and then recover the object","Leave it in place and make a quick site recording"],"second-air":["Let the robot finish the measurement alone","Postpone until human participation is possible"],"double-shift":["Arrange a private shift change","Discuss general workload at the joint trial"],"shared-credit":["Correct the attribution together in private","Agree on a public correction"],"dinner-tab":["Make the true hospitality cost visible","Discuss a simpler shared dinner with the guests"],"two-captains":["Clearly designate the onboard decision-maker","Request a joint read-back briefing"],"the-unsent-letter":["Contact the sender on a private channel","Remove it from the shared queue and store it securely"],"guest-bed":["Find another quiet place for the shift worker","Agree on two separate rest periods"],"borrowed-tool":["Check the checkout log first","Offer anonymous return of the tool"],"camera-in-the-mess":["Attach only the footage relevant to the incident","Keep the full recording under restricted access"],"exit-interview":["Prepare a confidential handover plan","Ask for a joint conversation with those involved"],"which-home":["Request a shared transfer point","Take a detour and arrange another connection"],"the-robot-vote":["Give the robot a place in the provisional vote","Hear it out and agree on a rule interpretation"],"restore-point":["Record the promise before repairing","Request a short repair extension to meet the promise"],"wrong-protocol":["Check the cargo manually","Run a supervised low-risk test"],"many-owners":["Assign one controller per shift","Stop the drone until the joint handover"],"archive-gap":["Leave the log entry visibly blank","Add a separately marked estimated reconstruction"],"off-duty":["Protect the android's free hour","Request a consensual time swap"],"borrowed-face":["Temporarily switch to a neutral appearance","Use a human colleague during the change"],"no-explanation":["Suspend automatic assignments","Request a joint, auditable correction"],"old-law":["Link the inspection with the digital register","Use temporary human checks"],"the-good-summary":["Release the full approved minutes","Publish a short version with anonymous objections"]};
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
   translatedField(actor,"work",englishProfiles[actor.id]||("I work as "+role.toLowerCase()+ "."));
   translatedField(actor,"sample","I'm the "+role.toLowerCase()+". Tell me what you need to know.");
 });
 questBook.steps.forEach(step=>localizeStep(step,steps[step.id]));
 if(campaignBook.stages)Object.values(campaignBook.stages).forEach(step=>localizeStep(step,extra[step.id]));
 
 const optionEffects={
 conflict:["Engineering gets more cooling reserve. UP will have a shorter measurement window.","The instruments gain sensitivity. Engineering checks cooling more frequently."],
 "report-conflict":["The report is marked preliminary, with the discrepancy highlighted.","UP compares the raw logs and includes its findings in the report."]
 };
 questBook.steps.forEach(step=>{
  if(optionEffects[step.id])step.choices.forEach((choice,i)=>translatedField(choice,"effect",optionEffects[step.id][i]));
 });
 const debateEnglish={
 conflict:{title:"Engineering ↔ UP Lab",positions:"Engineering requests cooling reserve; the SNP physicist argues for instrument sensitivity.",fallback:"Engineering: We need more cooling reserve. I cannot promise another jump under this load.\nUP Lab: If we reduce the instruments now, the first approach report will be based on guesses again.",speakers:["Engineering","UP Lab"]},
 "report-conflict":{title:"Bridge ↔ UP Analysis",positions:"Communications wants to send an explicitly preliminary report now. UP Analysis wants to compare the raw logs first.",fallback:"Bridge: The Earth channel is open. Send a preliminary report and flag uncertain points.\nUP Analysis: The raw logs disagree. Let me compare them before we report.",speakers:["Bridge","UP Analysis"]}
 };
 questBook.steps.forEach(step=>{
   if(!step.debate||!debateEnglish[step.id])return;
   const d=debateEnglish[step.id];
   ["title","positions","fallback","speakers"].forEach(k=>translatedField(step.debate,k,d[k]));
 });
 const directivesEnglish=[
 ["compare two independent SNP readings during the test circuit","Ground control: Obtain SNP readings from two independent instruments. Report discrepancies too."],
 ["distinguish measured planetary data from a visualized surface estimate","In the planetary report, list the measured distance separately from the estimated surface visualization."],
 ["preserve raw readings and timestamps, flagging suspicious points","Keep raw values with their timestamps. Flag the apparently erroneous point in the report."],
 ["confirm cooling reserve and sensor window length","Report the cooling reserve and sensor window length so we can schedule the next scan."]
 ];
 questBook.directives.forEach((directive,i)=>{translatedField(directive,"task",directivesEnglish[i][0]);translatedField(directive,"fallback",directivesEnglish[i][1]);});

 const finished=questBook.current({index:999});
 localizeStep(finished,steps.complete);
 conflictBook.forEach(conflict=>{
   translatedField(conflict,"title",conflict.heading);
   translatedField(conflict,"brief",conflict.premise);
   if(englishChoices[conflict.id])translatedField(conflict,"choices",englishChoices[conflict.id]);
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
