import assert from "node:assert/strict";
import {test} from "node:test";
import {actors} from "../lib/actors.mjs";
import {createDialogue, MODEL} from "../lib/dialogue.mjs";

const url="http://127.0.0.1:4173/api/dialogue";
const npc={actorId:"up.snp-physicist",playerId:"crew.pilot",location:"ship",room:"GÉPTÉR",stage:"survey",message:"Mit mértél?"};
const post=(handler,body,headers={})=>handler(new Request(url,{method:"POST",headers:{"Content-Type":"application/json",...headers},body:JSON.stringify(body)}));

test("offline mode, invalid input and mismatched origin make no model request",async()=>{
  const fail=()=>assert.fail("No upstream call expected");
  const off=createDialogue(actors,"",fail), on=createDialogue(actors,"test",fail);
  assert.deepEqual(await (await off(new Request(url))).json(),{providers:[]});
  assert.deepEqual(await (await on(new Request(url))).json(),{providers:["gpt-oss"]});
  assert.equal((await post(off,npc)).status,503);
  assert.equal((await post(on,{...npc,room:"ismeretlen"})).status,400);
  assert.equal((await post(on,npc,{Origin:"https://another.example"})).status,403);
});

test("NPC, Earth and conflict use only Groq and include the correct Hungarian context",async()=>{
  const bodies=[];
  const handler=createDialogue(actors,"test-key",async(address,options)=>{
    assert.equal(address,"https://api.groq.com/openai/v1/responses");
    assert.equal(options.headers.authorization,"Bearer test-key");
    const body=JSON.parse(options.body);
    assert.equal(body.model,MODEL);
    assert.equal(body.store,false);
    bodies.push(body);
    const answer=body.instructions.includes('"Géptér:"')?"Géptér: Hűtsünk.\nUP Labor: Mérjünk.":
      body.instructions.includes('"Híd:"')?"Híd: Küldjük.\nUP adatelemzés: Mérjük újra.":"Magyar tesztválasz.";
    return Response.json({status:"completed",output:[{type:"message",content:[{type:"output_text",text:answer}]}]});
  });
  const contents=[
    {...npc,history:[{role:"actor",text:"Két jelet mértem."}],order:"Az értékeket a Föld kéri."},
    {kind:"ground",actorId:npc.actorId,directive:0,stage:"survey",choice:"lab"},
    {kind:"conflict",stage:"conflict"},
    {kind:"conflict",stage:"report-conflict",choice:"lab"},
  ];
  const replies=["Magyar tesztválasz.","Magyar tesztválasz.","Géptér: Hűtsünk.\nUP Labor: Mérjünk.","Híd: Küldjük.\nUP adatelemzés: Mérjük újra."];
  for(const [i,body] of contents.entries())assert.deepEqual(await (await post(handler,body)).json(),{reply:replies[i],model:MODEL});
  assert.match(bodies[0].instructions,/SNP-fizikus/);
  assert.match(bodies[0].input,/Két jelet mértem/);
  assert.match(bodies[0].input,/Az értékeket a Föld kéri/);
  assert.match(bodies[1].input,/az UP Labor kapott elsőbbséget/i);
  assert.match(bodies[1].input,/két független SNP-olvasás/);
  assert.match(bodies[2].instructions,/Géptér:.*UP Labor:/s);
  assert.match(bodies[3].instructions,/Híd:.*UP adatelemzés:/s);
});

test("failed Groq requests signal fallback",async()=>{
  const handler=createDialogue(actors,"test",async()=>new Response(null,{status:503}));
  assert.equal((await post(handler,npc)).status,502);
});

test("Vercel uses the Groq runtime environment for the same public API",async(t)=>{
  const {default:vercel}=await import("../api/dialogue.mjs");
  const previous=process.env.GROQ_API_KEY;
  t.after(()=>{
    if(previous===undefined)delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY=previous;
  });
  delete process.env.GROQ_API_KEY;
  const publicUrl="https://five-p-quest.example.vercel.app/api/dialogue";
  assert.deepEqual(await (await vercel.fetch(new Request(publicUrl))).json(),{providers:[]});
  process.env.GROQ_API_KEY=" vercel-test-key ";
  assert.deepEqual(await (await vercel.fetch(new Request(publicUrl))).json(),{providers:["gpt-oss"]});
  t.mock.method(globalThis,"fetch",async(_url,config)=>{
    assert.equal(config.headers.authorization,"Bearer vercel-test-key");
    return Response.json({status:"completed",output:[{type:"message",content:[{type:"output_text",text:"Mérési adatok rendben."}]}]});
  });
  const response=await vercel.fetch(new Request(publicUrl,{
    method:"POST",
    headers:{"Content-Type":"application/json",Origin:new URL(publicUrl).origin},
    body:JSON.stringify(npc),
  }));
  assert.deepEqual(await response.json(),{reply:"Mérési adatok rendben.",model:MODEL});
});
