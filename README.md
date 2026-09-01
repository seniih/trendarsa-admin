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

## Ne yapar

- **Villa Projeleri** (`/projects`) — trendev-web'in gösterdiği `projects`
  (kategori `ev`) tablosu: bilingual metinler, fiyat/parsel bilgileri, kat/oda
  planı (`project_floors`/`project_floor_rooms`), kapak + galeri fotoğrafları.
- **Arsa İlanları** (`/listings`) — trendarsa-app'in `listings` (kategori
  `arsa`) tablosu.
- Görsel yükleme, trendarsa-app'in kullandığı `generate-upload-url` Edge
  Function'ı üzerinden Cloudflare R2'ye gider — R2 kimlik bilgileri bu panele
  hiç sızmaz.

## Kapsam dışı (bilinçli olarak yapılmadı)

- trendarsa-web henüz bu veritabanını okumuyor (sadece trendev-web okuyor).
- Supabase → Cloudflare Pages arasında otomatik deploy-hook/webhook yok —
  trendev-web statik olarak build edilir, içerik değiştiğinde elle yeniden
  deploy edilmesi gerekir.
