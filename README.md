# Trend Admin

trendev-web (villa/ev) ve trendarsa-web (arsa) için ortak içerik paneli.
trendarsa-app'in kullandığı Supabase projesini okur/yazar — trendarsa-app'in
Flutter admin ekranlarıyla aynı admin hesaplarını kullanır (Supabase Auth,
"oturum var = admin").

## Kurulum

```bash
npm install
cp .env.example .env.local   # Supabase URL/anon key + R2 public base URL doldurun
npm run dev                  # http://localhost:3010
```

Yeni bir admin hesabı Supabase Studio'dan (Authentication > Users > Add user)
oluşturulur — trendarsa-app/supabase/migrations'daki `handle_new_admin_user`
trigger'ı otomatik `profiles` satırı açar.

## R2 CORS ayarı (görsel yükleme için zorunlu)

Görseller tarayıcıdan **doğrudan** Cloudflare R2'ye `PUT` edilir (Edge
Function sadece presigned URL üretir). Flutter uygulamasında CORS diye bir şey
olmadığı için bu adım orada gerekmiyordu; tarayıcıda ise bucket'ta CORS kuralı
yoksa preflight isteği engellenir ve panel "R2'ye bağlanılamadı" hatası verir.

`r2-cors.json` içindeki `ADMIN_PANEL_DOMAIN` yerine panelin gerçek adresini
yazın, sonra kuralı bucket'a uygulayın:

```bash
npx wrangler r2 bucket cors put <BUCKET_ADI> --file r2-cors.json
```

Aynı şey Cloudflare Dashboard → R2 → bucket → **Settings → CORS Policy**
üzerinden de yapılabilir. Yeni bir origin'den (preview deploy, farklı domain)
panel açılacaksa o adres de listeye eklenmelidir.

Doğrulama — kural işliyorsa yanıtta `access-control-allow-origin` görünür:

```bash
curl -I -H "Origin: http://localhost:3010" \
  "$NEXT_PUBLIC_R2_PUBLIC_BASE_URL/<mevcut-bir-görsel-anahtarı>"
```

## Ne yapar

- **Villa Projeleri** (`/projects`) — trendev-web'in gösterdiği `projects`
  (kategori `ev`) tablosu: bilingual metinler, fiyat/parsel bilgileri, kat/oda
  planı (`project_floors`/`project_floor_rooms`), kapak + galeri fotoğrafları.
- **Arsa İlanları** (`/listings`) — `listings` (kategori `arsa`) tablosu;
  trendarsa-app'in akışını ve trendarsa-web'in proje sayfalarını besler.
  "TrendArsa sitesi" hedefi seçilirse siteye özel alanlar (slug, İngilizce
  metinler, etiketler, emsal) açılır.
- **Site İçeriği** (`/site`) — her iki web sitesinin ana sayfasındaki açılış
  (hero) ve harita bloğu, rakam şeridi, iletişim bilgileri ve harita konumu
  (`site_sections`, `site_stats`, `site_settings` tabloları). Bir alan boş
  bırakılırsa site kendi çeviri dosyasındaki değere düşer.

## Yayın hedefleri

Her kayıtta "Nerede yayınlansın?" seçimi vardır; `publish_targets` kolonuna
yazılır ve her yüzey kendi sorgusunda bunu filtreler:

| Hedef | Nereyi besler |
| --- | --- |
| TrendEv sitesi | trendev-web — villa projeleri |
| TrendArsa sitesi | trendarsa-web — arsa ilanları + projeler |
| TrendArsa uygulaması | Flutter uygulamasının akışı ve proje ekranı |

Arsa ilanları TrendEv sitesinde gösterilmez (o site villa projeleri okur), bu
yüzden ilan formunda o seçenek yer almaz.

Görsel yükleme, trendarsa-app'in kullandığı `generate-upload-url` Edge
Function'ı üzerinden Cloudflare R2'ye gider — R2 kimlik bilgileri bu panele hiç
sızmaz. Bucket'ta CORS kuralı gerekir (yukarı bkz.).

## Kapsam dışı (bilinçli olarak yapılmadı)

- Blog yazıları (trendarsa-web `data/posts.ts`) hâlâ dosya tabanlı.
- Sitelerin "Neden ...", "Hakkımızda" gibi sabit sayfaları ve ana sayfadaki
  adım/güvence blokları çeviri dosyalarında duruyor; panelden yönetilen
  bölümler hero, harita ve rakam şeridi.
- Supabase → Cloudflare Pages arasında otomatik deploy-hook/webhook yok —
  siteler statik olarak build edilir, içerik değiştiğinde yeniden deploy
  edilmeleri gerekir.
