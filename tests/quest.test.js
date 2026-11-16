const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const quest=require("../quest.js");
const campaign=require("../campaign.js");
const actorsCode=fs.readFileSync(require.resolve("../actors.js"),"utf8");

test("the campaign cannot skip steps and reaches the report after both possible decisions",()=>{
  for(const [decision,reportDecision] of [["engine","send"],["lab","verify"]]){
    const mission=quest.start();
    assert.equal(quest.advance(mission,"gate"),false);
    assert.equal(quest.beginFlight(mission),null);
    for(const step of quest.steps){
      assert.equal(quest.current(mission).id,step.id);
      if(step.kind==="choice")assert.equal(quest.advance(mission,"choice","unknown"),false);
      if(step.kind==="flight"){
        assert.equal(quest.advance(mission,"flight"),false);
        assert.equal(quest.beginFlight(mission),step.flight);
        assert.equal(quest.beginFlight(mission),null);
      }
      assert.equal(quest.advance(mission,step.kind,step.id==="report-conflict"?reportDecision:decision),true);
      if(step.id==="board")assert.equal(mission.boarded,true);
      if(step.id==="launch")assert.equal(mission.launched,true);
    }
    assert.equal(mission.choice,decision);
    assert.equal(mission.reportChoice,reportDecision);
    assert.equal(quest.current(mission).id,"complete");
  }
});

test("all portraits have accessible positions and three playable characters cannot remove the quest giver",()=>{
  const source=fs.readFileSync(require.resolve("../game.js"),"utf8").split("const state=")[0];
  vm.runInNewContext(actorsCode+source+`
    assert.equal(placed.size,64);
    for(const map of Object.values(maps)){
      const occupied=map.npcs.map(npc=>npc.cell);
      const reached=routeMap(map,map.spawn,walkingBlockers(map,occupied));
      assert(!reached.has(keyOf(map.exit)),"Ordinary paths must avoid the transition tile");
      assert(routeMap(map,map.spawn,walkingBlockers(map,occupied,map.exit)).has(keyOf(map.exit)));
      if(map===maps.ship) {
        assert(!reached.has(keyOf(questBook.seat)),"Ordinary paths must avoid the command seat");
        assert(routeMap(map,map.spawn,walkingBlockers(map,occupied,questBook.seat)).has(keyOf(questBook.seat)));
      }
      for(const npc of map.npcs)assert(approaches(map,npc.cell,reached).length>0,npc.actor.id);
    }
    const map=maps.wyoming;
    const director=map.npcs.find(npc=>npc.actor.id==="up.mission-director");
    const safety=map.npcs.find(npc=>npc.actor.id==="up.safety-officer");
    const blockers=walkingBlockers(map,map.npcs.map(npc=>npc.cell));
    const fromSpawn=routeMap(map,map.spawn,blockers);
    for(const fromBar of approaches(map,director.cell,fromSpawn)){
      const reached=routeMap(map,fromBar,blockers);
      assert(approaches(map,safety.cell,reached).length>0,"Safety officer must be reachable from the briefing with boarding still locked");
    }
    for(const [index,step] of questBook.steps.entries()){
      if(!step.givers)continue;
      const onMap=new Set(maps[step.map].npcs.map(n=>n.actor.id));
      for(const id of step.givers)assert(onMap.has(id),id);
      step.givers.slice(0,3).forEach(id=>onMap.delete(id));
      assert.equal(questBook.giver({index},onMap),step.givers[3]);
    }
    const recurringGivers=[
      ...Object.values(campaignBook.specialists).map(givers=>({map:"ship",givers})),
      campaignBook.stages.debrief,
    ];
    for(const step of recurringGivers){
      assert.equal(new Set(step.givers).size,4);
      for(const id of step.givers)assert(maps[step.map].npcs.some(npc=>npc.actor.id===id),id);
    }
  `,{questBook:quest,campaignBook:campaign,assert});
});

test("all 70 conflicts are playable before the deck repeats, with a mandatory Wyoming stop after every three",()=>{
  const state=campaign.start(()=>0.9999);
  const seen=new Set();
  for(let count=0;count<70;count++){
    assert.equal(state.step.id,"episode");
    const conflict=state.step.conflict;
    assert(!seen.has(conflict.id));
    assert.equal(state.step.choices.length,2);
    assert.equal(campaign.advance(state,"choice","0"),false);
    assert.equal(campaign.advance(state,"gate"),false);
    seen.add(conflict.id);
    assert(campaign.advance(state,"choice",count%2));
    if((count+1)%3===0){
      for(const [id,action] of [["return-flight","flight"],["return-dock","gate"],["debrief","talk"],["reboard","gate"],["relaunch","flight"]]){
        assert.equal(state.step.id,id);
        assert(campaign.advance(state,action));
      }
    }
  }
  assert.equal(state.total,70);
  assert.equal(state.history.length,6);
  assert.equal(state.voyage,24);
  assert.notEqual(state.step.conflict.id,state.history.at(-1).conflictId);
  assert.equal(seen.size,campaign.byId.size);
  const english=fs.readFileSync(require.resolve("../conflicts.md"),"utf8");
  for(const conflict of campaign.byId.values())assert(english.includes(conflict.premise),conflict.id);
});
