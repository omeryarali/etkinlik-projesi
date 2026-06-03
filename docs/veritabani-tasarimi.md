<!--
Etkinlik Projesi dokümantasyonu
Güncel kapsam: Backend MVP + Admin Panel MVP
-->
# Veritabanı Tasarımı

Bu dosya, Etkinlik Projesi backend tarafında kullanılan veritabanı tablolarını, alanlarını ve tablolar arası ilişkileri açıklar.

---

## Kullanılan Teknolojiler

```text
Veritabanı: PostgreSQL
ORM: Entity Framework Core
Backend: ASP.NET Core Web API
Migration Yönetimi: EF Core Migrations
```

---

## Temel Tablolar

```text
Users
OrganizerProfiles
EventCategories
Events
EventParticipants
__EFMigrationsHistory
```

---

## Genel İlişki Yapısı

```text
Users
  └── OrganizerProfiles
        └── Events
              ├── EventCategories
              └── EventParticipants
                    └── Users
```

---

## Users

Sistemdeki tüm kullanıcıları tutar.

Roller:

```text
Participant
Organizer
Admin
```

Alanlar:

| Alan | Tip | Açıklama |
|---|---|---|
| Id | int | Kullanıcı kimliği |
| FullName | string | Ad soyad |
| Email | string | E-posta |
| PhoneNumber | string | Telefon |
| PasswordHash | string | BCrypt hash |
| ProfileImageUrl | string | Profil görseli URL |
| Role | string | Kullanıcı rolü |
| IsActive | bool | Aktif mi |
| CreatedAt | DateTime | Oluşturulma tarihi |

Notlar:

- Şifreler düz metin tutulmaz.
- Kullanıcı varsayılan olarak `Participant` oluşturulur.
- `IsActive = false` olan kullanıcı login olamaz.

---

## OrganizerProfiles

Organizatör başvurularını ve profil bilgilerini tutar.

Alanlar:

| Alan | Tip | Açıklama |
|---|---|---|
| Id | int | Organizatör profil kimliği |
| UserId | int | Kullanıcı |
| OrganizerName | string | Organizatör adı |
| OrganizerType | string | Organizatör tipi |
| Description | string | Açıklama |
| PhoneNumber | string | Telefon |
| InstagramUrl | string | Instagram linki |
| City | string | Şehir |
| District | string | İlçe |
| Status | string | Başvuru durumu |
| RejectionReason | string | Red sebebi |
| CreatedAt | DateTime | Oluşturulma tarihi |
| ApprovedAt | DateTime? | Onay tarihi |

OrganizerType:

```text
Individual
Venue
Club
Institution
```

Status:

```text
Pending
Approved
Rejected
Suspended
```

İlişki:

```text
OrganizerProfiles.UserId → Users.Id
```

Onaylı profil güncellenirse:

```text
OrganizerProfile.Status = Pending
OrganizerProfile.ApprovedAt = null
User.Role = Participant
```

---

## EventCategories

Etkinlik kategorilerini tutar.

Alanlar:

| Alan | Tip | Açıklama |
|---|---|---|
| Id | int | Kategori kimliği |
| Name | string | Kategori adı |
| Description | string | Açıklama |
| IsActive | bool | Aktif mi |
| CreatedAt | DateTime | Oluşturulma tarihi |

Notlar:

- Sadece `IsActive = true` olan kategoriler kullanıcı tarafında listelenir.
- Kategori silinmez, pasif hale getirilir.
- Bu yaklaşım bağlı etkinliklerin ilişkisini bozmaz.

---

## Events

Organizatörler tarafından oluşturulan etkinlikleri tutar.

Alanlar:

| Alan | Tip | Açıklama |
|---|---|---|
| Id | int | Etkinlik kimliği |
| OrganizerProfileId | int | Organizatör profili |
| EventCategoryId | int | Kategori |
| Title | string | Başlık |
| Description | string | Açıklama |
| StartDate | DateTime | Başlangıç |
| EndDate | DateTime? | Bitiş |
| City | string | Şehir |
| District | string | İlçe |
| LocationName | string | Konum adı |
| Address | string | Adres |
| Latitude | double? | Enlem |
| Longitude | double? | Boylam |
| Capacity | int | Kontenjan |
| IsPaid | bool | Ücretli mi |
| Price | decimal? | Fiyat |
| CoverImageUrl | string | Kapak görseli |
| Rules | string | Kurallar |
| Status | string | Etkinlik durumu |
| CreatedAt | DateTime | Oluşturulma |
| ApprovedAt | DateTime? | Onay tarihi |

Status:

```text
Pending
Approved
Rejected
Cancelled
Completed
```

İlişkiler:

```text
Events.OrganizerProfileId → OrganizerProfiles.Id
Events.EventCategoryId → EventCategories.Id
```

Notlar:

- Kullanıcı tarafında sadece `Approved` etkinlikler görünür.
- Güncellenen etkinlik tekrar `Pending` olur.
- İptal edilen etkinlik `Cancelled` olur.
- Tamamlanan etkinlik `Completed` olur.
- Katılımcı sayısı aktif `Joined` kayıtları üzerinden hesaplanır.

---

## EventParticipants

Kullanıcıların etkinlik katılımlarını tutar.

Alanlar:

| Alan | Tip | Açıklama |
|---|---|---|
| Id | int | Katılım kimliği |
| EventId | int | Etkinlik |
| UserId | int | Kullanıcı |
| Status | string | Katılım durumu |
| JoinedAt | DateTime | Katılım tarihi |

Status:

```text
Joined
Cancelled
Attended
NoShow
```

İlişkiler:

```text
EventParticipants.EventId → Events.Id
EventParticipants.UserId → Users.Id
```

Notlar:

- Aynı kullanıcı aynı etkinliğe ikinci kez aktif olarak katılamaz.
- Ayrılma işleminde kayıt silinmez, `Cancelled` yapılır.
- Yoklama için `Attended` ve `NoShow` kullanılır.

---

## __EFMigrationsHistory

Entity Framework Core tarafından otomatik oluşturulur. Migration geçmişini takip eder.

---

## İlişki Diyagramı

```text
Users
  Id
  FullName
  Email
  Role
   │
   │ 1 - 1
   ▼
OrganizerProfiles
  Id
  UserId
  OrganizerName
  Status
   │
   │ 1 - N
   ▼
Events
  Id
  OrganizerProfileId
  EventCategoryId
  Title
  Status
   ▲
   │ N - 1
EventCategories
  Id
  Name
  IsActive

Events
  Id
   │
   │ 1 - N
   ▼
EventParticipants
  Id
  EventId
  UserId
  Status
   ▲
   │ N - 1
Users
  Id
  FullName
  Email
```

---

## Silme Davranışı

İlişkilerde genel olarak `DeleteBehavior.Restrict` tercih edilir.

Amaç:

- Kullanıcı silinirse organizatör başvurusunun otomatik silinmemesi
- Etkinlik silinirse katılım kayıtlarının kontrolsüz silinmemesi
- Kategori silinirse bağlı etkinliklerin bozulmaması

İleride `Soft Delete` eklenebilir.

---

## Tarih Yönetimi

Tarih alanlarında UTC mantığı tercih edilir.

Örnek alanlar:

```text
CreatedAt
ApprovedAt
StartDate
EndDate
JoinedAt
```

Backend tarafında:

```csharp
DateTime.UtcNow
```

kullanılması önerilir.

---

## Pagination Response Yapısı

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

Kullanılan endpointler:

```http
GET /api/Admin/users?page=1&pageSize=10
GET /api/Admin/events?page=1&pageSize=10
GET /api/Admin/organizers?page=1&pageSize=10
GET /api/Event/approved?page=1&pageSize=10
GET /api/Event/my-events?page=1&pageSize=10
GET /api/Event/my-joined-events?page=1&pageSize=10
GET /api/Event/{id}/participants?page=1&pageSize=20
```

---

## DTO Yapıları

```text
Dtos/Auth
Dtos/Organizer
Dtos/Admin
Dtos/Category
Dtos/Event
Dtos/Common
```

Auth:

```text
RegisterRequest
LoginRequest
AuthResponse
UpdateProfileRequest
ChangePasswordRequest
```

Organizer:

```text
CreateOrganizerProfileRequest
UpdateOrganizerProfileRequest
OrganizerProfileResponse
```

Admin:

```text
AdminUserResponse
AdminDashboardStatsResponse
RejectOrganizerRequest
```

Category:

```text
CreateCategoryRequest
CategoryResponse
```

Event:

```text
CreateEventRequest
UpdateEventRequest
EventResponse
EventParticipantResponse
```

Common:

```text
PagedResponse<T>
```

---

## İleride Eklenebilecek Tablolar

```text
EventImages
OrganizerImages
Notifications
Reports
Payments
FeaturedEvents
Reviews
PasswordResetTokens
```

---

## Genel Özet

Veritabanı tasarımı şu iş akışını destekler:

```text
Kullanıcı kayıt olur.
Kullanıcı organizatör başvurusu yapar.
Admin organizatörü onaylar.
Organizer etkinlik oluşturur.
Admin etkinliği onaylar.
Katılımcılar etkinliği görür.
Katılımcılar etkinliğe katılır.
Katılımcılar etkinlikten ayrılabilir.
Organizer katılımcıları yönetebilir.
Admin kullanıcı, organizatör, etkinlik ve kategorileri yönetebilir.
```
