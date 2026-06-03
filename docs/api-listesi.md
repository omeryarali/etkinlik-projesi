<!--
Etkinlik Projesi dokümantasyonu
Güncel kapsam: Backend MVP + Admin Panel MVP
-->
# API Listesi

Backend local adresi: `http://localhost:5270`  
Swagger: `http://localhost:5270/swagger`  
Admin panel local adresi: `http://localhost:3000`

---

## Auth

### Register
`POST /api/Auth/register`

Yeni kullanıcı oluşturur. Varsayılan rol: `Participant`.

Request:
```json
{
  "fullName": "Ömer Yaralı",
  "email": "omer@test.com",
  "phoneNumber": "05555555555",
  "password": "123456"
}
```

Response:
```json
{
  "userId": 1,
  "fullName": "Ömer Yaralı",
  "email": "omer@test.com",
  "phoneNumber": "05555555555",
  "profileImageUrl": "",
  "role": "Participant",
  "isActive": true,
  "createdAt": "2026-05-31T18:00:00Z",
  "token": "JWT_TOKEN"
}
```

### Login
`POST /api/Auth/login`

Request:
```json
{
  "email": "omer@test.com",
  "password": "123456"
}
```

Response:
```json
{
  "userId": 1,
  "fullName": "Ömer Yaralı",
  "email": "omer@test.com",
  "phoneNumber": "05555555555",
  "profileImageUrl": "",
  "role": "Admin",
  "isActive": true,
  "createdAt": "2026-05-31T18:00:00Z",
  "token": "JWT_TOKEN"
}
```

### Current User
`GET /api/Auth/me`

Yetki: `Authorization: Bearer JWT_TOKEN`

Giriş yapan kullanıcının bilgilerini döndürür.

### Profil Güncelle
`PUT /api/Auth/profile`

Yetki: `Authorization: Bearer JWT_TOKEN`

Request:
```json
{
  "fullName": "Ömer Yaralı Güncel",
  "phoneNumber": "05550001122",
  "profileImageUrl": "https://example.com/profile.jpg"
}
```

### Şifre Değiştir
`PUT /api/Auth/change-password`

Yetki: `Authorization: Bearer JWT_TOKEN`

Request:
```json
{
  "currentPassword": "123456",
  "newPassword": "1234567"
}
```

---

## Organizer

### Organizatör Başvurusu Yap
`POST /api/Organizer/apply`

Yetki: `Authorization: Bearer JWT_TOKEN`

Başvuru ilk olarak `Pending` durumunda oluşturulur.

Request:
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

### Kendi Organizatör Profilim
`GET /api/Organizer/my-profile`

Yetki: `Authorization: Bearer JWT_TOKEN`

### Organizatör Profil Güncelle
`PUT /api/Organizer/profile`

Yetki: `Authorization: Bearer JWT_TOKEN`

Onaylı organizatör profilini güncellerse profil tekrar `Pending` olur ve kullanıcı rolü `Participant` yapılır.

---

## Category

### Kategorileri Listele
`GET /api/Category`

Yetki: Public  
Sadece aktif kategorileri listeler.

### Kategori Oluştur
`POST /api/Category`

Yetki: `Authorization: Bearer ADMIN_TOKEN`

Request:
```json
{
  "name": "Turnuva",
  "description": "Turnuva ve yarışma etkinlikleri"
}
```

### Kategori Aktif Hale Getir
`PUT /api/Category/{id}/activate`

Yetki: `Authorization: Bearer ADMIN_TOKEN`

### Kategori Pasif Hale Getir
`PUT /api/Category/{id}/deactivate`

Yetki: `Authorization: Bearer ADMIN_TOKEN`  
Kategori silinmez, `IsActive = false` yapılır.

---

## Event

### Onaylı Etkinlikleri Listele
`GET /api/Event/approved`

Yetki: Public

Pagination:
```http
GET /api/Event/approved?page=1&pageSize=10
```

Filtreler:
```http
GET /api/Event/approved?city=Aydın
GET /api/Event/approved?district=Nazilli
GET /api/Event/approved?categoryId=1
GET /api/Event/approved?dateFilter=today
GET /api/Event/approved?dateFilter=tomorrow
GET /api/Event/approved?dateFilter=thisWeek
GET /api/Event/approved?dateFilter=upcoming
GET /api/Event/approved?isPaid=false
GET /api/Event/approved?search=tavla
GET /api/Event/approved?sortBy=date
GET /api/Event/approved?sortBy=newest
GET /api/Event/approved?sortBy=popular
GET /api/Event/approved?onlyAvailable=true
```

Tüm filtreler:
```http
GET /api/Event/approved?city=Aydın&district=Nazilli&categoryId=1&dateFilter=upcoming&isPaid=false&search=tavla&sortBy=popular&onlyAvailable=true&page=1&pageSize=10
```

Response:
```json
{
  "items": [
    {
      "id": 1,
      "organizerProfileId": 1,
      "organizerName": "Ömer Organizasyon",
      "eventCategoryId": 1,
      "categoryName": "Turnuva",
      "title": "Nazilli Tavla Turnuvası",
      "description": "Keyifli bir tavla turnuvası düzenliyoruz.",
      "startDate": "2026-06-01T20:00:00Z",
      "endDate": "2026-06-01T23:00:00Z",
      "city": "Aydın",
      "district": "Nazilli",
      "locationName": "X Cafe",
      "address": "Nazilli merkez",
      "latitude": null,
      "longitude": null,
      "capacity": 32,
      "participantCount": 1,
      "isPaid": false,
      "price": null,
      "coverImageUrl": "",
      "rules": "Eleme usulü oynanacaktır.",
      "status": "Approved",
      "createdAt": "2026-05-31T18:00:00Z",
      "approvedAt": "2026-05-31T18:10:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

### Etkinlik Detayı
`GET /api/Event/{id}`

Yetki: Public

### Etkinlik Oluştur
`POST /api/Event`

Yetki: `Authorization: Bearer ORGANIZER_TOKEN`

Etkinlik ilk olarak `Pending` olur.

### Etkinlik Güncelle
`PUT /api/Event/{id}`

Yetki: `Authorization: Bearer ORGANIZER_TOKEN`  
Güncellenen etkinlik tekrar `Pending` olur.

### Kendi Etkinliklerim
`GET /api/Event/my-events?page=1&pageSize=10`

Yetki: `Authorization: Bearer ORGANIZER_TOKEN`

### Etkinliği İptal Et
`POST /api/Event/{id}/cancel`

Yetki: `Authorization: Bearer ORGANIZER_TOKEN`  
Durum: `Cancelled`

### Etkinliği Tamamlandı Yap
`POST /api/Event/{id}/complete`

Yetki: `Authorization: Bearer ORGANIZER_TOKEN`  
Durum: `Completed`

### Etkinliğe Katıl
`POST /api/Event/{id}/join`

Yetki: `Authorization: Bearer JWT_TOKEN`

### Etkinlikten Ayrıl
`POST /api/Event/{id}/leave`

Yetki: `Authorization: Bearer JWT_TOKEN`  
Katılım durumu `Cancelled` yapılır.

### Katıldığım Etkinlikler
`GET /api/Event/my-joined-events?page=1&pageSize=10`

Yetki: `Authorization: Bearer JWT_TOKEN`

### Etkinlik Katılımcıları
`GET /api/Event/{id}/participants?page=1&pageSize=20`

Yetki: `Authorization: Bearer ORGANIZER_TOKEN`

### Katılımcıyı Geldi Olarak İşaretle
`PUT /api/Event/{eventId}/participants/{userId}/attended`

Yetki: `Authorization: Bearer ORGANIZER_TOKEN`  
Durum: `Attended`

### Katılımcıyı Gelmedi Olarak İşaretle
`PUT /api/Event/{eventId}/participants/{userId}/no-show`

Yetki: `Authorization: Bearer ORGANIZER_TOKEN`  
Durum: `NoShow`

---

## Admin

Tüm Admin endpointleri için `Authorization: Bearer ADMIN_TOKEN` gereklidir.

### Dashboard İstatistikleri
`GET /api/Admin/dashboard-stats`

### Kullanıcıları Listele
```http
GET /api/Admin/users?page=1&pageSize=10
GET /api/Admin/users?role=Participant&page=1&pageSize=10
GET /api/Admin/users?role=Organizer&page=1&pageSize=10
GET /api/Admin/users?role=Admin&page=1&pageSize=10
```

### Kullanıcı Aktif/Pasif Yap
```http
PUT /api/Admin/users/{id}/activate
PUT /api/Admin/users/{id}/deactivate
```

### Organizatörleri Listele
```http
GET /api/Admin/organizers?page=1&pageSize=10
GET /api/Admin/organizers?status=Pending&page=1&pageSize=10
GET /api/Admin/organizers?status=Approved&page=1&pageSize=10
GET /api/Admin/organizers?status=Rejected&page=1&pageSize=10
GET /api/Admin/organizers?status=Suspended&page=1&pageSize=10
```

### Bekleyen Organizatör Başvuruları
`GET /api/Admin/organizers/pending`

### Organizatör İşlemleri
```http
PUT /api/Admin/organizers/{id}/approve
PUT /api/Admin/organizers/{id}/reject
PUT /api/Admin/organizers/{id}/suspend
PUT /api/Admin/organizers/{id}/reactivate
```

### Etkinlikleri Listele
```http
GET /api/Admin/events?page=1&pageSize=10
GET /api/Admin/events?status=Pending&page=1&pageSize=10
GET /api/Admin/events?status=Approved&page=1&pageSize=10
GET /api/Admin/events?status=Rejected&page=1&pageSize=10
GET /api/Admin/events?status=Cancelled&page=1&pageSize=10
GET /api/Admin/events?status=Completed&page=1&pageSize=10
```

### Bekleyen Etkinlikler
`GET /api/Admin/events/pending`

### Etkinlik Onayla / Reddet
```http
PUT /api/Admin/events/{id}/approve
PUT /api/Admin/events/{id}/reject
```

---

## Admin Panel Sayfaları

| Sayfa | Açıklama |
|---|---|
| `/login` | Admin giriş ekranı |
| `/dashboard` | Dashboard istatistik ekranı |
| `/organizers` | Organizatör yönetimi |
| `/events` | Etkinlik yönetimi |
| `/users` | Kullanıcı yönetimi |
| `/categories` | Kategori yönetimi |

URL filtreleri:

```http
/events?status=Pending
/events?status=Approved
/events?status=Rejected
/events?status=Cancelled
/events?status=Completed

/organizers?status=Pending
/organizers?status=Approved
/organizers?status=Suspended

/users?role=Participant
/users?role=Organizer
/users?role=Admin
```

---

## Durum Değerleri

### User Role
```text
Participant
Organizer
Admin
```

### OrganizerProfile Status
```text
Pending
Approved
Rejected
Suspended
```

### Event Status
```text
Pending
Approved
Rejected
Cancelled
Completed
```

### EventParticipant Status
```text
Joined
Cancelled
Attended
NoShow
```

---

## Pagination Response Formatı

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
