# minigolf

Kems Company'nin telefon için minigolf oyunu. Turlar Düzada'nın yerlerinde geçer; top tek
parmakla çekilip bırakılarak deliğe sokulur. Sakin, cezasız. Çalışma adı: depo "minigolf",
KKM'de "Mini Golf Düzada". Yayın adı [Kemal].

- Kurallar ve çalışma şekli: `CLAUDE.md`
- Oyunun tek kaynağı: `docs/tasarim-belgesi.md` (taslak)
- Sıra ve açık işler: `docs/yol-haritasi.md`
- Deneme bağlantısı (ana dala birleşince ve Pages açılınca): https://hkemal94.github.io/minigolf/

Nasıl denenir: bağlantıyı telefonda dik tutarak açın. Bilgisayarda: `npm install`, sonra
`npm run dev`. Derleme: `npm run build`.

Klasörler:
- `src/sahne/`: 3B saha (zemin, kenarlar, top), kamera ve ışık
- `src/metinler/`: ekrandaki yazılar (Türkçe, İngilizce)
- `docs/`: tasarım belgesi, yol haritası, lisanslar, ekran görüntüleri
- `.github/workflows/yayinla.yml`: ana dala her birleştirmede deneme bağlantısını günceller
