# Veritabani Tasarimi

Son guncelleme: `2026-06-07`

## Teknoloji

- PostgreSQL
- Entity Framework Core
- EF Core Migrations

## Ana Tablolar

- `Users`
- `OrganizerProfiles`
- `EventCategories`
- `Events`
- `EventParticipants`
- `__EFMigrationsHistory`

## Iliski Ozeti

```text
Users (1) -------- (0..1) OrganizerProfiles
OrganizerProfiles (1) ---- (N) Events
EventCategories (1) ------ (N) Events
Users (1) ---------------- (N) EventParticipants
Events (1) --------------- (N) EventParticipants
```

Tum ana iliskiler `DeleteBehavior.Restrict` ile kuruludur.

## Users

| Alan | Tip | Aciklama |
|---|---|---|
| `Id` | `int` | kullanici id |
| `FullName` | `string` | gorunen ad soyad |
| `Email` | `string` | kullanici e-postasi |
| `NormalizedEmail` | `string` | lower-case tekillik anahtari |
| `PhoneNumber` | `string` | telefon |
| `PasswordHash` | `string` | BCrypt hash |
| `ProfileImageUrl` | `string` | profil gorseli |
| `Role` | `string` | Participant / Organizer / Admin |
| `IsActive` | `bool` | hesap aktif mi |
| `TokenVersion` | `int` | oturum invalidation sayaci |
| `CreatedAt` | `DateTime` | olusturma tarihi |

Kurallar:

- `NormalizedEmail` unique index altindadir.
- sifre duz metin tutulmaz.
- `IsActive = false` kullanici yeni token alamaz, mevcut tokenlari da reddedilir.

## OrganizerProfiles

| Alan | Tip | Aciklama |
|---|---|---|
| `Id` | `int` | profil id |
| `UserId` | `int` | bagli kullanici |
| `OrganizerName` | `string` | gorunen organizer adi |
| `OrganizerType` | `string` | tur bilgisi |
| `Description` | `string` | aciklama |
| `PhoneNumber` | `string` | telefon |
| `InstagramUrl` | `string` | sosyal baglanti |
| `City` | `string` | sehir |
| `District` | `string` | ilce |
| `Status` | `string` | Pending / Approved / Rejected / Suspended |
| `RejectionReason` | `string` | red notu |
| `CreatedAt` | `DateTime` | basvuru tarihi |
| `ApprovedAt` | `DateTime?` | onay tarihi |

Kurallar:

- `UserId` unique index altindadir.
- bir kullanici icin tek organizer profili bulunur.

## EventCategories

| Alan | Tip | Aciklama |
|---|---|---|
| `Id` | `int` | kategori id |
| `Name` | `string` | kategori adi |
| `Description` | `string` | aciklama |
| `IsActive` | `bool` | aktiflik |
| `CreatedAt` | `DateTime` | olusturma tarihi |

## Events

| Alan | Tip | Aciklama |
|---|---|---|
| `Id` | `int` | etkinlik id |
| `OrganizerProfileId` | `int` | etkinlik sahibi organizer |
| `EventCategoryId` | `int` | kategori |
| `Title` | `string` | baslik |
| `Description` | `string` | aciklama |
| `StartDate` | `DateTime` | baslangic |
| `EndDate` | `DateTime?` | bitis |
| `City` | `string` | sehir |
| `District` | `string` | ilce |
| `LocationName` | `string` | mekan adi |
| `Address` | `string` | acik adres |
| `Latitude` | `double?` | enlem |
| `Longitude` | `double?` | boylam |
| `Capacity` | `int` | kontenjan |
| `IsPaid` | `bool` | ucretli mi |
| `Price` | `decimal?` | fiyat |
| `CoverImageUrl` | `string` | kapak gorseli |
| `Rules` | `string` | kurallar |
| `Status` | `string` | Pending / Approved / Rejected / Cancelled / Completed |
| `CreatedAt` | `DateTime` | olusturma tarihi |
| `ApprovedAt` | `DateTime?` | onay tarihi |

## EventParticipants

| Alan | Tip | Aciklama |
|---|---|---|
| `Id` | `int` | katilim kaydi id |
| `EventId` | `int` | bagli etkinlik |
| `UserId` | `int` | bagli kullanici |
| `Status` | `string` | Joined / Cancelled / Attended / NoShow |
| `JoinedAt` | `DateTime` | son katilim zamani |

Kurallar:

- `EventId + UserId` unique index altindadir.
- ayni kullanici ayni etkinlik icin birden fazla satirla tutulmaz.
- ayrilma kaydi silmez, durumu `Cancelled` yapar.

## Migration Notu

`SecurityHardening` migration'i:

- `NormalizedEmail` kolonunu ekler ve mevcut kullanicilari normalize eder
- duplicate `EventParticipants` kayitlarini son kaydi koruyacak sekilde temizler
- kritik unique kurallari ekler

## DTO Katmanlari

```text
Dtos/Auth
Dtos/Organizer
Dtos/Admin
Dtos/Category
Dtos/Event
Dtos/Common
```
