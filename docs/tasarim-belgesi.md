# Minigolf · Tasarım belgesi

> **TASLAK.** Bu belge oyunun tek kaynağıdır. "Karar (Kemal, tarih)" yazanlar Kemal'in verdiği
> kararlardır; "Öneri" yazan her şey seçenektir, Kemal onaylamadı. Karar değişirse önce bu belge,
> sonra kod değişir. Ad, slogan, kurgu metni yok.

**Proje:** Minigolf (Kems Company). Çalışma adı: depo "minigolf", KKM'de "Mini Golf Duzada"
(Kemal'in yazdığı hâliyle; oyun içinde ve belgelerde yazım Düzada). Yayın adı: [Kemal].
**Depo:** `hkemal94/minigolf` · **Yol haritası:** `docs/yol-haritasi.md` · **Delik şeması:**
`docs/plan/stadyum-delik-plani.svg` (öneri; önizlemesi `docs/plan/plan-onizleme.png`, 4. bölümde).
**Ekran maketleri:** `docs/ekranlar/` (öneri; 11. bölüm).
**Yazan:** Oyun Tasarımcısı (Kems Ajans). Fikir belgesi 15 Kasım 2026; bu sürüm 16 Kasım 2026.
Onay Kemal'in.

**Okuma kuralı:** "[Kemal]" Kemal'in dolduracağı boş alandır. Delik ölçüsü, vuruş sınırı, süre, hız,
fiyat, reklam sıklığı gibi sayılar yazılmaz ("veri yok"). Denemek için konan onaysız değer "DENEME"
diye işaretlenir; bulunduğu yer web denemesidir, onaylayan Kemal'dir.

**Kaynaklar:** Kems Ajans `oneriler/minigolf-fikir-belgesi-15-11-2026.md` (Kemal'in 15 ve 16 Kasım
cevapları işli), Kemal'in 16 Kasım Stadyum soru turu cevapları ve plan üzerine verdiği 8 cevap (16 Kasım, kesin). Düzada bilgisi yalnız KKM'deki
`docs/03-duzada-kunyesi.md`'den. Stat kompleksinin yerleşimi Kemal'in beğendiği 3B Dirlik Stadı
modelinden (Kems Ajans `assetler/3b/binalar/dirlik-stadi.glb`, önizleme `dirlik-stadi-onizleme.jpg`).

**İlham:**
- 3B modelin önizlemesinden: bütün yerleşim alındı (saha, iki tribün, taş duvar, duvar içi toprak
  yol, ışık direkleri, kulüp binası, bayrak direği). Deliklerin yeri buna göre.
- Vikideki suluboya çizimden (KKM `public/viki/cizim-dirlik-stadi.jpg`): statın zeytinlik içinde,
  yukarıda durduğu ve denizin yalnız ufukta göründüğü hava alındı. Çizimde iki tribün aynı kenarda;
  plan 3B modele göre yapıldı, çizime göre değil.
- `assetler/ilham/stadyum/stadyum-01.jpg`'den: sahayı saran toprak yol ve sahanın kenarındaki alçak
  taş yapı fikri alındı (tribün altındaki soyunma odası fikri buradan; yeri Kemal'in 16 Kasım kararı). Görseldeki plaj ve birahane bu
  turda yok.
- Pinterest ve Behance'e bakılmadı. Bu belge oynanış ve yerleşim belgesi; görsel dil İllüstratör'ün işi (5. bölüm).

## Kararların geçmişi

En yeni üstte.

- **16 Kasım (Kemal'in plan cevapları, kesin):**
  1. Tünel ve soyunma odası (duşlarıyla) kapalı tribünün altında; tünel oradan sahaya açılır.
     Modelde yok, eklenecek; yeri karar (4.2, 4.5).
  2. Köşedeki kiremit çatılı yapı **kulüp binası**dır (Dirlik Spor Kulübü'nün binası; ad yok).
     10. delik kulüp binasının önünde ve saçağının altında (4.2, 4.5).
  3. 3B Dirlik Stadı modeli oyunda kullanılır (Kems Ajans yaptı; `docs/lisanslar.md`).
  4. Tribün sıraları, köprü, duşlar engel olarak kullanılır (3.2).
  5. Tur orta yuvarlakta başlar ve orada biter (4.3).
  6. Geri alınan vuruşun sayıdan düşüp düşmeyeceği denemeden sonra; o zamana kadar DENEME (2. bölüm).
  7. Oyuncu görünmez; ekranda yalnız top ve pist (1.3).
  8. Stadyum turu şimdilik **Ocak 2027**'nin ayın turu. İleride Ocak'a başka bir şey alınırsa Mart'a
     kayabilir (9. bölüm).
- **16 Kasım (Kemal: "ekranları önden görmek istiyorum"):** oyun yapılmadan önce ekranların maketi
  hazırlanır. Maketler öneridir, oynanış değildir (11. bölüm).
- **16 Kasım (Stadyum soru turu, kesin):** Turlar lokasyona göre, her tur 18 delik. İlk tur yalnız
  stat kompleksi. Her statta olan genel eşya ve bölümler kullanılabilir, ad yok. Pist gerçek
  minigolf pisti. Bütün engel türleri var, hareketliler en son. Zorluk dalgalı. Tur süresi, ortam ve
  görsel dil önerilenle. "Top dışarı kaçarsa" açık, DENEME.
- **16 Kasım:** Bütün ada değil; önce basit bir yer (Stadyum). Plan çizilir, delik delik denenir.
  Imperial'deki uzun tur sonra. Ayın görevi: ayın turunu bitirmek; takvim ayı; geçen ayın turu
  sonradan bitirilebilir.
- **15 Kasım:** Fikir belgesinin 7 sorusu cevaplandı (kamera, ekran yönü, Düzada bağı, vuruş
  sınırı, delikler, yardımcılar, para modeli). Ödül: ortak pul koleksiyonu.

## 1. Öz ve oyuncu

### 1.1 Oyun bir cümlede

Düzada'nın yerlerine kurulmuş gerçek minigolf pistlerinde, topu tek parmakla çekip bırakarak deliğe
sokulan, sakin ve cezasız bir telefon minigolf oyunu.

**Karar (Kemal, 15 Kasım):** telefon önce, dikey, tek elle. Web deneme sürümü önce, telefon
uygulaması sonra.

### 1.2 Ruhu

**Karar (Kemal, 15 Kasım):** turlar Düzada'nın yerlerinde geçer; oyuncu bir yerin farklı
bölümlerinde adım adım ilerler, sanki oralara gerçek minigolf parkurları kurulmuş gibi.

**Öneri:**
- Sakin ve cezasız: süre yok, kaybetme yok, "oyun bitti" yok. Vuruş yalnız sayılır.
- Her delik küçük bir bulmaca: açıyı ve gücü oyuncu kendi hızında dener.
- Ödülün yarısı yerin kendisi: oyuncu adanın bir köşesini maket gibi gezer. Delik ne kadar yerin
  eşyasıyla kurulursa o kadar "Düzada"dır.
- Ekran dolu ve kompakt: boş delik kalmaz, ekrana yayılmaz (öbür oyunlardan taşınan tercih).

### 1.3 Oyuncu

**Karar (Kemal, 16 Kasım)**: oyuncu görünmez; ekranda yalnız top ve pist (yer, pistin çevresinde dekor). Oyuncunun bir
karakteri, adı, yüzü yok.

## 2. Oynanış: kamera ve kontrol

**Karar (Kemal, 15 Kasım):**
- Kamera eğik yukarıdan 3B (izometrik); **her delik tek ekranda**.
- Ekran **dikey**, oyun **tek elle** oynanır.
- Yardımcılar: **nişan çizgisi**, **geri al vuruş**, **kaldığı yerden devam**.
- Delik başına vuruş sınırı: sonra; web denemesinden sonra Kemal karar verir.

**Öneri:**
- **Çek-bırak vuruş:** oyuncu topa dokunur, başparmağını geri çeker (ne kadar çekerse o kadar
  güçlü), bırakınca top atılır. Çekerken topun önünde ince bir nişan çizgisi çıkar. Güç-çekme oranı DENEME.
- Nişan çizgisi yalnız yönü gösterir; sekmeyi gösterip göstermeyeceği DENEME (yardımın boyu Kemal'in).
- **Geri al:** son vuruştan önceki yere döner. Vuruş sayısından düşüp düşmeyeceği: DENEME; **Karar (Kemal, 16 Kasım)**,
  karar denemeden sonra.
- **Kaldığı yerden devam:** oyun kapanınca tur ve delik hatırlanır; açılınca aynı delikte, aynı vuruş sayısıyla.
- **Kamera:** sabit açı; iki parmakla döndürme ve yakınlaştırma (tek elle oynamak gerekmez, isteğe bağlı).
- **Top dışarı kaçarsa** (pistten, köprüden, suya): vuruştan önceki yere döner, o vuruş sayılır, ek ceza yok.
  Durum: açık, DENEME (Kemal, 16 Kasım).
- **Delik sonu:** kısa sonuç (vuruş sayısı), "sonraki delik" ve "yeniden".
- **Tur sonu:** 18 deliğin vuruşları; ceza yok, "kaybettin" yok.

## 3. Turlar, delikler, engeller, zorluk

### 3.1 Tur ve delik düzeni

**Karar (Kemal, 16 Kasım):**
- Turlar mahalleye göre değil **lokasyona** göre. Her lokasyon bir tur, **her tur 18 delik**. Aynı
  mahallede başka bir lokasyon ayrı bir 18 delikli tur olabilir.
- **İlk tur yalnız stat kompleksi** (Dirlik Stadı). Birahane, plaj, zeytinlik, sokak bu turda yok.
  **Karar (Kemal, 16 Kasım)**: statın köşesindeki kiremit çatılı yapı kulüp binasıdır; tur yalnız önünden ve saçağının
  altından geçer (10. delik), içine girmez.
- Pist gerçek bir minigolf pistidir; yerin eşyası pistin çevresinde ve engel olarak durur.
- Künyede ayrıca yazmayan ama **her statta olan genel eşya ve bölümler** kullanılabilir (kale, köşe
  bayrağı, tünel, soyunma odası, tribün sıraları gibi). Ad yok.
- Ortam: maç olmayan, sakin bir gün.
- Imperial'deki uzun tur sonra; otelin planları (The Imperial Kemskoy deposu ve künye; otel 1954
  yapımı) kullanılır, plan dışı yer uydurulmaz.

**Öneri:**
- **Tur süresi:** 18 kısa delik; her delik tek ekranda biter. Turun toplam süresi DENEME. Tek oturuşta
  bitebilsin; yarıda bırakılırsa kaldığı yerden devam.
- **Tur başında ve sonunda** turun kuşbakışı planı görünür (18 deliğin yeri; Stadyum için şemadaki gibi).
- **Sonraki tur adayları** (yalnız künyede adı ya da tarifi geçen yerler; her biri ayrı 18 delik):
  Deniz Feneri ve Fener Burnu; Liman ve mendirek; Dondurmacı Kızlar; The Imperial Kemsköy ve Sahil
  Merdiveni (uzun tur); Kemsköy Caddesi; Sade Meyhane; Merkez Meydanı; Küçükçetmi Çiftliği; Kuzey Plajı
  ve Taraftar Birahanesi; Ada Tepesi (antik duvarlar Kemal'e sorulmadan kullanılmaz); Sahil Yolu.
  Kullanılmaması önerilen: ibadet ve mezar yerleri. Sırası [Kemal].
- Her yerin planından önce künyede ve vikide yeri, rakımı, çevresi yeniden okunur; varsa ortak 3B model temel alınır.

### 3.2 Engeller

**Karar (Kemal, 16 Kasım):** engellerin hepsi var: yerin eşyaları; klasik engeller (tünel, rampa,
köprü); su ve kum tuzakları; hareketli engeller. **Hareketli engeller en son deliklerde.**

**Karar (Kemal, 16 Kasım)**: tribün sıraları, köprü ve duşlar engel olarak kullanılır; statın genel eşyası yalnız
çevrede durmaz, engel de olur.

**Öneri:**
- **Yerin eşyası önce gelir.** Bir delikte engel gerekiyorsa önce o yerde zaten olan şeye bakılır
  (direk, sıra, basamak, duvar); klasik engel ancak yerin eşyası yetmezse.
- **Bir delik, bir yeni şey.** Yeni engel türü bir delikte tek başına tanıtılır; sonraki deliklerde
  öncekilerle karışır.
- **Klasik engeller yerin kılığına girer:** rampa tribün önünde, köprü koridorun üstünde, tünel oyuncu
  tünelinde. Yel değirmeni gibi yere yabancı süs yok.
- **Su ve kum:** kum topu yavaşlatır; su "dışarı kaçma" sayılır (2. bölüm, DENEME).
- **Hareketli engeller** (açılıp kapanan kapı, kayan blok, dönen kol): yavaş, düzenli, tahmin
  edilir; oyuncu bekleyip zamanlayabilir. Hızlar DENEME.
- Engeller basit biçimli: top ayaklara, ince parçalara takılmaz.

### 3.3 Zorluk eğrisi

**Karar (Kemal, 16 Kasım):** zorluk delikten deliğe ve turdan tura **değişken**; düz artmaz.

**Öneri:**
- **Dalga:** iki-üç delik zorlaşır, ardından bir **nefes deliği** gelir (kısa, kolay, yeni şey
  öğretmez; tek vuruşla bitme sevinci). Turun sonu en zor; final turun başladığı yere döner.
- **Zorluğu artıranlar:** dar geçit, sekme gereği, eğim ve basamak, tuzak, birden çok engel,
  zamanlama. Zorluğu azaltanlar: geniş pist, kısa mesafe, tek engel.
- **Turdan tura:** her tur kendi dalgasını taşır; ikinci tur birincinin sonundan başlamaz. Bir tur
  baştan sona "daha kolay" ya da "daha zor" olabilir (ör. Stadyum yumuşak bir ilk tur, Imperial uzun
  ve zor bir tur). Turların zorluk sırası [Kemal].
- Zorluk kelimeyle yazılır (en kolay, kolay, orta, zor, en zor); "par" ya da sayı yok, denemeden sonra Kemal.
- Stadyum turunun dalgası 4.4'te.

## 4. Stadyum turu (Dirlik Stadı, 18 delik)

### 4.1 Yer (künye)

- **Dirlik Stadı:** künye "Ada hayatı · 2" (iki tribünlü), "Ada hayatı · 3" (1980'ler; devlet yaptı,
  eski toprak sahanın yerine). Yukarıda, denize yakın değil; deniz en çok ufukta görünür (Kems Ajans
  ortak kuralları, "Dirlik Stadı'nın yeri"). Haritada `bina_stad_tribun`.
- **Stadyum Mahallesi:** künye "Mahalleler", "Ada hayatı · 4". Bu turda yalnız statın içi.
- Bu turda deniz, kıyı ve plaj yok. Deniz yalnız arka planda, ufukta.

### Delik şeması (4. bölümün eki)

Kuşbakışı düzen ve 18 deliğin kartları (öneri, ölçeksiz; ad ve sayı yok). Asıl dosya
`plan/stadyum-delik-plani.svg`, aşağıdaki önizlemesi `plan/plan-onizleme.png`.

![Stadyum turu delik planı (öneri)](plan/plan-onizleme.png)

### 4.2 Temel: 3B model

**Öneri:** tur, Kemal'in beğendiği 3B Dirlik Stadı modelinin üstüne kurulur; delikler modelin gerçek
parçalarına oturur. Modelin önizlemesinde görülenler:

- **Çim saha:** dikdörtgen; orta yuvarlak, orta çizgi, iki ceza sahası, iki kale.
- **Kapalı tribün:** bir uzun kenarda, kiremit renkli çatılı; altında kapalı bir hacim (tribün altı),
  çatıyı taşıyan direkler.
- **Açık tribün:** karşı uzun kenarda, çatısız, birkaç sıra.
- **Taş duvar:** bütün kompleksi saran alçak duvar.
- **Duvar içi toprak yol:** duvarla saha arasında, sahayı saran koridor.
- **Işık direkleri:** önizlemede iki çapraz köşede görünüyor (öbür iki köşe önizlemede yok ya da görünmüyor).
- **Kulüp binası:** sahanın bir kısa ucunda, açık tribün tarafına yakın, kiremit çatılı küçük yapı.
  **Karar (Kemal, 16 Kasım)**: Dirlik Spor Kulübü'nün binası; ad yok.
- **Bayrak direği:** kompleksin bir köşesinde, duvarın dibinde.
- **Ağaçlar:** duvarın dışında, bir kısa uçta (dekor; pist yok).

Bu belgede uçlar şöyle anılır: **A ucu** = duvar dışında ağaçların olduğu kısa uç; **B ucu** = köşe
binasının olduğu kısa uç. Kapalı tribün A ucuna yakın durur; açık tribün ortaya ve B ucuna yakın.
Kanonda yön (kuzey, güney) yok; ad yok.

**Modelde olmayanlar (eklenecek):**
- **Soyunma odası (duşlarıyla):** **Karar (Kemal, 16 Kasım)**: kapalı tribünün altındaki kapalı hacmin içinde.
- **Oyuncu tüneli:** **Karar (Kemal, 16 Kasım)**: soyunma odasından, kapalı tribünün altından sahaya açılır. Ağzının
  tam yeri öneri: kapalı tribünün ortasına yakın, saha kenarında (şemadaki gibi).
- **Saha eşyası:** köşe bayrakları ve penaltı noktası önizlemede seçilmiyor; her sahada olan eşya
  olarak eklenir.
- Model: **Karar (Kemal, 16 Kasım)**: oyunda kullanılır; kaynağı `docs/lisanslar.md`'de (Kems Ajans yaptı).

### 4.3 Turun akışı

**Karar (Kemal, 16 Kasım)**: tur orta yuvarlakta başlar ve orada biter.

**Öneri** (aradaki yol): tur orta yuvarlaktan A ucunu dolaşır, açık tribüne çıkar, duvar içi koridordan B
ucuna geçer, kapalı tribünün altına (tünel, soyunma odası) iner, kapalı tribünün sıralarından ve A
ucundaki bayrak direğinden geçip orta yuvarlakta biter.

- Saha, A ucu: 1–5
- Açık tribün ve koridor: 6–9
- B ucu (kulüp binası, ışık direği): 10–11
- Kapalı tribünün altı (tünel, soyunma odası): 12–15
- Kapalı tribün, A ucu köşesi, final: 16–18

Kullanılmayan parça: B ucundaki ceza sahası ve kale (yedek; Kemal isterse bir delik oraya taşınabilir).

### 4.4 Zorluk dalgası ve yeni şeyler

**Öneri:**
- Dalga: 1 en kolay · 2 kolay · 3 kolay · 4 orta · **5 kolay (nefes)** · 6 orta · 7 orta · 8 zor ·
  **9 kolay (nefes)** · 10 orta · 11 orta · **12 kolay (nefes)** · 13 zor · 14 zor · 15 orta (ilk
  hareketli) · 16 zor · **17 orta (nefes)** · 18 en zor.
- Yeni engel türlerinin ilk geldiği delik: dar geçit (3), bant sektirme (4), rampa (6), basamak (7),
  köprü (8), kapalı bölüm (10), kum (11), tünel (12), dağınık engel (13), su (14), hareketli: kapı (15),
  kayan blok (16), dönen kol (17).

### 4.5 Delikler

Her delik aynı sırayla: yer (modelin hangi parçası) · standın yerleşimi · pist biçimi · engeller ·
zorluk · öğretir · deneme notu. Hepsi **Öneri**.

**1 · Orta yuvarlak**
- Yer: çim saha, orta yuvarlak (modelde var).
- Standın yerleşimi: pist orta çizgiye dik, orta yuvarlağın üstünden geçer; iki tribün iki yanda dekor.
- Pist: düz, kısa.
- Engeller: yok. Saha çizgileri yalnız çizgi.
- Zorluk: en kolay.
- Öğretir: çek-bırak ve nişan çizgisi.
- Deneme notu: delik dikey ekranda tek bakışta sığıyor mu; başparmakla çekmek rahat mı; geri al
  çalışıyor mu. Kamera açısı, güç-çekme oranı: DENEME.

**2 · Kenar çizgisi**
- Yer: çim saha, açık tribün tarafındaki kenar çizgisi, A yarısı (modelde var).
- Standın yerleşimi: pist kenar çizgisine paralel; bir yanında saha, öbür yanında toprak koridor.
- Pist: uzun, düz.
- Engeller: yok; yalnız kenar bantları.
- Zorluk: kolay.
- Öğretir: güç ayarı.
- Deneme notu: uzun pist tek ekrana sığıyor mu (sığmazsa kısalır, tek ekran kuralı önde).

**3 · Kale (A ucu)**
- Yer: A ucundaki ceza sahası ve kale (modelde var).
- Standın yerleşimi: pist ceza sahasından kaleye; delik kalenin içinde.
- Pist: düz, sonunda dar geçit.
- Engeller: iki kale direği (geçit), kale ağı (deliğin arkasında yumuşak duvar, topu sektirmeden durdurur).
- Zorluk: kolay.
- Öğretir: dar aralıktan geçirmek.
- Deneme notu: direkten sekme doğal mı; ağ yumuşak durduruyor mu. Geçit genişliği: DENEME.

**4 · Köşe (A ucu)**
- Yer: A ucunda, açık tribün tarafındaki saha köşesi (köşe bayrağı eklenecek).
- Standın yerleşimi: pist kenar çizgisi boyunca gider, köşede döner.
- Pist: L.
- Engeller: köşe bayrağı direği, dönüşün köşesinde (kestirmeyi kapatır).
- Zorluk: orta.
- Öğretir: banttan sektirme.
- Deneme notu: bant topu tahmin edilir açıyla veriyor mu; nişan çizgisi sekmeyi göstersin mi (DENEME, karar Kemal'in).

**5 · Penaltı noktası (nefes)**
- Yer: A ucundaki ceza sahası, penaltı noktası (eklenecek küçük işaret).
- Standın yerleşimi: kısa pist penaltı noktasından kaleye doğru.
- Pist: kısa, düz.
- Engeller: yok.
- Zorluk: kolay.
- Öğretir: yeni şey yok; tek vuruşla bitirme, nefes.
- Deneme notu: fazla mı kolay, sıkıcı mı.

**6 · Açık tribün önü, rampa**
- Yer: açık tribünün önü, sahayla ilk sıra arası (modelde var).
- Standın yerleşimi: pist sahadan başlar, rampayla tribünün ilk sırasının hizasına çıkar.
- Pist: düz, ortada yukarı rampa.
- Engeller: rampa (klasik); tribünün önü pistin bir kenarı.
- Zorluk: orta.
- Öğretir: yokuş yukarı vurmak; az güç topu geri getirir.
- Deneme notu: izometrik açıda rampa "yukarı" okunuyor mu; top geri kayıp başlangıca dönüyor mu. Eğim: DENEME.

**7 · Açık tribün sıraları**
- Yer: açık tribünün sıraları (modelde var).
- Standın yerleşimi: pist üst sıradan aşağı, sıraların üstüne kurulmuş.
- Pist: basamaklı iniş.
- Engeller: sıralar (basamak); iki sırada oturak parçası pistin bir yanını kapatır.
- Zorluk: orta.
- Öğretir: inişte gücü azaltmak.
- Deneme notu: basamak yüksekliği izometrik açıda görünüyor mu; top basamakta takılıyor mu. Basamak
  sayısı modelin sıra sayısına bağlı; yükseklik DENEME.

**8 · Koridor köprüsü**
- Yer: açık tribünün B ucuna yakın ucu ve arkasındaki duvar içi toprak koridor (modelde var).
- Standın yerleşimi: pistin bir parçası tribünün ucunda, öbür parçası koridorun karşı yanında; arada
  koridor boşluğu, üstünde dar köprü.
- Pist: iki parça, ortada köprü.
- Engeller: köprü (klasik). Köprüden düşen top dışarı kaçmış sayılır (DENEME).
- Zorluk: zor.
- Öğretir: düz ve kararlı vuruş.
- Deneme notu: köprü tek elle vurulabilir genişlikte mi; düşmek kızdırıyor mu. Genişlik: DENEME.

**9 · Duvar içi koridor (nefes)**
- Yer: açık tribün tarafında, B ucuna doğru giden toprak koridor (modelde var).
- Standın yerleşimi: pist koridor boyunca; bir yanı taş duvar, öbür yanı saha.
- Pist: geniş, kısa.
- Engeller: ortada tek sade blok; duvar bant gibi.
- Zorluk: kolay.
- Öğretir: yeni şey yok; sektirmenin rahat tekrarı.
- Deneme notu: duvarın arkasında ufuk ve zeytinlik görünüyor mu, ekranı kalabalık yapıyor mu.

**10 · Kulüp binası**
- Yer: B ucundaki kiremit çatılı kulüp binası (modelde var). **Karar (Kemal, 16 Kasım)**: delik binanın önünde ve
  saçağının altında.
- Standın yerleşimi: pist binanın önünden geçer; bir bölümü saçağın altında.
- Pist: düz, ortası üstü kapalı.
- Engeller: saçak (pistin bir bölümü üstü kapalı, top kısa bir an görünmez); binanın duvarı bant.
- Zorluk: orta.
- Öğretir: görünmeyen bölümden geçirmek.
- Deneme notu: kapalı bölümde top saydam mı görünsün, hiç mi görünmesin: DENEME.

**11 · Işık direği, kum**
- Yer: B ucunda, kapalı tribün tarafındaki köşe; ışık direğinin dibi, toprak koridor (modelde var).
- Standın yerleşimi: dar pist koridor boyunca; direk pistin kenarında.
- Pist: dar, ortası genişleyen.
- Engeller: direğin dibinde kum tuzağı (klasik; toprak yolun kumu), topu yavaşlatır; direğin gövdesi.
- Zorluk: orta.
- Öğretir: kumda fazla güç gerekir.
- Deneme notu: kum ekranda ayırt ediliyor mu; kumdan çıkış adil mi. Yavaşlatma: DENEME.

**12 · Oyuncu tüneli (nefes)**
- Yer: oyuncu tüneli (**modelde yok, eklenecek**). **Karar (Kemal, 16 Kasım)**: kapalı tribünün altından sahaya açılır.
- Standın yerleşimi: pist tünelin içinde, saha kenarından tribün altına.
- Pist: uzun, tek hafif kıvrım; tünel duvarları bant.
- Engeller: tünelin kendisi (klasik).
- Zorluk: kolay.
- Öğretir: yeni şey yok; sahadan içeri geçişin anı.
- Deneme notu: tünel içi okunur mu (ışık); tavan pisti kapatıyorsa saydam olsun mu: DENEME.

**13 · Soyunma odası**
- Yer: soyunma odası (**modelde yok, eklenecek**). **Karar (Kemal, 16 Kasım)**: kapalı tribünün altı.
- Standın yerleşimi: pist odanın zemininde; duvar boyunca dolaplar, ortada banklar.
- Pist: geniş, dağınık engelli.
- Engeller: banklar (ortada), dolaplar (kenarda, bant gibi).
- Zorluk: zor.
- Öğretir: birden çok engel arasından yol bulmak.
- Deneme notu: bank ayakları topu takmamalı; delik bankın arkasında görünmez olmamalı.

**14 · Duşlar, su**
- Yer: soyunma odasının duş bölümü, kapalı tribünün altı (**modelde yok, eklenecek**).
- Standın yerleşimi: pist duş bölümünün zemininde.
- Pist: düz; ortasında su birikintisi, bir yanında dar kuru yol.
- Engeller: su tuzağı (klasik); suya düşen top dışarı kaçmış sayılır (DENEME).
- Zorluk: zor.
- Öğretir: sudan kaçmak; dar ve güvenli yolu seçmek.
- Deneme notu: su açıkça "girme" diyor mu; kuru yolun genişliği: DENEME.

**15 · Soyunma odası kapısı (ilk hareketli)**
- Yer: soyunma odasının tünele açılan kapısı (**modelde yok, eklenecek**).
- Standın yerleşimi: pist kapının iki yanında; kapıdan geçer.
- Pist: düz.
- Engeller: açılıp kapanan kapı (hareketli; yavaş, tek).
- Zorluk: orta.
- Öğretir: zamanlama.
- Deneme notu: kapının hızı ve açık kalma süresi: DENEME; oyuncu bekleyebildiğini anlıyor mu.

**16 · Kapalı tribün**
- Yer: kapalı tribünün sıraları, çatının altı (modelde var).
- Standın yerleşimi: geniş pist sıralar boyunca, çatı direklerinin arasında.
- Pist: geniş, düz.
- Engeller: çatıyı taşıyan direkler (yerin eşyası); ortada sağa sola kayan blok (hareketli, klasik).
- Zorluk: zor.
- Öğretir: kayan engeli direklerin arasından zamanlamak.
- Deneme notu: çatı pisti kapatıyor mu (kapatıyorsa saydam: DENEME); bloğun hızı: DENEME.

**17 · Bayrak direği (nefes)**
- Yer: A ucunda, kapalı tribün tarafındaki kompleks köşesi; duvarın dibindeki bayrak direği (modelde var).
- Standın yerleşimi: L pist köşeyi döner; bayrak direği dönüşte.
- Pist: L.
- Engeller: bayrak direğinin dibinde yavaş dönen kol (hareketli, klasik).
- Zorluk: orta.
- Öğretir: dönen engelde boşluğu kollamak; finalden önce nefes.
- Deneme notu: kolun hızı: DENEME; kol bandın sekmesini bozuyor mu.

**18 · Final: orta yuvarlak**
- Yer: çim saha, orta yuvarlak; tur başladığı yerde biter (modelde var).
- Standın yerleşimi: pist orta yuvarlağın üstünde, 1. delikten geniş.
- Pist: geniş, iki bölümlü.
- Engeller: ortada dönen kol, deliğin önünde kayan blok (iki hareketli birlikte).
- Zorluk: en zor.
- Öğretir: öncekilerin hepsi; iki zamanlamayı sıraya koymak.
- Deneme notu: iki hareketli birlikte haksız mı geliyor; geri al burada ne kadar kullanılıyor (veri
  yok, denemede bakılır).

### 4.6 Oda oda deneme sırası

**Karar (Kemal, 16 Kasım):** plan çizilir, delik delik (oda oda) adım adım denenir.

**Öneri:**
- Web denemesine önce yalnız 1. delik çıkar; çek-bırak, nişan çizgisi, geri al ve kamera orada oturur.
- Kemal "tamam" deyince bir sonraki delik eklenir; her delik bir öncekinin üstüne, tek tek.
- Yeni engel türünün ilk geldiği delikte durulur, o tür ayrıca denenir: 3, 4, 6, 7, 8, 10, 11, 12,
  13, 14, 15, 16, 17.
- Her delikte aynı üç soru: tek ekranda mı, tek elle mi, yeni şey anlaşılıyor mu.
- "Kaldığı yerden devam" 5. delikten sonra denenir.
- 12–15 (tünel, soyunma odası) için önce bu bölümlerin modele eklenmesi gerekir (yeri karar: kapalı
  tribünün altı, Kemal 16 Kasım); eklenmeden bu deliklere geçilmez. O sırada 16–18 öne alınmaz (hareketliler en son).
- 18 delik bitince bir kez baştan sona oynanır: dalga hissediliyor mu, tur süresi uygun mu (DENEME).
- Vuruş sınırı ve "top dışarı kaçarsa" kuralı bu denemelerden sonra Kemal'in kararı.

### 4.7 Bu turda gerekecek parçalar

**Öneri** (görsel üretimi değil, liste; ad ve marka yok):
- Modelden: saha, iki tribün, taş duvar, toprak koridor, ışık direkleri, kulüp binası, bayrak direği.
- Eklenecek yerler (kapalı tribünün altında): oyuncu tüneli, soyunma odası (dolaplar, banklar), duş
  bölümü, kapı.
- Eklenecek saha eşyası: köşe bayrakları, penaltı noktası, kale ağı (modelde kalelerin ağı seçilmiyor).
- Pist parçaları: bantlı pist halısı, rampa, köprü, kum, su, kayan blok, dönen kol, delik ve bayrak, top.

## 5. Ses ve görsel dil

### 5.1 Ses

**Öneri** (Kemal onaylamadı):
- **Efektler:** vuruş, banttan sekme, deliğe girme, rampa ve basamak, kum, su, kapı ve hareketli
  engellerin hafif mekanik sesi. Az ve yumuşak.
- **Ortam:** boş, sakin stat: rüzgâr, uzaktan zeytinlik hışırtısı (künye "Doğa": zeytinlik). Maç
  olmayan gün; seyirci sesi yok. Tünel ve soyunma odasında ses biraz yankılı.
- **Müzik:** seyrek; ortam sesi önde (The Imperial Kemskoy'daki karara yakın).
- Efektler, ortam ve müzik ayrı kısılır.
- Sesler yalnız ücretsiz ve ticari kullanıma açık kaynaklardan; her biri `docs/lisanslar.md`'ye, kaynağı Kemal'e sorularak.

### 5.2 Görsel dil

**Karar (Kemal, 16 Kasım):** İllüstratör 2–3 deneme hazırlar; Kemal seçer. Seçim bu belgeye yazılır.

**Öneri:**
- Denemeler Stadyum turunun bir deliği üzerinden yapılır (öneri: 1. delik ya da 7. delik), dikey
  ekran, eğik yukarıdan; temel 3B modelin yerleşimi korunur.
- Renkler marka kitinden: lacivert, krem, az kiremit; yazı tipi Poppins. Modelin kiremit çatısı ve
  çimi kendi renginde kalır.
- Low-poly, mat yüzey (Dondurmacı Kızlar'daki tasarım dili örnek). Hangi dil olduğu: [Kemal].

## 6. Teknik, kapsam ve ilk sürüm

### 6.1 Teknik

**Öneri:**
- Vite + React + TypeScript; 3B için Three.js ve React Three Fiber (Dondurmacı Kızlar gibi). İskelet
  bu öneriyle kuruldu (16 Kasım).
- Fizik: hazır bir fizik kütüphanesi (ör. Rapier); Oyun Geliştiricisi ilk delik denemesinde seçer.
- 3B Dirlik Stadı modeli (`dirlik-stadi.glb`) sahnenin temeli; pistler modelin üstüne ayrı parçalar
  olarak konur. **Karar (Kemal, 16 Kasım)**: model oyunda kullanılır (`docs/lisanslar.md`).
- Her delik ayrı bir veri dosyası (pist parçaları, engeller, başlangıç ve delik yeri); kod delik delik büyür.
- Telefonda akıcılık önce: az çokgen, az ışık, ölçülü gölge.
- Telefon uygulaması sonra; paketleme öbür oyunlardaki gibi Capacitor.
- Başka minigolf oyununun görseli, adı, sahası, deliği kopyalanmaz; yalnız tür örnektir.

### 6.2 İlk oynanabilir sürüm

**Öneri:**
- Stadyum turunun 1. deliği: tek parmak vuruş, nişan çizgisi, geri al, delik sonu.
- Sonra delikler sırayla, her biri Kemal denedikten sonra (4.6).
- Türkçe ve İngilizce metin dosyaları.
- Web deneme sürümü: Kemal ve yakın çevresi bağlantıyla dener; reklam ve satın alma yok.
- İlk sürümde değil: reklam, satın alma, çok oyunculu, mevsim ve saat değişimi, ikinci tur, pul ekranı.

### 6.3 Para modeli

**Karar (Kemal, 15 Kasım):** yalnız telefon uygulamasında; kart oyunu gibi: ipucu gibi yardımcılar
reklamla, birkaç delikte bir seyrek reklam, reklamsız paket. Sıklık ve fiyat [Kemal]. Web
denemesinde reklam ve satın alma yok.

## 7. Açık sorular

Kemal'in kararını bekleyenler.

- **Geri al vuruşu sayıdan düşer mi?** DENEME; karar denemeden sonra (Kemal, 16 Kasım; 2. bölüm).
- **Top dışarı kaçarsa:** öneri "vuruştan önceki yere döner, vuruş sayılır"; DENEME, karar denemeden sonra.
- **Vuruş sınırı:** web denemesinden sonra.
- **Nişan çizgisi sekmeyi göstersin mi?** (4. delik)
- **Delik ölçüsü, tur süresi, hızlar, eğimler:** DENEME, denemeden sonra.
- **Görsel dil:** İllüstratör'ün 2–3 denemesinden hangisi.
- **Sonraki turların sırası** ve Imperial uzun turunun zamanı; turların zorluk sırası.
- **Öbür ayların turu:** Stadyum Ocak 2027'nin; öbür aylar [Kemal].
- Oyunun yayın adı, tur adları: [Kemal].
- ~~Stadyum turunun yerleri, engel türleri, zorluk, ortam~~ Cevaplandı (Kemal, 16 Kasım): 3. ve 4. bölüm.
- ~~Tünel ve soyunma odasının yeri~~ Cevaplandı (Kemal, 16 Kasım): kapalı tribünün altı; tünel oradan sahaya (4.2).
- ~~Köşe yapısı ne?~~ Cevaplandı (Kemal, 16 Kasım): kulüp binası, ad yok (4.2).
- ~~Modelin kaynağı ve lisansı~~ Cevaplandı (Kemal, 16 Kasım): oyunda kullanılır (`docs/lisanslar.md`).
- ~~Genel stat bölümleri engel olsun mu?~~ Cevaplandı (Kemal, 16 Kasım): evet; tribün sıraları, köprü, duşlar (3.2).
- ~~Tur orta yuvarlakta başlayıp bitsin mi?~~ Cevaplandı (Kemal, 16 Kasım): evet (4.3).
- ~~Oyuncunun karakteri~~ Cevaplandı (Kemal, 16 Kasım): oyuncu görünmez; yalnız top ve pist (1.3).
- ~~Ayın turu~~ Cevaplandı (Kemal, 16 Kasım): Stadyum, Ocak 2027; ileride Mart'a kayabilir (9. bölüm).

## 8. Ödül: pul koleksiyonu

**Karar (Kemal, 15 Kasım):** minigolfün ödül sistemi bütün oyunların ortak pul koleksiyonudur: her ay
bir pul, çeyrekte üç pul toplanınca büyük 4. pul ("3+1"), her pul ayrı tasarım ve yazısız, ortak
koleksiyon sayfası (Kems Ajans `docs/pul-koleksiyonu.md`). Ayın pulu o ayın görevi bitince gelir.

**Öneri:** kod yapısı kart oyunundaki `src/pul/` klasörü örnek alınarak kurulur. Pulların tasarımı
İllüstratör'ün, onayı Kemal'in.

## 9. Ayın görevi

**Karar (Kemal, 16 Kasım):** ayın büyük görevi **ayın turunu baştan sona bitirmek**. Ayın pulu tur
bitince gelir. Ay takvim ayına bağlıdır; **geçen ayın turu sonradan bitirilebilir**. Turun içeriği
(hangi delikler) oyun yapılırken sorulur.

**Öneri:**
- Tur 18 deliğiyle bitince sayılır; vuruş sayısının önemi yok (cezasız ruh).
- Yarıda bırakılan tur ay bitse de kaldığı yerden sürer; bitince o ayın pulu gelir.
- **Karar (Kemal, 16 Kasım)**: Stadyum turu şimdilik **Ocak 2027**'nin ayın turu. Not: ileride Ocak'a başka bir şey
  alınırsa Mart'a kayabilir.
- Öbür ayların turu: [Kemal]. Turlar 18 delik olduğu için her ay yeni tur gerekmez; bir tur birden çok
  ay kullanılabilir ([Kemal]).

## 10. Sıra (öneri)

Her adım bir öncekinin onayıyla başlar; tarih yazılmaz.

1. **Stadyum delik planı** (Oyun Tasarımcısı): bu belge ve şema. Kemal onaylar ya da düzeltir.
2. **Tünel ve soyunma odası** modele eklenir (yeri karar: kapalı tribünün altı, Kemal 16 Kasım; 3B iş).
3. **İlk delik denemesi** (Oyun Geliştiricisi): 1. delik, fizik, vuruş, nişan çizgisi, delik sonu. Ölçüler DENEME.
4. **Görsel dil denemeleri** (İllüstratör, ayrı iş): 2–3 deneme; Kemal seçer.
5. Delikler sırayla (4.6), her biri Kemal denedikten sonra; hareketliler en son.
6. Ayın turu ve pul; sonra ikinci tur; telefon uygulaması.

## 11. Ekran maketleri (öneri)

**Karar (Kemal, 16 Kasım):** ekranlar önden görülür. Aşağıdakiler **maket**tir: oynanış değil, düğmeler
çalışmaz, top atılmaz. Her ekranın köşesinde "MAKET · öneri" yazar. Vuruşlar, ilerleme ve pul sayısı
boştur ("–"); ad yerine `[YER TUTUCU: …]` ya da `[Kemal]` durur. Ölçüler (pist, top, nişan çizgisi,
güç halkası) DENEME. Renkler marka kitinden, yazı Poppins; 3B stat, Kems Ajans'ın Dirlik Stadı modeli
(oyunda kullanımı Kemal'in 16 Kasım onayıyla). Ayın turu kutusunda "Ocak 2027" yazar (Kemal, 16 Kasım).

Uygulamada adresin sonuna `?maket=<ekran>` yazınca açılır (bilgisayarda ve telefonda); oyunun kendi
ekranına karışmaz. Görüntüler iPhone 13 boyutunda çekildi.

1. **Ana ekran** (`?maket=ana-ekran`): oyunun adı yer tutucu, 3B stat vitrini, tur kartı (Dirlik Stadı,
   18 delik, ilerleme boş), "Oyna", ayın turu ve pullar kutuları, alt menü (Oyna, Turlar, Pullar, Ayarlar).
2. **Tur seçimi** (`?maket=tur-secimi`): Stadyum turu kartı 3B statın küçük görüntüsüyle; sonraki turlar
   kilitli, yer tutucu (açılma kuralı [Kemal]).
3. **Delik ekranı** (`?maket=delik`): 1. delik (orta yuvarlak). 3B stat, üstünde krem pist, lacivert kenar
   bandı, top, bayraklı delik. Üstte delik no, yer, zorluk ve vuruş; altta geri al ve skor.
4. **Atış ve nişan** (`?maket=atis`): 3. delik (A ucundaki kale, dar geçit). Parmakla geri çekme göstergesi,
   kiremit kesik nişan çizgisi, topun çevresinde güç halkası, geri al düğmesi, vuruş sayısı.
5. **Skor kartı** (`?maket=skor-karti`): 18 deliğin listesi (plandaki yerleriyle), vuruşlar "–", DENEME.
6. **Tur sonu** (`?maket=tur-sonu`): toplam vuruş "–", ayın turu ilerlemesi (18 parça, boş), ayın pulu yer
   tutucusu ve 3+1 pul dizisi.

Kamera notu (DENEME): 3. maket eğik yukarıdan perspektif bakar (iskeletteki kamera gibi; statın
tribünü ve duvarı arkada görünsün diye), 4. maket tam izometrik. Hangisinin oyunda kalacağı ilk delik
denemesinde Kemal'e gösterilir.

| | | |
|---|---|---|
| ![Ana ekran](ekranlar/maket-1-ana-ekran.png) | ![Tur seçimi](ekranlar/maket-2-tur-secimi.png) | ![Delik ekranı](ekranlar/maket-3-delik.png) |
| 1 · Ana ekran | 2 · Tur seçimi | 3 · Delik ekranı |
| ![Atış ve nişan](ekranlar/maket-4-atis.png) | ![Skor kartı](ekranlar/maket-5-skor-karti.png) | ![Tur sonu](ekranlar/maket-6-tur-sonu.png) |
| 4 · Atış ve nişan | 5 · Skor kartı | 6 · Tur sonu |
