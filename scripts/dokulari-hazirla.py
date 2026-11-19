# Dokuları oyuna hazırlar: indirilen 1K JPG dosyalarını küçültür (WebP), gerekirse renk dokusunun
# kontrastını azaltır ve ortalama rengini (doğrusal) ölçer. Kaynaklar ve lisans: docs/lisanslar.md.
# Kullanım (Pillow gerekir): python3 scripts/dokulari-hazirla.py <indirilenler> public/dokular
# İndirilenler klasöründe beklenen adlar aşağıdaki listede. Ortalama renkler src/oyun/ayarlar.ts'e yazılır
# (GORUNUS.dokuOrtalama). Kontrast ve boy seçimleri DENEME.
import json
import os
import sys

from PIL import Image

kaynak, hedef = sys.argv[1], sys.argv[2]
# ad, renk dosyası, kabartı (normal, OpenGL) dosyası, renk boyu, kabartı boyu, renk kontrastı (1 = dokunma)
ISLER = [
    ('cim', 'Grass001_1K-JPG_Color.jpg', 'Grass001_1K-JPG_NormalGL.jpg', 1024, 512, 0.6),
    ('toprak', 'dirt_floor_diff_1k.jpg', 'dirt_floor_nor_gl_1k.jpg', 1024, 512, 1.0),
    ('beton', 'concrete_floor_02_diff_1k.jpg', 'concrete_floor_02_nor_gl_1k.jpg', 1024, 512, 0.45),
    ('tas', 'yellow_stone_wall_diff_1k.jpg', 'yellow_stone_wall_nor_gl_1k.jpg', 512, 512, 1.0),
    ('ahsap', 'wood_planks_diff_1k.jpg', 'wood_planks_nor_gl_1k.jpg', 512, 512, 1.0),
]


def dogrusal(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


os.makedirs(hedef, exist_ok=True)
ortalama = {}
toplam = 0
for ad, renk, normal, rboy, nboy, kontrast in ISLER:
    r = Image.open(os.path.join(kaynak, renk)).convert('RGB')
    if r.size[0] != rboy:
        r = r.resize((rboy, rboy), Image.LANCZOS)
    if kontrast != 1.0:
        # Her renk kanalı kendi ortalamasına doğru çekilir (leke ve benek azalır, renk aynı kalır).
        kanallar = []
        for k in r.split():
            ort = sum(k.resize((64, 64), Image.BOX).tobytes()) / 4096
            kanallar.append(k.point(lambda v, o=ort: round(o + (v - o) * kontrast)))
        r = Image.merge('RGB', kanallar)
    r.save(os.path.join(hedef, f'{ad}-renk.webp'), 'WEBP', quality=78, method=6)
    kucuk = r.resize((64, 64), Image.BOX).tobytes()
    ortalama[ad] = [round(sum(dogrusal(kucuk[i] / 255) for i in range(kanal, len(kucuk), 3)) / 4096, 4) for kanal in range(3)]
    n = Image.open(os.path.join(kaynak, normal)).convert('RGB')
    if n.size[0] != nboy:
        n = n.resize((nboy, nboy), Image.LANCZOS)
    n.save(os.path.join(hedef, f'{ad}-normal.webp'), 'WEBP', quality=82, method=6)
adlar = [f'{ad}-{tur}.webp' for ad, *_ in ISLER for tur in ('renk', 'normal')]
for dosya in adlar:
    boyut = os.path.getsize(os.path.join(hedef, dosya))
    toplam += boyut
    print(dosya, boyut)
print('toplam', toplam, 'bayt', round(toplam / 1e6, 2), 'MB')
print(json.dumps(ortalama))
