# Five Percent · Quest próba

Magyar nyelvű, kétdimenziós Five Percent prototípus. A Wyoming állomás és a 7-es Kvadráns kockáspapíros alaprajzain a négy karakterlap 64 szereplőjével találkozhatsz elosztva. Az indulásnál 1–3 figura választható.

## Indítás

Kulcs nélküli játékhoz önmagában is megnyitható az `index.html`. Node.js és egy Groq-kulcs kell az élő párbeszédhez:

1. Másold az `ai-config.example.txt`-t `ai-config.txt` néven, és töltsd ki a `GROQ_API_KEY=` sort. A kulcsot a [Groq Console](https://console.groq.com/keys) oldalán tudod létrehozni. A szerver a `GROQ_API_KEY` környezeti változót is elfogadja.
2. A repó mappájában futtasd a `node server.mjs` parancsot.
3. Nyisd meg a [http://127.0.0.1:4173](http://127.0.0.1:4173) címet.

A helyi szerverhez nincs telepítendő csomag. A kulcsot az `ai-config.txt` fájlban tartsd, az nincs verziókezelésben és a szerver sem szolgálja ki. A Groq az `openai/gpt-oss-120b` modellt futtatja. A fejléc a beállított kulcsot külön jelzi, és sikeres modellválasz után zöld **Aktív** jelzésre vált. A válasznál és a rádióüzenetnél is látszik a modell forrása. Kulcs vagy elérhető modell nélkül az előre megírt magyar válaszok működnek.

## Vercel

Importáld ezt a repót a Vercelbe. A gyökérmappában lévő `vercel.json` kiválasztja az **Other** presetet, és beállítja a buildet, a `dist` mappát és az `/api/dialogue` Node.js végpontot.

A Vercel projekt **Settings → Environment Variables** részében add hozzá a `GROQ_API_KEY` kulcsot a **Production** környezethez. Jelöld be a **Preview** környezetet is, ha előnézetben is kérsz AI-válaszokat. A beállítás a következő deploymentre érvényes. A helyi `ai-config.txt` kizárólag a helyi szerver beállítása.

## Játék

- WASD, nyilak vagy kattintás. Lépj neki egy szereplőnek a beszélgetéshez. Az 1–3 billentyű vált a kiválasztott figurák között.
- A sárga **?** jelzi az aktuális küldetésadót. Az eligazítás, a biztonsági egyeztetés és a rakományellenőrzés után megnyílik a beszálló. Kövesd a küldetésnaplót.
- A géptéri hajtáspróba után lépj a híd **parancsnoki állására**. A felszállást és a csillagközi utat rövid 2D repülési szimuláció mutatja. Menet közben a hajón maradsz.
- A próbakör, az energiaelosztási vita, a Ross 128 b felmérése, a jelentés időzítéséről szóló vita és a földi adás egy végigjátszható menetet alkot. A két döntésed változtat a későbbi rádió- és beszélgetési kontextuson. Felszállás után az UP munkatársai és a legénység földi utasításokat kapnak a **Fedélzeti rádióban**, nagyjából percenként és megérkezéskor, amíg aktív a játékoldal.
- A földi jelentés után a fedélzeti ügyek folytatódnak. A játék a [70 sci-fi konfliktusból](conflicts.md) mind a hetvenet sorra veszi véletlen sorrendben, mielőtt egyet újra elővenne. Három lezárt ügy után a parancsnoki állásról indítható a visszaút a Wyomingra. A dokkolás után add le a döntéseket, szállj vissza a hajóra, és a hídról indítsd el a következő felderítési kört.
- A Groq a fedélzeti ügyek eligazítását, az NPC-k válaszait és a döntések rádióban megjelenő következményét a legutóbbi beszélgetésekhez és döntésekhez igazítja. Ha a Groq nem érhető el, a dilemma, a két választható döntés és a kampány továbbra is működik. Az állás a megnyitott játékmenethez tartozik.

`node --test` ellenőrzi a küldetésláncot, a helyszínek elérhetőségét és a Groq kéréseit tesztválaszokkal.

## Fedélzeti politika (crew politics)

A kapitány kijelölésekor a 64 karakter bármelyike választható. A választott kapitány automatikusan az 1–3 irányítható szereplő egyike lesz. A fő küldetés kérdőjelei (`?`) mellett rózsaszín felkiáltójelek (`!`) mutatják a kapcsolati eseményeket.

- Irányított, részben hiányos kapcsolati háló: a bizalom nem kölcsönös és nem minden szereplő ismer mindenkit.
- Szakmai nézeteltérések, rivalizálás, támogatás, pletykák; választható, tényleges következményekkel.
- Tekintély és bizalmatlanság kijelző. Súlyos konfliktusból bizalmi szavazás, lemondás vagy alkalmassági próba lehet.
- Leváltás után nem ér véget a játék: a következő kapitány átveszi a posztot, a korábbi szereplő továbbra is irányítható.
- Mindez Groq nélkül is működik. A generált párbeszéd megkapja a hiteles társasági állapotot, de nem módosíthatja tetszőlegesen a kapcsolatokat.

A rendszer jelenleg egy játékmeneten belül tárolja a társasági állapotot, nem perzisztens. A politikai események a meglévő kampány mellett futnak, nem cserélik le annak 70 konfliktusát. Ellenőrzés: `node --test`.

## Felület

A beszélgetések kizárólag szabad szövegesek: nincs előre megadott témagombsor. A fedélzeti politika panel névvel és helyszínnel jelzi a nyitott `!` eseményeket; a jel csak az adott szereplő térképén jelenik meg. A program saját `favicon.svg` ikont használ.

## Verziózás

A Five Percent Quest a 3Draft dátumalapú formátumát követi: `YY.M.DNNN` (például `26.11.16003` = 2026. november 16., 003. build). Az olvasható alak `26.11.16.003`. A verzió a `package.json` és `version.js` fájlban szerepel, a képernyő alján is látszik.

Új buildhez: `npm run bump`. Csak előnézet: `npm run bump:dry`. A napot a `Europe/Budapest` időzóna alapján számolja. A fejlesztés alapértelmezett célága: `main`.

## Rögzített játéktér és helyszínkártyák (26.11.16004)

A Wyoming és a 7-es Kvadráns térképe nem görgethető: a teljes 20×12-es alaprajz mindig a rendelkezésre álló játéktérbe illeszkedik. A jobb oldali szereplő- és párbeszédpanel külön görgethető. A felső sáv két képes helyszínkártyája közti vonal jelzi a dokkolt (de zárt), a szabad átjárású és a levált állapotot; a jelző a meglévő küldetés és áthaladási állapotból számolódik.
