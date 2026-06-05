# API Listesi

Son güncelleme: `2026-06-05`

Bu belge, repodaki mevcut backend controller'ları baz alınarak hazırlanmıştır.

## Lokal Adresler

- Backend: `http://localhost:5270`
- Swagger: `http://localhost:5270/swagger`
- Admin panel: `http://localhost:3000`
- Mobile Android emulator API adresi: `http://10.0.2.2:5270`

## Kimlik Doğrulama

JWT kullanılan endpointlerde aşağıdaki header beklenir:

```http
Authorization: Bearer <token>
```

## Ortak Pagination Formatı

Liste endpointlerinin çoğu aşağıdaki yapıyı döndürür:

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

Yeni kullanıcı oluşturur. Varsayılan rol `Participant` olur.

Örnek istek:

```json
{
  "fullName": "Ömer Yaralı",
  "email": "omer@test.com",
  "phoneNumber": "05555555555",
  "password": "123456"
}
```

### `POST /api/Auth/login`

E-posta ve şifre ile giriş yapar.

### `GET /api/Auth/me`

Yetki: giriş yapmış kullanıcı

Giriş yapan kullanıcının özet profilini döndürür.

### `PUT /api/Auth/profile`

Yetki: giriş yapmış kullanıcı

Örnek istek:

```json
{
  "fullName": "Ömer Yaralı Güncel",
  "phoneNumber": "05550001122",
  "profileImageUrl": "https://example.com/profile.jpg"
}
```

### `PUT /api/Auth/change-password`

Yetki: giriş yapmış kullanıcı

Örnek istek:

```json
{
  "currentPassword": "123456",
  "newPassword": "1234567"
}
```

## Organizer

### `POST /api/Organizer/apply`

Yetki: giriş yapmış kullanıcı

Organizer başvurusu oluşturur. Kayıt ilk olarak `Pending` olur.

Örnek istek:

```json
{
  "organizerName": "Ömer Organizasyon",
  "organizerType": "Individual",
  "description": "Bireysel etkinlikler düzenliyorum.",
  "phoneNumber": "05555555555",
  "instagramUrl": "https://instagram.com/test",
  "city": "Aydın",
  "district": "Nazilli"
}
```

### `GET /api/Organizer/my-profile`

Yetki: giriş yapmış kullanıcı

Kullanıcının organizer profilini döndürür.

### `PUT /api/Organizer/profile`

Yetki: giriş yapmış kullanıcı

Approved organizer profil güncellenirse profil tekrar `Pending` olur ve kullanıcı rolü tekrar `Participant` yapılır.

## Category

### `GET /api/Category`

Yetki: public

Yalnızca aktif kategorileri döndürür.

### `POST /api/Category`

Yetki: `Admin`

Yeni kategori oluşturur.

### `DELETE /api/Category/{id}`

Yetki: `Admin`

Hard delete yapmaz. Kategoriyi pasif hale çeker.

### `PUT /api/Category/{id}/activate`

Yetki: `Admin`

Pasif kategoriyi tekrar aktif yapar.

### `PUT /api/Category/{id}/deactivate`

Yetki: `Admin`

Aktif kategoriyi pasif yapar.

Not:

- Şu an admin için tüm kategorileri ayrı döndüren özel bir liste endpointi yok.

## Event

### `POST /api/Event`

Yetki: `Organizer`

Yeni etkinlik oluşturur. Oluşan kayıt ilk olarak `Pending` durumundadır.

Örnek gövde:

```json
{
  "eventCategoryId": 1,
  "title": "Nazilli Tavla Turnuvası",
  "description": "Keyifli bir tavla turnuvası düzenliyoruz.",
  "startDate": "2026-06-10T17:00:00Z",
  "endDate": "2026-06-10T20:00:00Z",
  "city": "Aydın",
  "district": "Nazilli",
  "locationName": "X Cafe",
  "address": "Nazilli merkez",
  "latitude": null,
  "longitude": null,
  "capacity": 32,
  "isPaid": false,
  "price": null,
  "coverImageUrl": "",
  "rules": "Eleme usulü oynanacaktır."
}
```

### `GET /api/Event/approved`

Yetki: public

Onaylı etkinlikleri listeler.

Kullanılabilen query parametreleri:

- `city`
- `district`
- `categoryId`
- `dateFilter`: `today`, `tomorrow`, `thisWeek`, `upcoming`
- `isPaid`
- `search`
- `sortBy`: `newest`, `popular`
- `onlyAvailable`
- `page`
- `pageSize`

Örnek:

```http
GET /api/Event/approved?city=Aydın&district=Nazilli&categoryId=1&dateFilter=upcoming&isPaid=false&search=tavla&sortBy=popular&onlyAvailable=true&page=1&pageSize=10
```

### `GET /api/Event/{id}`

Yetki: public

Onaylı tek bir etkinliğin detayını döndürür.

### `GET /api/Event/my-events`

Yetki: `Organizer`

Organizerin kendi etkinliklerini sayfalı döndürür.

### `PUT /api/Event/{id}`

Yetki: `Organizer`

Organizer kendi etkinliğini günceller. Güncelleme sonrası etkinlik tekrar `Pending` olur.

### `POST /api/Event/{id}/cancel`

Yetki: `Organizer`

Event durumunu `Cancelled` yapar.

### `POST /api/Event/{id}/complete`

Yetki: `Organizer`

Event durumunu `Completed` yapar.

### `POST /api/Event/{id}/join`

Yetki: giriş yapmış kullanıcı

Kullanıcıyı etkinliğe katılımcı olarak ekler.

### `POST /api/Event/{id}/leave`

Yetki: giriş yapmış kullanıcı

Katılım kaydını silmez, `Cancelled` yapar.

### `GET /api/Event/my-joined-events`

Yetki: giriş yapmış kullanıcı

Kullanıcının katıldığı etkinlikleri listeler.

### `GET /api/Event/{id}/participants`

Yetki: `Organizer`

Kendi etkinliğine ait katılımcıları sayfalı döndürür.

### `PUT /api/Event/{eventId}/participants/{userId}/attended`

Yetki: `Organizer`

Katılımcıyı `Attended` yapar.

### `PUT /api/Event/{eventId}/participants/{userId}/no-show`

Yetki: `Organizer`

Katılımcıyı `NoShow` yapar.

## Admin

Bu bölümdeki tüm endpointler `Admin` yetkisi ister.

### `GET /api/Admin/dashboard-stats`

Dashboard kartları için özet istatistik döndürür.

### `GET /api/Admin/users`

Query parametreleri:

- `role`
- `page`
- `pageSize`

### `PUT /api/Admin/users/{id}/activate`

Kullanıcıyı aktif yapar.

### `PUT /api/Admin/users/{id}/deactivate`

Kullanıcıyı pasif yapar.

### `GET /api/Admin/organizers`

Query parametreleri:

- `status`
- `page`
- `pageSize`

### `GET /api/Admin/organizers/pending`

Bekleyen organizer başvurularını listeler.

### `PUT /api/Admin/organizers/{id}/approve`

Organizer başvurusunu onaylar ve bağlı kullanıcıyı `Organizer` rolüne geçirir.

### `PUT /api/Admin/organizers/{id}/reject`

Organizer başvurusunu reddeder.

Örnek istek:

```json
{
  "rejectionReason": "Belgeler eksik."
}
```

### `PUT /api/Admin/organizers/{id}/suspend`

Organizeri askıya alır ve gerekiyorsa kullanıcı rolünü `Participant` yapar.

### `PUT /api/Admin/organizers/{id}/reactivate`

Organizeri tekrar aktif hale getirir ve kullanıcı rolünü `Organizer` yapar.

### `GET /api/Admin/events`

Query parametreleri:

- `status`
- `page`
- `pageSize`

### `GET /api/Admin/events/pending`

Bekleyen etkinlikleri listeler.

### `PUT /api/Admin/events/{id}/approve`

Eventi onaylar.

### `PUT /api/Admin/events/{id}/reject`

Eventi reddeder.

## Admin Panel Rotaları

### Mevcut sayfalar

- `/login`
- `/dashboard`
- `/organizers`
- `/events`
- `/users`
- `/categories`

### Sık kullanılan filtreler

```http
/events?status=Pending
/events?status=Approved
/events?status=Rejected
/events?status=Cancelled
/events?status=Completed

/organizers?status=Pending
/organizers?status=Approved
/organizers?status=Rejected
/organizers?status=Suspended

/users?role=Participant
/users?role=Organizer
/users?role=Admin
```
