# Minigolf · Yol haritası

> **TASLAK · Kemal onaylamadı.** Sıra tasarım belgesindeki kararlardan
> (`docs/tasarim-belgesi.md`). Tarih ve süre yazılmadı (veri yok). Her adım küçük, tek PR'la gelir;
> her adımın sonunda Kemal'in telefonda açıp deneyebileceği bir şey olur. Kemal "şimdi" derse bir
> adım öne geçer.

## Oynanabilir prototip (19 Kasım 2026; öneri, `ajans/oynanabilir-prototip`)

Kemal'in telefonda deneyeceği ilk oynanış: https://hkemal94.github.io/minigolf/?oyna=1 (ana dala birleşince).
Üç delik, bu sırayla: 3 (kale), 1 (orta yuvarlak), 7 (tribün sıraları). Topa dokun, geri çek, bırak; çekerken
nişan oku ve güç çubuğu. Top gerçek ölçüde (42,67 mm), delik 108 mm; top yuvarlanır, yavaşlar, kenardan ve
eşyadan seker, deliğe düşer. Kamera topu izler; iki parmakla yakınlaşır ve döner, tek parmak boş yerde çevirir.
Ekranda delik numarası, vuruş sayacı, deliğe uzaklık, deliği gösteren ok, köşede küçük plan. Top dışarı çıkarsa
önceki yerine döner, vuruş sayılır. Delik bitince "sonraki delik"; üçü bitince delik delik vuruş kartı. Ses yok.
Fizik hazır kütüphane değil, tek top için yazılmış küçük bir çözücü (neden: tasarım belgesi 6.4). Bütün
değerler DENEME (`src/oyun/ayarlar.ts`). Bilgisayarda telefon boyutunda (390 × 844), dokunmatik olarak denendi:
bot üç deliği de deliğe soktu (`scripts/oyna-bot.mjs`). **Gerçek telefonda denenmedi.** Maketler (`?maket=…`)
olduğu gibi duruyor. Geri al, kaldığı yerden devam, ses, vuruş sınırı bu prototipte yok.

## Neredeyiz

- 16 Kasım 2026 (PR #1, birleşti): iskelet. Dikey tek ekran: üstte ince şerit (oyunun adı
  yer tutucu, "Deneme sürümü"), ortada eğik yukarıdan bakan kamerayla boş, düz bir saha ve yer
  tutucu bir top. Fizik ve vuruş yok. Türkçe ve İngilizce yazı dosyaları, deneme bağlantısı için
  yayın iş akışı. Bilgisayarda telefon boyutunda denendi; gerçek telefonda denenmedi.
- 16 Kasım 2026 (öneri; `ajans/stadyum-plani`): kapsamlı tasarım belgesi, Stadyum turunun 18 delikli
  planı ve şeması (`docs/plan/`), altı ekran maketi (`?maket=…`; ana ekran, tur seçimi, delik, atış,
  skor kartı, tur sonu; görüntüleri `docs/ekranlar/`). Maketler öneri, oynanış değil. Gerçek telefonda
  denenmedi.
- 16 Kasım 2026 (aynı dal): Kemal'in 8 cevabı işlendi. Tünel ve soyunma odası kapalı tribünün altında;
  köşedeki yapı kulüp binası (10. delik onun önünde); 3B Dirlik Stadı modeli oyunda kullanılır; tribün
  sıraları, köprü, duşlar engel; tur orta yuvarlakta başlar ve biter; geri al DENEME; oyuncu görünmez;
  Stadyum turu Ocak 2027'nin ayın turu (ileride Mart'a kayabilir).
- 18 Kasım 2026 (öneri; `ajans/ornek-delikler`): Kemal maketlere bakıp üç karar verdi: pistler gerçek
  boyutlarda, her delik yere özgü ve daha zorlu, zemin mekânın kendi zemini (ayrı halı yok, ince bordür).
  Üç örnek delik bu dille çizildi: 3 (kale, çim), 7 (açık tribün sıraları, beton basamak), 14 (duşlar,
  karo). Delik ve atış maketleri bu üç delikle yeniden yapıldı (`?maket=delik&no=3|7|14`,
  `?maket=atis&no=…`), üstten ölçülü şemalar eklendi (`?maket=sema&no=…`; `docs/plan/ornek-delik-*.png`).
  Ölçüler kaynağıyla (IFAB, WMF norm pistleri, 3B model); kaynağı olmayan DENEME. Öbür 15 delik eski
  dilde, yeniden çizilecek. Gerçek telefonda denenmedi.
- 18 Kasım 2026 (aynı dal, Kemal'in cevapları): dil 18'e henüz yayılmıyor, yalnız üç örnek düzeltildi.
  Top (4,27 cm) ve delik gerçek ölçüde, büyütme kalktı; kamera topu yakından izler, deliğin yeri kenardaki
  okla ve küçük planla gösterilir; pist kenarı kiremit; tribünde tahta yerine tek tek koltuk ve 7. deliğin
  bulmacası koltuklarla yeniden kuruldu. Gerçek telefonda denenmedi.
- 18 Kasım 2026 (aynı dal, Kemal'in ikinci cevapları): deliğin yeri ok, uzaklık ve küçük planla; kamera
  maketteki uzaklıkta ve iki parmakla yakınlaştırılıp çevrilebilir; delik çapı 10,8 cm; **bu dil 18 deliğe
  yayılır**, kalan 15 delik adım adım ayrı PR'larda (aşağıda).
- 18 Kasım 2026 (öneri; `ajans/delikler-adim-1`): adım 1. Sahadaki dört delik yeni dille çizildi: 1 (orta
  yuvarlağın çizgisinde kavisli pist, çizgide üç antrenman hunisi), 2 (taç çizgisine inen, ucu açık pist, ortada
  iki sulama başlığı), 4 (köşe bayrağının çevresinden dönen L), 5 (penaltı noktası; baraj mankenleri ve oval
  kenar, nefes). Zemin sahanın çimi, kenar kiremit, top ve delik gerçek ölçüde. Maketler
  `?maket=delik&no=1|2|4|5`, `?maket=atis&no=…`, şemalar `?maket=sema&no=…` (`docs/plan/ornek-delik-*.png`);
  yerleşim şeması ve delik planı yedi deliği gösterir, kalan 11 "yeniden çizilecek". Köşe yayı, köşe bayrağı ve
  penaltı noktası modelde yok, kodla çizildi. Huniler, sulama başlıkları ve baraj mankenleri künyede ve modelde
  yok: DENEME, Kemal onaylamadı (Kems'in ön elemesinden sonra eklendi). Oynanış yok; gerçek telefonda denenmedi.

- 19 Kasım 2026 (öneri; `ajans/galeri-listesi`): çizimlerin listesi `docs/galeri.json` (Kemal: "Bu minigolf
  planlarını sakla, bayıldım; KKM'nin içinde oyun galerisine koy"). KKM → Oyunlar → Mini Golf Duzada →
  "Planlar ve çizimler" bu listeyi okur: stadyum delik planı (3), ekran maketleri (4), delikler (7 delik × delik
  ekranı, atış ekranı, ölçülü şema = 21) ve eski sürümler (26; git geçmişinden `docs/galeri/eski/` altına
  kopyalandı: ilk maketler, örnek deliklerin ve adım 1'in ilk hâli). Hepsi taslak (Kemal açıkça onaylamadı),
  birleşmiş PR'lardan. Kural: her yeni çizim aynı PR'la bu listeye girer. Oyunda değişiklik yok.

## Sıradaki

1. **Kalan 11 delik yeni dille** (karar: Kemal, 18 Kasım; sıra öneri, tasarım belgesi 4.9). Her adım tek
   PR (şema, delik ve atış maketi, tarif); bir sonraki adım Kemal bir öncekini gördükten sonra:
   - Adım 1: **1, 2, 4, 5** (saha, çim). Çizildi (öneri; `ajans/delikler-adim-1`), Kemal'in bakması bekleniyor.
   - Adım 2: **6, 8, 9** (açık tribünün önü, koridor köprüsü, duvar içi koridor).
   - Adım 3: **10, 11** (kulüp binası, ışık direği).
   - Adım 4: **12, 13, 15** (tünel, soyunma odası, kapı; yerler modelde yok, kodla çizilir).
   - Adım 5: **16, 17, 18** (kapalı tribün, bayrak direği, final; hareketli engeller en son).
2. **Modelde düzeltilecekler** (Kems Ajans; tasarım belgesi 4.8 sonu): sahanın çimi çevre çimden 4 cm yüksek,
   orta yuvarlak kesik parçalı; köşe yayı, penaltı yayı, penaltı noktası, orta nokta ve köşe bayrakları yok.
3. **Tünel ve soyunma odası** (duşlarıyla) modele eklenir: kapalı tribünün altı, tünel oradan sahaya
   (yeri karar, Kemal 16 Kasım; 3B iş). Makette o zamana kadar kodla çizilir.
4. **İlk delik denemesi:** yapıldı (öneri; yukarıda "Oynanabilir prototip"): 3, 1 ve 7. delik oynanıyor.
   Kemal telefonda dener; DENEME değerleri (güç sınırı, çimin hızı, sekme, kamera, dışarı çıkma kuralı) onun
   denemesinden sonra ayarlanır. Eksik kalan: geri al, kaldığı yerden devam.
5. Sonraki delikler oynanışa, delik delik; her biri Kemal denedikten sonra; hareketliler en son.

## Sona kalanlar

- Hareketli engeller (engeller içinde en son).
- Görsel dil: İllüstratör 2–3 deneme.
- Ayın turu ve pul (takvim ayı; geçen ayın turu sonradan bitirilebilir). Stadyum turu Ocak 2027'nin
  ayın turu; ileride Ocak'a başka bir şey alınırsa Mart'a kayabilir.
- Imperial uzun turu.
- Telefon uygulaması; reklam ve reklamsız paket yalnız orada.

## Bitenler

- İskelet (16 Kasım, PR #1 birleşti).
- Stadyum turu soruları: Kemal'in 8 cevabı (16 Kasım; tasarım belgesi, kararların geçmişi).
- Ölçek, zemin ve özgün delik kararı (Kemal, 18 Kasım; tasarım belgesi, kararların geçmişi ve 4.8).
- Gerçek ölçüde top ve delik, topu izleyen kamera, kiremit kenar, tribün koltukları kararı (Kemal, 18 Kasım).
- Üç örnek delik (3, 7, 14) ve dilin 18 deliğe yayılma kararı (Kemal, 18 Kasım).
