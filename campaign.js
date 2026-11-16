(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(require("./conflicts.js"));
  else root.campaignBook = factory(root.conflictBook);
})(globalThis, function (conflicts) {
  "use strict";

  const episodesPerVoyage = 3;
  const byId = new Map(conflicts.map(conflict => [conflict.id, conflict]));
  const specialists = {
    signals: ["crew.comms-officer", "crew.sensor-operator", "android.translator", "crew.navigator"],
    supply: ["crew.cargo-master", "crew.life-support-tech", "crew.mission-cook", "android.deckhand"],
    governance: ["crew.captain", "crew.comms-officer", "up.data-analyst", "android.archivist"],
    drive: ["crew.chief-engineer", "crew.snp-technician", "up.snp-physicist", "crew.systems-engineer"],
    ecology: ["up.exoplanet-scientist", "crew.field-geologist", "android.lab", "robot.sample"],
    crew: ["crew.flight-medic", "crew.captain", "android.medic", "crew.mission-cook"],
    machines: ["crew.robotics-tech", "android.deckhand", "android.archivist", "android.pilot"],
  };
  const stages = {
    "return-flight": {
      id:"return-flight", kind:"flight", map:"ship", title:"Vissza a Wyomingra",
      goal:"A hídi parancsnoki állásnál indítsd a visszautat.",
      flight:{from:"Felderítési körzet", to:"Wyoming · dokk", duration:8000},
    },
    "return-dock": {
      id:"return-dock", kind:"gate", map:"ship", title:"Kiszállás a Wyomingon",
      goal:"Lépj a hajó zsilipjénél a zöld nyílra.",
    },
    debrief: {
      id:"debrief", kind:"talk", map:"wyoming", title:"Jelentés és utánpótlás",
      goal:"Keresd a sárga kérdőjelet a Wyomingon.",
      givers:["up.mission-director", "wyoming.station-master", "up.crew-liaison", "wyoming.dockmaster"],
      briefing:"A Wyoming leveszi a kör jelentéseit és feltölti a készleteket. A következő felderítési körre a dokk ad indulási engedélyt.",
      action:"Jelentés leadása és indulási engedély kérése",
    },
    reboard: {
      id:"reboard", kind:"gate", map:"wyoming", title:"Vissza a 7-es Kvadránsra",
      goal:"A beszálló zöld nyilán át térj vissza a hajóra.",
    },
    relaunch: {
      id:"relaunch", kind:"flight", map:"ship", title:"Új felderítési kör",
      goal:"A hídi parancsnoki állásnál indítsd a következő kört.",
      flight:{from:"Wyoming · dokk", to:"Felderítési körzet", duration:8000},
    },
  };

  function nextEpisode(campaign) {
    if (!campaign.remaining.length) {
      campaign.remaining = conflicts.filter(conflict => conflict.id !== campaign.history.at(-1)?.conflictId);
      const last = byId.get(campaign.history.at(-1)?.conflictId);
      if (last) campaign.remaining.push(last);
    }
    const lastId = campaign.history.at(-1)?.conflictId;
    const count = campaign.remaining.length;
    // At the start of a new pass, skip the card just completed on the previous pass.
    const lastAtEnd = count > 1 && campaign.remaining.at(-1).id === lastId;
    const index = Math.floor(campaign.random() * (count - Number(lastAtEnd)));
    const [conflict] = campaign.remaining.splice(index, 1);
    campaign.step = {
      id:"episode", kind:"choice", map:"ship", conflict, title:conflict.title,
      goal:"Keresd a sárga kérdőjelet, és dönts a legénységgel.",
      briefing:conflict.brief,
      givers:specialists[conflict.theme],
      choices:conflict.choices.map((label, id) => ({id, label})),
    };
  }

  function start(random = Math.random) {
    const campaign = {remaining:conflicts.slice(), history:[], total:0, voyage:1, random, step:null};
    nextEpisode(campaign);
    return campaign;
  }

  function advance(campaign, event, choice) {
    const {step} = campaign;
    if (event !== step.kind) return false;
    switch (step.id) {
      case "episode":
        if (!step.choices.some(option => option.id === choice)) return false;
        campaign.history.push({conflictId:step.conflict.id, choice});
        if (campaign.history.length > 6) campaign.history.shift();
        campaign.total++;
        if (campaign.total % episodesPerVoyage === 0) campaign.step = stages["return-flight"];
        else nextEpisode(campaign);
        return true;
      case "return-flight": campaign.step = stages["return-dock"]; return true;
      case "return-dock": campaign.step = stages.debrief; return true;
      case "debrief": campaign.step = stages.reboard; return true;
      case "reboard": campaign.step = stages.relaunch; return true;
      case "relaunch": campaign.voyage++; nextEpisode(campaign); return true;
      default: return false;
    }
  }

  return {byId, specialists, stages, start, advance};
});
