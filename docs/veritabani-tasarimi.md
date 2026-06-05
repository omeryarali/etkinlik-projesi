# Veritabanı Tasarımı

Son güncelleme: `2026-06-05`

Bu belge, backend tarafındaki temel veri modelini kodla uyumlu olacak şekilde özetler.

## Teknoloji

- `PostgreSQL`
- `Entity Framework Core`
- `EF Core Migrations`

## Tablolar

- `Users`
- `OrganizerProfiles`
- `EventCategories`
- `Events`
- `EventParticipants`
- `__EFMigrationsHistory`

## İlişki Özeti

```text
Users (1) -------- (0..1) OrganizerProfiles
OrganizerProfiles (1) ---- (N) Events
EventCategories (1) ------ (N) Events
Users (1) ---------------- (N) EventParticipants
Events (1) --------------- (N) EventParticipants
```

Kod tarafında ilişkiler `DeleteBehavior.Restrict` ile kurulmuştur.

## Users

Sistemdeki tüm kullanıcıları tutar.

| Alan | Tip | Açıklama |
|---|---|---|
| `Id` | `int` | Kullanıcı kimliği |
| `FullName` | `string` | Ad soyad |
| `Email` | `string` | E-posta |
| `PhoneNumber` | `string` | Telefon |
| `PasswordHash` | `string` | BCrypt hash değeri |
| `ProfileImageUrl` | `string` | Profil görseli adresi |
| `Role` | `string` | `Participant`, `Organizer`, `Admin` |
| `IsActive` | `bool` | Hesap aktif mi |
| `CreatedAt` | `DateTime` | Oluşturulma tarihi |

Kurallar:

- Yeni kullanıcı varsayılan olarak `Participant` rolüyle açılır.
- Şifre düz metin tutulmaz.
- `IsActive = false` olan kullanıcı giriş yapamaz.

## OrganizerProfiles

Organizer başvurusunu ve organizer profilini tutar.

| Alan | Tip | Açıklama |
|---|---|---|
| `Id` | `int` | Profil kimliği |
| `UserId` | `int` | Bağlı kullanıcı |
| `OrganizerName` | `string` | Görünen organizer adı |
| `OrganizerType` | `string` | Tür bilgisi |
| `Description` | `string` | Açıklama |
| `PhoneNumber` | `string` | Telefon |
| `InstagramUrl` | `string` | Sosyal medya bağlantısı |
| `City` | `string` | Şehir |
| `District` | `string` | İlçe |
| `Status` | `string` | Başvuru durumu |
| `RejectionReason` | `string` | Red sebebi |
| `CreatedAt` | `DateTime` | Başvuru tarihi |
| `ApprovedAt` | `DateTime?` | Onay tarihi |

`OrganizerType` örnekleri:

```text
Individual
Venue
Club
Institution
```

`Status` değerleri:

```text
Pending
Approved
Rejected
Suspended
```

Davranış:

- Bir kullanıcı için tek organizer profili beklenir.
- Onaylı profil güncellenirse tekrar `Pending` olur.
- Onaylı profil güncellendiğinde kullanıcı rolü tekrar `Participant` yapılır.

## EventCategories

Etkinlik sınıflandırması için kullanılır.

| Alan | Tip | Açıklama |
|---|---|---|
| `Id` | `int` | Kategori kimliği |
| `Name` | `string` | Kategori adı |
| `Description` | `string` | Açıklama |
| `IsActive` | `bool` | Aktiflik durumu |
| `CreatedAt` | `DateTime` | Oluşturulma tarihi |

Kurallar:

- Public listelemede yalnızca aktif kategoriler döner.
- Silme yerine `IsActive = false` yaklaşımı tercih edilir.

## Events

Organizer tarafından oluşturulan etkinlikleri tutar.

| Alan | Tip | Açıklama |
|---|---|---|
| `Id` | `int` | Etkinlik kimliği |
| `OrganizerProfileId` | `int` | Etkinlik sahibi organizer |
| `EventCategoryId` | `int` | Kategori |
| `Title` | `string` | Başlık |
| `Description` | `string` | Açıklama |
| `StartDate` | `DateTime` | Başlangıç |
| `EndDate` | `DateTime?` | Bitiş |
| `City` | `string` | Şehir |
| `District` | `string` | İlçe |
| `LocationName` | `string` | Mekan adı |
| `Address` | `string` | Adres |
| `Latitude` | `double?` | Enlem |
| `Longitude` | `double?` | Boylam |
| `Capacity` | `int` | Kontenjan |
| `IsPaid` | `bool` | Ücretli mi |
| `Price` | `decimal?` | Ücret |
| `CoverImageUrl` | `string` | Kapak görseli |
| `Rules` | `string` | Katılım kuralları |
| `Status` | `string` | Event durumu |
| `CreatedAt` | `DateTime` | Oluşturulma tarihi |
| `ApprovedAt` | `DateTime?` | Onay tarihi |

`Status` değerleri:

```text
Pending
Approved
Rejected
Cancelled
Completed
```

Kurallar:

- Public tarafta yalnızca `Approved` etkinlikler görünür.
- Güncellenen etkinlik tekrar `Pending` olur.
- `Cancelled` veya `Completed` etkinlik güncellenemez.
- Katılımcı sayısı aktif `Joined` kayıtları üzerinden hesaplanır.

## EventParticipants

Kullanıcıların etkinlik katılım kayıtlarını tutar.

| Alan | Tip | Açıklama |
|---|---|---|
| `Id` | `int` | Kayıt kimliği |
| `EventId` | `int` | Bağlı etkinlik |
| `UserId` | `int` | Bağlı kullanıcı |
| `Status` | `string` | Katılım durumu |
| `JoinedAt` | `DateTime` | Katılım zamanı |

`Status` değerleri:

```text
Joined
Cancelled
Attended
NoShow
```

Kurallar:

- Aynı kullanıcı aynı etkinliğe ikinci kez aktif `Joined` kaydı açamaz.
- Ayrılma işleminde kayıt silinmez, `Cancelled` yapılır.
- Organizer yoklama için `Attended` ve `NoShow` değerlerini kullanır.

## Tarih Yönetimi

Kod tarafında tarih alanları UTC mantığıyla ele alınır.

Örnek alanlar:

- `CreatedAt`
- `ApprovedAt`
- `StartDate`
- `EndDate`
- `JoinedAt`

Backend tarafında `DateTime.UtcNow` kullanımı tercih edilir.

## DTO Yapısı

Backend içindeki DTO klasörleri:

```text
Dtos/Auth
Dtos/Organizer
Dtos/Admin
Dtos/Category
Dtos/Event
Dtos/Common
```

Öne çıkan tipler:

- `AuthResponse`
- `OrganizerProfileResponse`
- `CategoryResponse`
- `EventResponse`
- `EventParticipantResponse`
- `PagedResponse<T>`

## Pagination Yapısı

Birden fazla liste endpointinde aşağıdaki ortak yapı kullanılır:

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

## İleride Eklenebilecek Tablolar

- `EventImages`
- `OrganizerImages`
- `Notifications`
- `Reports`
- `Payments`
- `Reviews`
- `PasswordResetTokens`
