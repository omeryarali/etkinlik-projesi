# API Listesi

Son guncelleme: `2026-06-07`

Bu belge, repo icindeki mevcut controller implementasyonlarini ozetler.

## Lokal Adresler

- Backend: `http://localhost:5270`
- Swagger: `http://localhost:5270/swagger`
- Admin panel: `http://localhost:3000`
- Mobile Android emulator fallback API: `http://10.0.2.2:5270`

## Ortam Bazli API Adresi

- Admin panel: `NEXT_PUBLIC_API_BASE_URL`
- Mobile: `EXPO_PUBLIC_API_BASE_URL`

## Kimlik Dogrulama

JWT gereken endpointlerde asagidaki header kullanilir:

```http
Authorization: Bearer <token>
```

## Genel Guvenlik Kurallari

- `POST /api/Auth/register` ve `POST /api/Auth/login` rate limit altindadir.
- JWT token omru varsayilan olarak `12 saat`tir (`Jwt:TokenLifetimeHours`).
- Kullanici pasifse, rolu degismisse veya `TokenVersion` eskimisse token reddedilir.
- Production ortaminda `Cors:AllowedOrigins` bos birakilamaz.

## Pagination Formati

Birden fazla liste endpointi su yapida cevap doner:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "totalCount": 0,
  "totalPages": 0,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

## Auth

### `POST /api/Auth/register`

Yeni kullanici olusturur.

Kurallar:

- varsayilan rol `Participant`
- e-posta tekil tutulur (`NormalizedEmail`)
- sifre en az 8 karakter, harf ve rakam icermelidir

Ornek:

```json
{
  "fullName": "Omer Yarali",
  "email": "omer@test.com",
  "phoneNumber": "05555555555",
  "password": "Bikatil2026"
}
```

### `POST /api/Auth/login`

E-posta ve sifre ile token dondurur.

### `GET /api/Auth/me`

Yetki: login olmus kullanici

Token icindeki kimlige gore guncel kullanici ozetini doner.

### `PUT /api/Auth/profile`

Yetki: login olmus kullanici

Ad soyad, telefon ve profil gorseli gunceller.

### `PUT /api/Auth/change-password`

Yetki: login olmus kullanici

Sifreyi gunceller ve mevcut oturumlari gecersiz kilar.

## Organizer

### `POST /api/Organizer/apply`

Yetki: login olmus kullanici

Organizer profili olusturur. Bir kullanici icin tek organizer profili vardir.

### `GET /api/Organizer/my-profile`

Yetki: login olmus kullanici

Kullaniciya ait organizer profilini getirir.

### `PUT /api/Organizer/profile`

Yetki: login olmus kullanici

Approved organizer profil guncellenirse:

- profil `Pending` olur
- `ApprovedAt` temizlenir
- kullanici rolu `Participant` olur
- eski organizer tokenlari gecersizlesir

## Category

### `GET /api/Category`

Yetki: public

Yalnizca aktif kategorileri doner.

### `POST /api/Category`

Yetki: `Admin`

Yeni kategori olusturur.

### `PUT /api/Category/{id}/activate`

Yetki: `Admin`

Pasif kategoriyi aktif yapar.

### `PUT /api/Category/{id}/deactivate`

Yetki: `Admin`

Aktif kategoriyi pasif yapar.

## Event

### `POST /api/Event`

Yetki: `Organizer`

Yeni etkinlik olusturur. Kayit ilk asamada `Pending` olur.

### `GET /api/Event/approved`

Yetki: public

Approved etkinlikleri listeler.

Desteklenen query parametreleri:

- `city`
- `district`
- `categoryId`
- `dateFilter`
- `isPaid`
- `search`
- `sortBy`
- `onlyAvailable`
- `page`
- `pageSize`

### `GET /api/Event/{id}`

Yetki: public

Tek bir approved etkinlik detayini dondurur.

### `GET /api/Event/my-events`

Yetki: `Organizer`

Organizerin kendi etkinliklerini sayfali getirir.

### `PUT /api/Event/{id}`

Yetki: `Organizer`

Etkinligi gunceller. Guncellenen etkinlik tekrar `Pending` olur.

### `POST /api/Event/{id}/cancel`

Yetki: `Organizer`

Etkinligi `Cancelled` yapar.

### `POST /api/Event/{id}/complete`

Yetki: `Organizer`

Etkinligi `Completed` yapar.

### `POST /api/Event/{id}/join`

Yetki: login olmus kullanici

Kurallar:

- ayni kullanici ayni etkinlikte tek kayitla tutulur
- yeniden katilim gerekiyorsa mevcut kayit `Joined` olarak guncellenir
- kapasite kontrolu transaction icinde yapilir

### `POST /api/Event/{id}/leave`

Yetki: login olmus kullanici

Kaydi silmez, `Cancelled` yapar.

### `GET /api/Event/my-joined-events`

Yetki: login olmus kullanici

Kullaniciya ait aktif katilimlari listeler.

### `GET /api/Event/{id}/participants`

Yetki: `Organizer`

Kendi etkinligine ait katilimcilari getirir.

### `PUT /api/Event/{eventId}/participants/{userId}/attended`

Yetki: `Organizer`

Katilimci durumunu `Attended` yapar.

### `PUT /api/Event/{eventId}/participants/{userId}/no-show`

Yetki: `Organizer`

Katilimci durumunu `NoShow` yapar.

## Admin

Bu bolumdeki tum endpointler `Admin` yetkisi ister.

### `GET /api/Admin/dashboard-stats`

Dashboard ozet kartlari icin istatistik doner.

### `GET /api/Admin/users`

Query:

- `role`
- `page`
- `pageSize`

### `PUT /api/Admin/users/{id}/activate`

Kullaniciyi aktif yapar ve kullanici oturumlarini yeniler.

### `PUT /api/Admin/users/{id}/deactivate`

Kullaniciyi pasif yapar ve eski tokenlari gecersiz kilar.

### `GET /api/Admin/organizers`

Query:

- `status`
- `page`
- `pageSize`

### `PUT /api/Admin/organizers/{id}/approve`

Organizer basvurusunu onaylar, kullaniciyi `Organizer` yapar.

### `PUT /api/Admin/organizers/{id}/reject`

Organizer basvurusunu reddeder.

### `PUT /api/Admin/organizers/{id}/suspend`

Organizeri askiya alir. Gerekirse rol `Participant` olur.

### `PUT /api/Admin/organizers/{id}/reactivate`

Organizeri tekrar aktif eder ve rolu `Organizer` yapar.

### `GET /api/Admin/events`

Query:

- `status`
- `page`
- `pageSize`

### `PUT /api/Admin/events/{id}/approve`

Etkinligi onaylar.

### `PUT /api/Admin/events/{id}/reject`

Etkinligi reddeder.
