const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const context={};context.globalThis=context;
vm.runInNewContext(fs.readFileSync(require("node:path").join(__dirname,"../social.js"),"utf8"),context);
const actors=[
  {id:"crew.captain",name:"Kapitány",role:"CAPTAIN",sheet:0},
  {id:"crew.pilot",name:"Pilóta",role:"PILOT",sheet:0},
  {id:"crew.engineer",name:"Mérnök",role:"ENGINEER",sheet:0},
  {id:"android.archivist",name:"Archív android",role:"ARCHIVIST",sheet:3},
  {id:"wyoming.station-master",name:"Állomásfőnök",role:"STATION MASTER",sheet:1}
];
test("Captain can be appointed from any actor",()=>{
  const game=context.crewPolitics.create(actors);
  assert.equal(game.setCaptain("wyoming.station-master"),true);
  assert.equal(game.state.captain,"wyoming.station-master");
  assert.equal(game.setCaptain("missing"),false);
});
test("Relationships are directional and react to conversations",()=>{
  const game=context.crewPolitics.create(actors);const before=game.relation("crew.pilot","crew.captain");
  game.activity("conversation","crew.pilot");
  assert.equal(game.relation("crew.pilot","crew.captain"),Math.min(100,before+2));
});
test("Political decisions are real and cannot be claimed twice",()=>{
  const game=context.crewPolitics.create(actors);game.seed();
  assert.ok(game.state.events.length>0);
  const event=game.state.events[0];const previous=game.state.authority;
  assert.ok(game.resolve(event.id,event.options[0].id));
  assert.equal(game.state.authority!==previous,true);
  assert.equal(game.resolve(event.id,event.options[0].id),null);
});
test("Resignation replaces captain without ending the campaign",()=>{
  const game=context.crewPolitics.create(actors);
  game.state.authority=0;game.state.crisis=100;
  game.activity("conversation","crew.pilot");
  const event=game.state.events.find(e=>e.kind==="mutiny");
  assert.ok(event);
  game.resolve(event.id,"resign");
  assert.notEqual(game.state.captain,"crew.captain");
  assert.equal(game.state.outcome,"replaced");
});
