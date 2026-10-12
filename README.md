# Trend Admin (trendarsa-admin)

**trendev-web (villa) ve trendarsa-web (arsa) siteleri ile trendarsa-app için ortak web içerik paneli.** trendarsa-app'in Supabase projesini okur/yazar ve uygulamanın admin ekranlarıyla aynı admin hesaplarını kullanır (Supabase Auth, "oturum var = admin").

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3FCF8E?logo=supabase&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)

> 🚧 **Durum:** Aktif geliştirme. Panel yayında ve kullanılıyor; yeni içerik türleri eklenmeye devam ediyor.

---

## TrendArsa ekosistemi

Bu repo, ortak bir Supabase veritabanını ve Cloudflare R2 görsel deposunu paylaşan dört parçalı bir sistemin parçasıdır:

| Repo | Rol |
|---|---|
| [trendarsa-app](https://github.com/seniih/trendarsa-app) | Flutter mobil uygulama (iOS/Android); Supabase şeması, RLS ve Edge Function'ların kaynağı |
| **trendarsa-admin** (bu repo) | Web içerik paneli — ilanlar, villa projeleri, site içeriği |
| [trendarsa-web](https://github.com/seniih/trendarsa-web) | Arsa projeleri sitesi (TR/EN) |
| [trendev-web](https://github.com/seniih/trendev-web) | Villa projeleri sitesi (TR/EN) |

## Ne yapar

- **Villa Projeleri** (`/projects`) — trendev-web'in gösterdiği `projects` (kategori `ev`) tablosu: iki dilli metinler, fiyat/parsel bilgileri, kat/oda planı (`project_floors`/`project_floor_rooms`, oda alanları m²), kapak + galeri fotoğrafları.
- **Arsa İlanları** (`/listings`) — `listings` (kategori `arsa`) tablosu; trendarsa-app'in akışını ve trendarsa-web'in proje sayfalarını besler. "TrendArsa sitesi" hedefi seçilirse siteye özel alanlar (slug, İngilizce metinler, etiketler, emsal) açılır.
- **Site İçeriği** (`/site`) — her iki web sitesinin ana sayfasındaki açılış (hero) ve harita bloğu, rakam şeridi, iletişim bilgileri ve harita konumu (`site_sections`, `site_stats`, `site_settings` tabloları). Bir alan boş bırakılırsa site kendi çeviri dosyasındaki değere düşer.
- **Canlı önizleme** — ilan ve proje formlarında kaydetmeden önce kart önizlemesi.

### Yayın hedefleri

Her kayıtta "Nerede yayınlansın?" seçimi vardır; `publish_targets` kolonuna yazılır ve her yüzey kendi sorgusunda bunu filtreler:

| Hedef | Nereyi besler |
| --- | --- |
| TrendEv sitesi | trendev-web — villa projeleri |
| TrendArsa sitesi | trendarsa-web — arsa ilanları + projeler |
| TrendArsa uygulaması | Flutter uygulamasının akışı ve proje ekranı |

Arsa ilanları TrendEv sitesinde gösterilmez (o site villa projelerini okur), bu yüzden ilan formunda o seçenek yer almaz.

## Mimari

- Panel tamamen istemci tarafında çalışır; Supabase'e anon key + kullanıcı oturumuyla bağlanır. Yetkilendirme Supabase RLS politikalarıyla sağlanır (`is_admin()`).
- Görsel yükleme, trendarsa-app'in `generate-upload-url` Edge Function'ı üzerinden yapılır: fonksiyon presigned URL üretir, tarayıcı görseli **doğrudan** Cloudflare R2'ye `PUT` eder. R2 kimlik bilgileri bu panele hiç ulaşmaz.

```
app/          # sayfalar: login, listings, projects, site
components/   # formlar, önizlemeler, görsel yükleyici, yayın hedefi seçici
lib/          # Supabase istemcisi, veri erişimi, upload, auth
```

## Kurulum

```bash
git clone https://github.com/seniih/trendarsa-admin.git
cd trendarsa-admin
npm install
cp .env.example .env.local   # Supabase URL/anon key + R2 public base URL
npm run dev                  # http://localhost:3010
```

Yeni bir admin hesabı Supabase Studio'dan (Authentication → Users → Add user) oluşturulur — trendarsa-app migration'larındaki `handle_new_admin_user` trigger'ı otomatik olarak `profiles` satırı açar.

### R2 CORS ayarı (görsel yükleme için zorunlu)

Görseller tarayıcıdan doğrudan R2'ye yüklendiği için, görsellerin tutulduğu R2 bucket'ında (`trendarsa-app`) panelin adresine izin veren bir CORS kuralı olmalıdır; aksi halde preflight isteği engellenir ve panel "R2'ye bağlanılamadı" hatası verir. (Flutter uygulamasında CORS olmadığı için bu adım orada gerekmez.)

Kural [`r2-cors.json`](r2-cors.json) dosyasındadır ve yerel geliştirme (`localhost:3010`) ile production adresini içerir. Yeni bir origin (preview deploy, farklı domain) eklenecekse dosyayı düzenleyip kuralı bucket'a uygulayın:

```bash
npx wrangler r2 bucket cors set trendarsa-app --file r2-cors.json
```

> Not: `wrangler`'ın eski sürümlerinde bu komut `cors put` idi ve S3 tarzı düz bir array bekliyordu; güncel sürüm `cors set` ile Cloudflare'ın `{"rules": [...]}` şemasını kullanır — `r2-cors.json` bu formattadır.

Aynı ayar Cloudflare Dashboard → R2 → bucket → **Settings → CORS Policy** üzerinden de yapılabilir. Kuralın çalıştığını doğrulamak için yanıtta `access-control-allow-origin` başlığı görünmelidir:

```bash
curl -I -H "Origin: http://localhost:3010" \
  "$NEXT_PUBLIC_R2_PUBLIC_BASE_URL/<mevcut-bir-görsel-anahtarı>"
```

## Deploy

Next.js, [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) ile **Cloudflare Workers**'a deploy edilir (yapılandırma: [`wrangler.jsonc`](wrangler.jsonc), [`open-next.config.ts`](open-next.config.ts)). `main` branch'ine her push'ta [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) otomatik deploy eder. Gerekli GitHub repo secret'ları:

- `CLOUDFLARE_API_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`

Elle deploy için:

```bash
npm run cf:deploy
```

## İçeriğin sitelere yansıması

- **trendev-web** sayfaları ISR (`revalidate = 60`) kullanır; panelde yapılan değişiklik ~1 dakika içinde siteye yansır.
- **trendarsa-web** build sırasında statik üretilir; değişikliklerin yansıması için yeniden deploy gerekir.
- **trendarsa-app** veriyi doğrudan Supabase'den okur; değişiklik anında görünür.

## Yol haritası

- [x] Villa projeleri, arsa ilanları ve site içeriği editörleri
- [x] Yayın hedefi seçimi (`publish_targets`)
- [x] GitHub Actions ile otomatik deploy
- [ ] Blog yazılarının (trendarsa-web `data/posts.ts`) panelden yönetilmesi
- [ ] "Neden ...", "Hakkımızda" gibi sabit sayfaların ve ana sayfadaki adım/güvence bloklarının panele taşınması (şu an sitelerin çeviri dosyalarında)
- [ ] trendarsa-web için içerik değişikliğinde otomatik yeniden deploy (deploy hook) veya ISR

## Lisans

Bu proje özel (proprietary) bir projedir; tüm hakları saklıdır.
