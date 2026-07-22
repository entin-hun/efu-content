# MEGBÍZÁSI SZERZŐDÉS

**Szerződés száma:** MSZ-2026-0615-01  
**Kelt:** 2026.06.15.  
**Kapcsolódó ajánlat:** AJ-2026-0613-01

Jelen megbízási szerződés létrejött egyrészről az alábbi ajánlatadó / megbízott, másrészről az alábbi megrendelő / megbízó között, az alulírott napon és helyen, az alábbi feltételekkel.

---

## 1. Szerződő felek

### 1.1. Megbízott

**Szimulátor Technika Kft.**  
Székhely: 4400 Nyíregyháza, Eötvös u. 5.  
Adószám: 27310254-2-15  
Képviseli: Konyhás Krisztián ügyvezető

A továbbiakban: **Megbízott**

### 1.2. Megbízó

**Név / cégnév:** ............................................................  
**Székhely / lakcím:** ............................................................  
**Adószám / adóazonosító:** ............................................................  
**Képviselő:** ............................................................  
**E-mail:** ............................................................  
**Telefon:** ............................................................

A továbbiakban: **Megbízó**

Megbízott és Megbízó a továbbiakban együttesen: **Felek**.

---

## 2. A szerződés tárgya

Megbízó megbízza Megbízottat, Megbízott pedig elvállalja egy **MMA tematikájú szezonális élő közvetítési webalkalmazás** fejlesztését, amely alkalmas:

- éles, production környezetben történő működésre,
- valós élő stream kiszolgálására,
- OBS, Restream.io vagy Cloudflare Stream forrásból érkező közvetítés kezelésére,
- Stripe-alapú fizetős hozzáférés előkészítésére és/vagy bekötésére,
- Cloudflare Stream alapú, tokennel védett videóhozzáférés használatára,
- mobilra optimalizált nézői vásárlási és megtekintési folyamat kiszolgálására,
- befektetői, partneri és ügyféloldali bemutatásra.

A rendszer célja, hogy a nézők egy modern, mobilbarát felületen szezonbérletet tudjanak vásárolni, majd jogosultság alapján hozzáférjenek a védett élő vagy visszanézhető videós tartalomhoz.

A fejlesztendő alkalmazás nem pusztán statikus látványterv vagy egyszerű mockup, hanem továbbfejleszthető, production/live stream használatra alkalmas webalkalmazás-struktúra, amely a megfelelő éles szolgáltatói adatok, API kulcsok, stream azonosítók és hozzáférések rendelkezésre állása esetén valós közvetítési működésre állítható.

---

## 3. Fontos pontosítás a demó / mock stream használatáról

Felek rögzítik, hogy a fejlesztés során alkalmazott esetleges **mock stream**, példa videó, demó lejátszó vagy teszt stream kizárólag átmeneti demonstrációs célt szolgál.

Ennek oka, hogy a szerződéskötés időpontjában Megbízó részéről még nem feltétlenül áll rendelkezésre a végleges:

- OBS stream kulcs,
- Restream.io kimeneti adat,
- Cloudflare Stream Live Input ID,
- Cloudflare Stream Video ID,
- Cloudflare customer code,
- signed URL / token signing konfiguráció,
- végleges élő adás URL vagy HLS manifest.

A mock vagy példa stream célja, hogy a rendszer működési logikája, a fizetési folyamat, a jogosultságkezelés és a videólejátszási élmény már a végleges stream adatok átadása előtt is bemutatható legyen.

A végleges stream adatok Megbízó általi átadását követően Megbízott a rendszert a jelen szerződés szerinti keretek között a valós stream forrás használatára konfigurálja.

---

## 4. Fejlesztési tartalom

### 4.1. Felhasználói felület és frontend fejlesztés

Megbízott modern, reszponzív webes felületet készít, amely asztali gépen, laptopon, tableten és mobiltelefonon is megfelelően használható.

A frontend fejlesztés részei:

- magyar nyelvű landing oldal,
- MMA reality show / közvetítési koncepció bemutatása,
- eseményindulási információk és visszaszámláló,
- szezonbérlet értékesítési blokk,
- mobilra optimalizált vásárlási folyamat,
- fizetés utáni visszaigazoló oldal,
- védett „watch” oldal a közvetítéshez,
- ingyenes teaser / előnézeti nézet,
- befektetői bemutatóra alkalmas vizuális megjelenés,
- QR-kódos mobil belépési pont a gyors vásárláshoz.

A felület kialakításánál kiemelt szempont a gyors betöltés, az egyszerű vásárlási útvonal és az, hogy a néző akár TV-n vagy laptopon látott teaser után telefonon, QR-kóddal azonnal a fizetési oldalra jusson.

### 4.2. Fizetési folyamat és Stripe integrációs előkészítés

Megbízott Stripe-alapú fizetési logikára alkalmas rendszert alakít ki.

A fizetési fejlesztési tartalom:

- szezonbérlet terméklogika kialakítása,
- HUF alapú fizetési modell kezelése,
- Stripe Checkout session létrehozásának előkészítése,
- Stripe metadata mezők előkészítése felhasználó- és szezonazonosítóval,
- Apple Pay / Google Pay kompatibilis vásárlási útvonal bemutatása,
- QR-kódos mobil fizetési belépési pont,
- sikeres fizetés utáni jogosultságaktiválási logika,
- fizetési visszaigazoló oldal,
- rendelési azonosító és hozzáférési státusz megjelenítése.

Amennyiben Megbízó átadja az éles Stripe fiókhoz szükséges adatokat és a szolgáltatói beállítások ezt lehetővé teszik, a rendszer éles Stripe működésre konfigurálható.

### 4.3. Jogosultságkezelés és szezonbérlet logika

Megbízott kialakítja a szezonbérlet-alapú hozzáférés logikai struktúráját.

A jogosultsági modell tartalmazza:

- felhasználói státusz kezelését,
- aktív / inaktív bérlet állapot kezelését,
- szezonazonosító szerinti hozzáférést,
- lejárati dátum kezelését,
- fizetés után automatikusan aktiválható hozzáférést,
- jogosulatlan felhasználó átirányítását vásárlási oldalra,
- jogosult felhasználó továbbengedését a közvetítésre,
- stream token lekérési folyamat előkészítését.

A rendszer adatbázissal összeköthető módon készül, például Supabase, PostgreSQL vagy Prisma-alapú backend használatával.

### 4.4. Videós közvetítés és Cloudflare Stream használat

Megbízott a videólejátszási és stream-hozzáférési logikát Cloudflare Stream használatára alkalmas módon alakítja ki.

A videós rész tartalma:

- watch oldal kialakítása,
- Cloudflare Stream Player beépítésére alkalmas lejátszóstruktúra,
- HLS manifest lejátszási lehetőség hls.js alapú mintával,
- valós Cloudflare Stream Live Input vagy Video ID bekötésének előkészítése,
- signed URL / signed token működési logika előkészítése,
- token státusz és lejárati idő megjelenítése,
- jogosulatlan hozzáférés blokkolása,
- stream frissítés / újratöltés utáni hozzáférési logika,
- alapvető hotlinkelés elleni védelem bemutatása.

Éles rendszerben a Cloudflare Stream „Require Signed URLs” funkciója biztosíthatja, hogy a videólink ne legyen szabadon továbbosztható. A backend minden jogosult felhasználónak rövid élettartamú, egyedi stream tokent adhat ki.

### 4.5. Backend API végpontok

Megbízott előkészíti azokat az API végpontokat és működési mintákat, amelyekre az éles rendszer építhető.

Előkészített API funkciók:

#### `/api/checkout`

Stripe Checkout session létrehozásának logikai alapja. A végpont célja, hogy a felhasználó és szezonazonosító alapján fizetési munkamenetet hozzon létre.

#### `/api/webhooks/stripe`

Stripe webhook események feldolgozásának mintája. Kiemelt szerepe van a sikeres fizetések kezelésében, a jogosultságok aktiválásában és a többszöri webhook kézbesítés biztonságos kezelésében.

#### `/api/get-stream-token`

Stream hozzáférési token kiadásának mintája. A végpont ellenőrzi a felhasználó bérletét, majd jogosultság esetén rövid élettartamú Cloudflare Stream tokent ad vissza.

### 4.6. Mobilos vásárlási élmény és QR-kódos checkout

Kiemelt szempont, hogy a nézők gyakran TV-n vagy laptopon látják az előzetest, de telefonon szeretnének gyorsan fizetni.

Ezért a rendszer tartalmaz:

- QR-kódos fizetési belépési pontot,
- mobilra optimalizált checkout képernyőt,
- Apple Pay / Google Pay jellegű gyorsfizetési útvonalat,
- kártyaadat nélküli, egyérintéses fizetési élmény bemutatását,
- sikeres fizetés után QR-kódos „folytatás telefonon” lehetőséget.

---

## 5. Átadandó elemek

Megbízott az alábbiakat adja át Megbízó részére:

- működő webalkalmazás,
- magyar nyelvű felület,
- mobilbarát vásárlási és nézési flow,
- Stripe Checkout integrációra alkalmas fizetési logika,
- Stripe webhook feldolgozásra alkalmas backend minta,
- Cloudflare Stream Player / HLS lejátszásra alkalmas videós oldal,
- production/live stream forrás bekötésére alkalmas konfigurációs struktúra,
- QR-kódos mobil checkout belépési pont,
- jogosultságkezelési logika,
- stream token lekérési logika,
- forráskód,
- rövid technikai átadási ismertető,
- átadási teszt során felmerülő, a vállalt scope-ba tartozó alap hibák javítása.

---

## 6. Megbízó által biztosítandó adatok és hozzáférések

A production/live működéshez Megbízó köteles időben biztosítani a szükséges szolgáltatói adatokat és hozzáféréseket.

Ide tartozhat különösen:

- Stripe fiók hozzáférés vagy API kulcsok,
- Stripe Price ID / Product ID,
- Stripe webhook secret,
- Cloudflare fiókhoz tartozó stream azonosítók,
- Cloudflare Stream Live Input ID vagy Video ID,
- Cloudflare customer code,
- Cloudflare signing key adatok,
- OBS vagy Restream.io stream beállítási adatok,
- domain / tárhely / deployment hozzáférések,
- arculati elemek, logók, szövegek, képek,
- jogi dokumentumok linkjei, amennyiben szükségesek.

Amennyiben a fenti adatok késedelmesen, hiányosan vagy hibásan kerülnek átadásra, az a teljesítési határidőt módosíthatja. Ilyen esetben Megbízott jogosult ideiglenes teszt vagy mock konfigurációval folytatni a fejlesztést, amíg a végleges adatok rendelkezésre nem állnak.

---

## 7. Nem része a jelen szerződésnek

Az alábbi tételek nem képezik jelen szerződés részét, külön megállapodás alapján rendelhetők meg:

- éles Stripe fiók létrehozása vagy pénzügyi adminisztrációja,
- éles Cloudflare Stream előfizetés díja,
- domain, tárhely, szerver vagy külső szolgáltatások díja,
- teljes körű adatbázis- és felhasználókezelő rendszer külön admin felülettel,
- hosszú távú üzemeltetés és monitoring,
- nagy nézőszámra vonatkozó részletes terheléses tesztelés,
- egyedi adminisztrációs felület,
- számlázóprogram-integráció,
- jogi dokumentumok, ÁSZF, adatkezelési tájékoztató elkészítése,
- harmadik fél szolgáltatói díjai,
- fizetési szolgáltatói, streaming szolgáltatói vagy domain szolgáltatói költségek.

---

## 8. Vállalási díj

Felek a jelen szerződés szerinti fejlesztési feladatok vállalási díját az alábbiak szerint határozzák meg:

| Megnevezés | Összeg |
|---|---:|
| Nettó vállalási díj | 300 000 Ft |
| ÁFA (27%) | 81 000 Ft |
| **Bruttó végösszeg** | **381 000 Ft** |

A fenti díj a jelen szerződésben meghatározott fejlesztési tartalomra vonatkozik.

---

## 9. Fizetési ütemezés

### 9.1. Előleg

A projekt megkezdésének feltétele a vállalási díj 50%-ának megfizetése.

| Megnevezés | Összeg |
|---|---:|
| Nettó előleg | 150 000 Ft |
| ÁFA (27%) | 40 500 Ft |
| **Bruttó előleg** | **190 500 Ft** |

**Fizetési határidő:** az előlegszámla kiállításától számított 8 nap.

Megbízott a jelen szerződés aláírását követően jogosult az előlegszámla kiállítására.

### 9.2. Végszámla átadáskor

A fennmaradó 50% az átadáskor esedékes.

| Megnevezés | Összeg |
|---|---:|
| Nettó végszámla | 150 000 Ft |
| ÁFA (27%) | 40 500 Ft |
| **Bruttó végszámla** | **190 500 Ft** |

**Fizetési határidő:** a végszámla kiállításától számított 8 nap.

---

## 10. Teljesítési feltételek

- A fejlesztés az előleg beérkezését követően indul.
- A teljesítés a jelen szerződésben szereplő funkciók elkészítésére vonatkozik.
- A Megbízó által kért, scope-on túli módosítások külön egyeztetés és külön díjazás alapján történnek.
- Az átadás digitális formában történik.
- A rendszer production/live stream használatra alkalmas módon készül, de az éles működés feltétele a szükséges külső szolgáltatói hozzáférések, stream adatok, API kulcsok és konfigurációk Megbízó általi biztosítása.
- Amennyiben a végleges stream forrás vagy szolgáltatói hozzáférés nem áll rendelkezésre, Megbízott jogosult mock vagy teszt streammel bemutatni a működést.

---

## 11. Átadás-átvétel

Megbízott a fejlesztés elkészültét követően átadja Megbízó részére a működő rendszert és a kapcsolódó forráskódot / hozzáférési információkat.

Megbízó az átadást követően köteles a rendszert ésszerű határidőn belül ellenőrizni. Amennyiben Megbízó az átadást követő 5 munkanapon belül írásban nem jelez a vállalt scope-ba tartozó hibát, a teljesítést Felek elfogadottnak tekintik.

A scope-ba tartozó, igazolt hibákat Megbízott javítja. Az új funkciók, tartalmi módosítások vagy eredeti megállapodáson túli igények külön díjazású módosításnak minősülnek.

---

## 12. Szellemi tulajdon és felhasználási jog

A fejlesztés során létrejövő egyedi forráskód és projektanyagok felhasználási joga a teljes vállalási díj megfizetését követően Megbízót illeti meg a jelen projekt céljára.

A fejlesztés során alkalmazott nyílt forráskódú könyvtárak, külső szolgáltatások, API-k, SDK-k és harmadik féltől származó komponensek saját licencfeltételeik szerint használhatók.

Megbízott jogosult a projekt során felhasznált általános fejlesztési módszereket, know-how-t, technikai megoldási mintákat és nem ügyfélspecifikus tapasztalatokat más munkái során is felhasználni.

---

## 13. Titoktartás

Felek vállalják, hogy a teljesítés során egymás tudomására jutott üzleti, technikai, pénzügyi vagy hozzáférési információkat bizalmasan kezelik, és azokat harmadik fél részére csak a másik fél előzetes hozzájárulásával adják át, kivéve, ha azt jogszabály írja elő vagy a teljesítéshez elengedhetetlen szolgáltatói együttműködés indokolja.

---

## 14. Felelősség és külső szolgáltatások

Megbízott a jelen szerződésben meghatározott fejlesztési feladatok szakszerű elvégzéséért felel.

Megbízott nem felel a harmadik fél szolgáltatások, így különösen Stripe, Cloudflare, Restream.io, OBS környezet, domain szolgáltató, tárhelyszolgáltató vagy egyéb külső rendszer hibájáért, leállásáért, díjszabás-változásáért vagy hozzáférési korlátozásáért.

Megbízott nem vállal felelősséget olyan hibáért vagy késedelemért, amely a Megbízó által késedelmesen, hiányosan vagy hibásan átadott adatokból, hozzáférésekből vagy harmadik fél szolgáltatói korlátozásokból ered.

---

## 15. Szerződés módosítása

Jelen szerződés módosítása kizárólag írásban, Felek közös megegyezésével történhet. Írásbeli módosításnak minősül az e-mailben visszaigazolt, egyértelműen azonosítható módosítási igény és annak Megbízott általi elfogadása is.

---

## 16. Záró rendelkezések

Felek kijelentik, hogy a jelen szerződést elolvasták, megértették, és mint akaratukkal mindenben megegyezőt írják alá.

A jelen szerződésben nem szabályozott kérdésekben a magyar jog vonatkozó rendelkezései irányadók.

---

## 17. Aláírások

Kelt: ............................................................

### Megbízó

Név / cégnév: ............................................................  
Képviselő: ............................................................  
Aláírás: ............................................................

### Megbízott

**Szimulátor Technika Kft.**  
Képviseli: Konyhás Krisztián ügyvezető  
Aláírás: ............................................................
