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
- A Groq az NPC-k hangját, a rádióüzenetek megfogalmazását és a géptér–labor vita szövegét adja. A küldetések állapota a játék szabályai szerint halad.

`node --test` ellenőrzi a küldetésláncot, a helyszínek elérhetőségét és a Groq kéréseit tesztválaszokkal.
