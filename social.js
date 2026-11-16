"use strict";
// Five Percent crew politics: deterministic, offline-capable social simulation.
(function(root) {
  const clamp=(n)=>Math.max(-100,Math.min(100,n));
  const hash=(s)=>[...s].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))|0,17);
  const roles=[
    {key:"safety",test:/safety|medic|life-support|security/i,issue:"safety"},
    {key:"science",test:/scientist|research|navigator|sensor|geolog|archiv/i,issue:"science"},
    {key:"operations",test:/pilot|engineer|technician|cargo|dock|mechanic|robotic/i,issue:"operations"},
    {key:"politics",test:/director|captain|liaison|station-master|officer/i,issue:"authority"},
  ];
  const group=(a)=>roles.find(r=>r.test.test(a.id+" "+a.role))?.key||"general";
  const android=(a)=>/^(android|robot)\./.test(a.id);
  const label=(n)=>n>40?"szövetséges":n>10?"barátságos":n< -35?"ellenséges":n< -10?"bizalmatlan":"semleges";
  function create(actors) {
    const byId=new Map(actors.map(a=>[a.id,a]));
    const crew=actors.filter(a=>a.sheet===0||a.id.startsWith("android."));
    const people=new Map(actors.map(a=>{
      const h=hash(a.id),g=group(a),machine=android(a);
      return [a.id,{id:a.id,group:g,machine,ambition:Math.abs(h%7)+2,integrity:Math.abs((h>>4)%8)+2,
        courage:Math.abs((h>>8)%8)+2,prejudice:machine?"incompetence":Math.abs(h%5)===0?"androids":null,
        morale:50,relations:new Map(),memories:[]}];
    }));
    for(const a of actors) for(const b of actors) {
      if(a.id===b.id)continue;
      // Sparse directional network. Crew members have more shipboard contacts.
      const h=Math.abs(hash(a.id+"|"+b.id));
      if(h%7>=(a.sheet===0&&b.sheet===0?5:2))continue;
      let score=(h%49)-24;
      if(group(a)===group(b))score+=13;
      if((android(a)||android(b))&&android(a)!==android(b)&&people.get(a.id).prejudice==="androids")score-=25;
      people.get(a.id).relations.set(b.id,clamp(score));
    }
    const s={byId,people,crew:crew.map(a=>a.id),captain:"crew.captain",turn:0,events:[],history:[],authority:55,crisis:0,outcome:"active",lastMessage:""};
    const relation=(from,to)=>s.people.get(from)?.relations.get(to)??0;
    const change=(from,to,delta)=>{const p=s.people.get(from);if(!p||!s.people.has(to)||from===to)return;
      p.relations.set(to,clamp(relation(from,to)+delta));};
    const remember=(id,text)=>{const p=s.people.get(id);if(!p)return;p.memories.push(text);if(p.memories.length>5)p.memories.shift();};
    const eligible=()=>s.crew.filter(id=>id!==s.captain);
    const supporters=()=>eligible().filter(id=>relation(id,s.captain)>15).length;
    const opponents=()=>eligible().filter(id=>relation(id,s.captain)<-25).length;
    const pressure=()=>Math.round(Math.max(0,Math.min(100,50-s.authority+s.crisis/2+opponents()*2-supporters())));
    const write=(text)=>{s.lastMessage=text;s.history.unshift(text);s.history.length=20;};
    const setCaptain=(id)=>{if(!s.people.has(id))return false;s.captain=id;s.authority=55;s.crisis=0;s.outcome="active";s.events.length=0;
      write(byId.get(id).name+" kapta a kapitányi kinevezést. Nem mindenki fogadta örömmel.");return true;};
    const enqueue=(id,kind,title,text,options)=>{
      if(s.events.some(e=>e.actorId===id))return;
      s.events.push({id:"social-"+(++s.turn),actorId:id,kind,title,text,options});
    };
    function seed() {
      const possible=eligible();
      const rival=possible.slice().sort((a,b)=>(s.people.get(b).ambition-relation(b,s.captain)/12)-(s.people.get(a).ambition-relation(a,s.captain)/12))[0];
      const dissenter=possible.filter(id=>id!==rival).sort((a,b)=>relation(a,s.captain)-relation(b,s.captain))[0];
      if(rival)enqueue(rival,"rivalry","A kinevezés árnyéka","Úgy hallom, a vezetői posztra más is készült. Nem mindenki örül a döntésnek.",[
        {id:"listen",label:"Hallgasd meg az érveit",trust:9,authority:2},
        {id:"confront",label:"Kérd számon a szervezkedést",trust:-15,authority:5},
        {id:"ignore",label:"Ne foglalkozz vele",trust:-7,authority:-4},
      ]);
      if(dissenter)enqueue(dissenter,"dissent","Szakmai kifogás","A döntéseinkről néhányan azt mondják, túl nagy kockázatot vállalunk. Van, aki joggal aggódik.",[
        {id:"review",label:"Kérj közös szakmai felülvizsgálatot",trust:12,authority:7},
        {id:"order",label:"Tarts ki a parancs mellett",trust:-10,authority:-3},
      ]);
    }
    function decide(eventId,optionId) {
      const i=s.events.findIndex(e=>e.id===eventId);if(i<0)return null;
      const e=s.events[i],opt=e.options.find(o=>o.id===optionId);if(!opt)return null;
      s.events.splice(i,1);change(e.actorId,s.captain,opt.trust);
      s.authority=Math.max(0,Math.min(100,s.authority+opt.authority));
      s.crisis=Math.max(0,Math.min(100,s.crisis+(opt.trust<0?7:-4)));
      const text=byId.get(e.actorId).name+": "+opt.label+". A fedélzeti viszonyok változtak.";
      remember(e.actorId,text);write(text);check();
      return text;
    }
    function check() {
      const p=pressure();
      if(p>=85&&s.outcome==="active"){
        s.outcome="challenge";
        const leader=eligible().slice().sort((a,b)=>relation(a,s.captain)-relation(b,s.captain))[0];
        if(leader){s.events=s.events.filter(e=>e.actorId!==leader);enqueue(leader,"mutiny","Bizalmatlansági indítvány","A legénység egy része új kapitányt akar. A döntés nem kerülhető el.",[
          {id:"vote",label:"Tarts nyílt bizalmi szavazást",trust:10,authority:8},
          {id:"resign",label:"Add át a parancsnokságot",trust:5,authority:-15},
          {id:"defend",label:"Bizonyítsd az alkalmasságodat",trust:4,authority:4},
        ]);}
      }
    }
    function activity(kind="conversation",id) {
      if(!s.people.has(id)||id===s.captain)return;
      const p=s.people.get(id);
      if(kind==="conversation")change(id,s.captain,2);
      if(kind==="decision"){
        const delta=(p.group==="safety"?-5:p.group==="operations"?3:0)+(p.integrity>6?2:-1);
        change(id,s.captain,delta);s.authority=Math.max(0,Math.min(100,s.authority+Math.sign(delta)));
        s.crisis=Math.min(100,s.crisis+2);
      }
      s.turn++;
      if(s.turn%5===0&&s.events.length<4) {
        const pool=eligible().filter(x=>!s.events.some(e=>e.actorId===x));
        const target=pool[Math.abs(hash(String(s.turn)+s.captain))%pool.length];
        if(target){
          const discontent=relation(target,s.captain)<-15;
          enqueue(target,discontent?"rumor":"support",discontent?"Folyosói pletyka":"Váratlan szövetséges",
            discontent?"Többen úgy érzik, hogy a vezetőség nem hallgat rájuk. Beszélhetnénk erről?":"Nem mindig értünk egyet, de láttam, hogy próbálod egyben tartani a legénységet.",
            discontent?[{id:"listen",label:"Hallgasd végig",trust:11,authority:3},{id:"dismiss",label:"Utasítsd rendre",trust:-12,authority:-4}]:
              [{id:"thanks",label:"Köszönd meg a támogatást",trust:7,authority:2},{id:"task",label:"Bízz rá felelősséget",trust:10,authority:4}]);
        }
      }
      check();
    }
    function outcomeAfter(eventId,optionId,oldCaptain) {
      if(optionId==="resign"&&s.outcome==="challenge"){
        const next=eligible().slice().sort((a,b)=>relation(a,oldCaptain)-relation(b,oldCaptain))[0];
        if(next){setCaptain(next);s.outcome="replaced";write("A kapitányt leváltották. "+byId.get(next).name+" átvette a parancsnokságot. A küldetés folytatódik.");}
      } else if(s.outcome==="challenge"&&optionId==="vote"){
        if(s.authority+supporters()*3<45){
          const next=eligible().sort((a,b)=>relation(a,oldCaptain)-relation(b,oldCaptain))[0];
          if(next){setCaptain(next);s.outcome="replaced";write("A bizalmi szavazáson megbukott a kapitány. "+byId.get(next).name+" az új parancsnok.");}
        } else {s.outcome="active";s.crisis=35;write("A legénység szavazott: a kapitány egyelőre megtartotta a posztját.");}
      } else if(s.outcome==="challenge"&&optionId==="defend"){s.outcome="active";s.crisis=30;write("A kapitány haladékot kapott, hogy bizonyítsa alkalmasságát.");}
    }
    function resolve(id,choice){const e=s.events.find(x=>x.id===id);if(!e)return null;const old=s.captain;
      const text=decide(id,choice);if(e.kind==="mutiny")outcomeAfter(id,choice,old);return text;}
    const context=(actorId)=>({captain:byId.get(s.captain)?.name,authority:s.authority,pressure:pressure(),
      relationship:label(relation(actorId,s.captain)),rumors:s.history.slice(0,3),memories:s.people.get(actorId)?.memories.slice(-2)||[]});
    return {state:s,relation,change,label,setCaptain,seed,activity,resolve,pressure,supporters,opponents,context,remember};
  }
  root.crewPolitics={create};
})(typeof globalThis!=="undefined"?globalThis:this);
