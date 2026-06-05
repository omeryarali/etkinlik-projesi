# Proje Özeti

Son güncelleme: `2026-06-05`

## Projenin Amacı

Etkinlik Projesi, kullanıcıların şehir veya ilçe bazında etkinlik keşfedebildiği, organizatörlerin etkinlik yayınlayabildiği ve adminin platformu denetlediği bir etkinlik platformudur.

Temel kullanıcı sorusu:

> Bugün bulunduğum yerde hangi etkinlikler var?

## Ürün Özeti

Platform üç ana rol etrafında şekillenir:

- `Participant`: Etkinlik keşfeder, detay görür, etkinliğe katılır.
- `Organizer`: Organizer başvurusu onaylandıktan sonra etkinlik oluşturur ve katılımcılarını yönetir.
- `Admin`: Kullanıcı, organizatör, etkinlik ve kategori yönetimini yapar.

## Repo Kapsamı

Bu repoda üç ana uygulama bulunur:

- `backend/EtkinlikProjesi.Api`: ASP.NET Core Web API
- `admin-panel`: Next.js tabanlı admin panel
- `mobile`: Expo / React Native mobil uygulama

## Teknik Yığın

### Backend

- `ASP.NET Core Web API`
- `Entity Framework Core`
- `PostgreSQL`
- `JWT Authentication`
- `Swagger`

### Admin Panel

- `Next.js 16`
- `React 19`
- `Tailwind CSS 4`

### Mobile

- `Expo`
- `React Native`
- `expo-router`
- `AsyncStorage`

## Mevcut Durum

### Backend

Backend tarafı işlevsel bir MVP seviyesinde.

Uygulanan ana başlıklar:

- Kayıt, giriş, profil güncelleme, şifre değiştirme
- JWT ve rol bazlı yetkilendirme
- Organizer başvurusu, onay, red, askıya alma, yeniden aktifleştirme
- Kategori oluşturma ve aktif/pasif yönetimi
- Etkinlik oluşturma, güncelleme, iptal, tamamlama
- Public etkinlik listeleme, filtreleme ve detay
- Etkinliğe katılma, ayrılma ve katılımcı yönetimi
- Admin dashboard ve listeleme endpointleri

### Admin Panel

Admin panel kullanılabilir durumda ve API ile entegre.

Mevcut sayfalar:

- `/login`
- `/dashboard`
- `/organizers`
- `/events`
- `/users`
- `/categories`

### Mobile

Mobil uygulama dokümanlarda daha önce plan aşamasında görünse de repoda aktif geliştirme altında.

Mevcut ekranlar:

- `index`
- `login`
- `register`
- `profile`
- `profile-edit`
- `change-password`
- `explore`
- `my-events`
- `organizer-apply`
- `organizer-events`
- `create-event`
- `events/[id]`
- `organizer-event-detail/[id]`
- `event-participants/[id]`

## Kullanıcı Akışı

```text
Kullanıcı kayıt olur.
Kullanıcı giriş yapar.
Kullanıcı onaylı etkinlikleri listeler.
Kullanıcı isterse organizer başvurusu yapar.
Admin organizer başvurusunu inceler.
Admin onaylarsa kullanıcı Organizer rolüne geçer.
Organizer etkinlik oluşturur.
Etkinlik Pending durumunda admin onayına düşer.
Admin etkinliği onaylar.
Etkinlik Approved olur.
Participant etkinliğe katılır.
Organizer katılımcıları görür ve yoklama alır.
```

## Proje Yapısı

```text
EtkinlikProjesi
|-- backend
|   `-- EtkinlikProjesi.Api
|-- admin-panel
|-- mobile
`-- docs
```

## Yakın Vadeli Öncelikler

- Backend yapılandırmasını güvenli hale getirmek
- Admin panel ve mobilde bozuk karakter sorunlarını temizlemek
- Mobil uygulama ile backend akışlarını uçtan uca doğrulamak
- Ortam değişkenleri ve kurulum adımlarını netleştirmek
- Deploy hazırlıklarını yapmak

## Notlar

- `appsettings.json` içinde bağlantı bilgileri ve JWT anahtarı şu an placeholder durumda.
- `GET /api/Category` endpointi yalnızca aktif kategorileri döndürür.
- Dokümanlarda kaynak doğruluk önceliği her zaman koddadır.
