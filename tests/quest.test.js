const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const quest=require("../quest.js");
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
      const blocked=new Set(map.npcs.map(n=>keyOf(n.cell)));
      const reached=routeMap(map,map.spawn,blocked);
      assert(reached.has(keyOf(map.exit)));
      if(map===maps.ship)assert(reached.has(keyOf(questBook.seat)));
      for(const npc of map.npcs)assert(neighbors(npc.cell).some(c=>canStep(map,c,npc.cell)&&reached.has(keyOf(c))),npc.actor.id);
    }
    for(const [index,step] of questBook.steps.entries()){
      if(!step.givers)continue;
      const onMap=new Set(maps[step.map].npcs.map(n=>n.actor.id));
      for(const id of step.givers)assert(onMap.has(id),id);
      step.givers.slice(0,3).forEach(id=>onMap.delete(id));
      assert.equal(questBook.giver({index},onMap),step.givers[3]);
    }
  `,{questBook:quest,assert});
});
