(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.questBook = factory();
})(globalThis, function () {
  "use strict";

  const seat = [4,3];
  const steps = [
    {id:"briefing", title:"UP-eligazítás", map:"wyoming", kind:"talk",
      givers:["up.mission-director","up.crew-liaison","wyoming.bar-owner","wyoming.station-hand"],
      goal:"Beszélj az eligazítást tartó szereplővel a Wyoming bárjában.",
      briefing:"Az UP felderítőútra küld benneteket. A 7-es Kvadráns indulása előtt a biztonsági tiszt átnézi veled a nyitott kérdéseket.",
      action:"Eligazítás tudomásul véve"},
    {id:"safety", title:"Indulási kockázatok", map:"wyoming", kind:"talk",
      givers:["up.safety-officer","wyoming.airlock-tech","android.reception","android.guide"],
      goal:"Keresd a sárga kérdőjelet a beszállónál.",
      briefing:"Az SNP-t használni tudjuk, az eredetét senki sem ismeri. Eltérő műszerjelzésnél a legénység megállítja a próbát, és visszaolvassa a mérést.",
      action:"Átnéztem a kockázatokat"},
    {id:"cargo", title:"Utolsó dokkellenőrzés", map:"wyoming", kind:"talk",
      givers:["wyoming.dockmaster","wyoming.shift-supervisor","wyoming.cargo-loader","wyoming.station-master"],
      goal:"A dokknál egyeztesd a személyzetet és a rakományt.",
      briefing:"A személyzet és a rakomány nyilvántartása kész. A beszálló zöld nyila most átvisz a 7-es Kvadránsra.",
      action:"Kérem a beszállási engedélyt"},
    {id:"board", title:"Beszállás", map:"wyoming", kind:"gate",
      goal:"Lépj a zöld nyílra a beszálló végén, és menj át a 7-es Kvadránsra."},
    {id:"drive", title:"Hajtáspróba", map:"ship", kind:"talk",
      givers:["crew.chief-engineer","crew.snp-technician","crew.systems-engineer","crew.life-support-tech"],
      goal:"Kérj indítási jelentést a géptérben.",
      briefing:"A hűtés stabil, az SNP-t készenlétbe állítottuk. A hídi parancsnoki állásból indíthatod a leválást.",
      action:"Hajtáspróba rögzítése"},
    {id:"launch", title:"Felszállás a Wyomingról", map:"ship", kind:"flight",
      goal:"Lépj a hídon a PARANCSNOKI ÁLLÁS négyzetére.",
      flight:{from:"Wyoming",to:"Biztonságos próbakör",duration:8000}},
    {id:"survey", title:"Első mérés a próbakörön", map:"ship", kind:"talk",
      givers:["crew.sensor-operator","crew.navigator","crew.comms-officer","android.pilot"],
      goal:"Beszélj a hídi mérőszolgálattal, és rögzítsd a próbakör adatait.",
      briefing:"Az első szenzorablak nyitva. A háttérzajból külön mérjük ki a hajtás nyomát, és a két olvasást együtt adjuk le.",
      action:"Próbaköri mérések rögzítése"},
    {id:"conflict", title:"Géptér vagy labor?", map:"ship", kind:"choice",
      givers:["up.snp-physicist","crew.chief-engineer","crew.snp-technician","crew.systems-engineer"],
      goal:"Hallgasd meg a két álláspontot a géptérben, és dönts az energiaelosztásról.",
      briefing:"A géptér több tartalékot kér a hűtéshez. Az UP nagyobb szenzorérzékenységet szeretne a közelítés előtt. Egy időben csak az egyik kap elsőbbséget.",
      debate:{title:"Géptér ↔ UP Labor", speakers:["Géptér","UP Labor"],
        positions:"A főgépész több hűtési tartalékot kér, zord, gyakorlatias hangon. Az SNP-fizikus nagyobb szenzorérzékenységet kér, konkrét méréssel indokolva.",
        fallback:"Géptér: A hűtés tartalékát kérem. Újabb ugrást ezzel a terheléssel sokáig nem vállalok.\nUP Labor: Ha most visszavesszük a műszereket, megint becslésből írjuk meg a közelítés első jelentését."},
      choices:[
        {id:"engine",label:"A géptér kap elsőbbséget",effect:"A hűtés nagyobb tartalékot kap. Az UP rövidebb mérési ablakot használ."},
        {id:"lab",label:"Az UP Labor kap elsőbbséget",effect:"A műszerek érzékenyebbek lesznek. A géptér sűrűbben ellenőrzi a hűtést."},
      ]},
    {id:"transit", title:"Utazás a Ross 128 b felé", map:"ship", kind:"flight",
      goal:"Térj vissza a hídi parancsnoki álláshoz az SNP-ugráshoz.",
      flight:{from:"Biztonságos próbakör",to:"Ross 128 b · megközelítés",duration:10000}},
    {id:"planet", title:"Bolygófelmérés", map:"ship", kind:"talk",
      givers:["up.exoplanet-scientist","crew.field-geologist","robot.sample","android.lab"],
      goal:"Egyeztess a mintatárban a Ross 128 b első felméréséről.",
      briefing:"Rögzítsük a távolságot és a pályát. A bemutató felszíne vizualizáció, ezért a jelentésben külön jelöljük a mérést és a feltételezést.",
      action:"Bolygófelmérés rögzítése"},
    {id:"report-conflict", title:"Gyorsjelentés vagy ellenőrzés?", map:"ship", kind:"choice",
      givers:["crew.comms-officer","crew.captain","crew.navigator","android.translator"],
      goal:"A hídon dönts, hogy azonnal megy-e az előzetes jelentés, vagy előbb átnézitek az eltérő mérést.",
      briefing:"A kommunikációs tiszt elküldené az előzetes adatokat a nyitott földi csatornán. Az UP adatelemzője még egyszer ellenőrizné a kilógó értéket.",
      debate:{title:"Híd ↔ UP adatelemzés", speakers:["Híd","UP adatelemzés"],
        positions:"A kommunikációs tiszt most küldene előzetes jelentést, egyértelműen jelölve a bizonytalanságot. Az UP adatelemzője előbb újra összevetné a két nyers naplót, mert van egy kilógó érték.",
        fallback:"Híd: Most nyitva a földi csatorna. Küldjünk előzetest, és jelöljük külön a bizonytalan pontot.\nUP adatelemzés: A nyers naplók eltérnek. Előbb össze szeretném vetni őket, hogy tudjuk, mit jelölünk."},
      choices:[
        {id:"send",label:"Küldjünk előzetes jelentést",effect:"A jelentés előzetes jelöléssel, az eltérés külön kiemelésével készül."},
        {id:"verify",label:"Ellenőrizzük még egyszer az adatot",effect:"Az UP összeveti a két nyers naplót, és a megjegyzés bekerül a jelentésbe."},
      ]},
    {id:"report", title:"Jelentés a Földnek", map:"ship", kind:"talk",
      givers:["crew.comms-officer","crew.captain","crew.navigator","android.translator"],
      goal:"A hídon add le a méréseket és a legénység döntését.",
      briefing:"A földi csatorna nyitva. A jelentésbe a próbakör mérései, az energiaelosztásról hozott döntés és a Ross 128 b felmérése kerül.",
      action:"Jelentés küldése a Földre"},
  ];

  const directives = [
    {recipients:["up.snp-physicist","crew.snp-technician","crew.chief-engineer"],
      task:"két független SNP-olvasás összevetése a próbakörön",
      fallback:"Földi irányítás. Az első próbakörben kérünk két külön műszerről SNP-olvasást. Az eltérést is küldjétek el."},
    {recipients:["up.exoplanet-scientist","android.lab","crew.field-geologist"],
      task:"a mért bolygóadatok és a látványhoz becsült felszín külön jelölése",
      fallback:"A bolygó jelentésében külön sorba kérjük a tényleges távolságot és a vizualizációhoz használt felszínt."},
    {recipients:["up.data-analyst","crew.sensor-operator","crew.navigator"],
      task:"a nyers mérések és időbélyegek megőrzése, külön jelölve a hibás pontokat",
      fallback:"A nyers értékeket időbélyeggel együtt tartsátok meg. Az egyik hibásnak tűnő pontot külön jelöljétek a jelentésben."},
    {recipients:["up.snp-physicist","crew.chief-engineer","crew.comms-officer"],
      task:"a hűtés állapotának és a mérési ablak hosszának visszaigazolása",
      fallback:"Kérjük a hűtési tartalékot és a szenzorablak hosszát. A következő felvételt ezek alapján ütemezzük."},
  ];

  const done = {id:"complete", title:"Felderítő menet teljesítve", map:"ship", kind:"done",
    goal:"A jelentés úton van a Földre. Körbejárhatod a hajót, és a földi rádió továbbra is fogad üzeneteket."};

  function start() {
    return {index:0, boarded:false, launched:false, inFlight:false, choice:null, reportChoice:null};
  }
  function current(mission) {
    return steps[mission.index] || done;
  }
  function giver(mission, available) {
    return current(mission).givers?.find(id=>available.has(id)) || null;
  }
  function advance(mission, event, choice) {
    const step=current(mission);
    if(step.kind!==event || step.kind==="done" || mission.inFlight!== (event==="flight")) return false;
    if(event==="choice") {
      if(!step.choices.some(option=>option.id===choice)) return false;
      if(step.id==="report-conflict")mission.reportChoice=choice;
      else mission.choice=choice;
    }
    if(event==="gate")mission.boarded=true;
    if(event==="flight") {
      mission.inFlight=false;
      if(step.id==="launch") mission.launched=true;
    }
    mission.index++;
    return true;
  }
  function beginFlight(mission) {
    const step=current(mission);
    if(step.kind!=="flight" || mission.inFlight) return null;
    mission.inFlight=true;
    return step.flight;
  }

  return {seat, steps, directives, start, current, giver, advance, beginFlight};
});
