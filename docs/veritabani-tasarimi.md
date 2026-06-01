\# Veritabanı Tasarımı



Bu dosya, Etkinlik Projesi backend tarafında kullanılan veritabanı tablolarını, alanlarını ve tablolar arası ilişkileri açıklamak için hazırlanmıştır.



Proje veritabanı olarak PostgreSQL kullanmaktadır.



\---



\# Kullanılan Teknolojiler



```text

Veritabanı: PostgreSQL

ORM: Entity Framework Core

Backend: ASP.NET Core Web API

Migration Yönetimi: EF Core Migrations

```



\---



\# Veritabanı Adı



Local geliştirme ortamında kullanılan veritabanı adı:



```text

EtkinlikProjesiDb

```



\---



\# Temel Tablolar



Projede şu ana kadar kullanılan temel tablolar:



```text

Users

OrganizerProfiles

EventCategories

Events

EventParticipants

\_\_EFMigrationsHistory

```



\---



\# Tablo İlişkileri Genel Bakış



Temel ilişki yapısı şu şekildedir:



```text

Users

&#x20; └── OrganizerProfiles

&#x20;       └── Events

&#x20;             ├── EventCategories

&#x20;             └── EventParticipants

&#x20;                   └── Users

```



Daha açıklayıcı hali:



```text

Bir User, organizatör başvurusu yaparsa bir OrganizerProfile kaydına sahip olur.



Bir OrganizerProfile, birden fazla Event oluşturabilir.



Bir Event, bir EventCategory kaydına bağlıdır.



Bir Event, birden fazla EventParticipant kaydına sahip olabilir.



Bir User, birden fazla EventParticipant kaydına sahip olabilir.

```



\---



\# 1. Users Tablosu



`Users` tablosu, sistemdeki tüm kullanıcıları tutar.



Bu kullanıcılar şu rollerden birine sahip olabilir:



```text

Participant

Organizer

Admin

```



Kullanıcı ilk kayıt olduğunda varsayılan olarak:



```text

Participant

```



rolüyle oluşturulur.



\---



\## Users Alanları



| Alan            | Tip      | Açıklama                               |

| --------------- | -------- | -------------------------------------- |

| Id              | int      | Kullanıcının benzersiz kimliği         |

| FullName        | string   | Kullanıcının ad soyad bilgisi          |

| Email           | string   | Kullanıcının e-posta adresi            |

| PhoneNumber     | string   | Kullanıcının telefon numarası          |

| PasswordHash    | string   | BCrypt ile hashlenmiş şifre            |

| ProfileImageUrl | string   | Kullanıcı profil fotoğrafı URL bilgisi |

| Role            | string   | Kullanıcı rolü                         |

| IsActive        | bool     | Kullanıcının aktif olup olmadığı       |

| CreatedAt       | DateTime | Kullanıcının oluşturulma tarihi        |



\---



\## Users Örnek Kayıt



```json

{

&#x20; "id": 1,

&#x20; "fullName": "Ömer Yaralı",

&#x20; "email": "omer@test.com",

&#x20; "phoneNumber": "05555555555",

&#x20; "passwordHash": "BCryptHashValue",

&#x20; "profileImageUrl": "",

&#x20; "role": "Participant",

&#x20; "isActive": true,

&#x20; "createdAt": "2026-05-31T18:00:00Z"

}

```



\---



\## Users Notları



\* Şifreler düz metin olarak tutulmaz.

\* Şifreler BCrypt ile hashlenir.

\* Kullanıcı kayıt olduğunda `Role = Participant` olur.

\* Admin onayı sonrası kullanıcı `Organizer` rolüne geçebilir.

\* Admin kullanıcı ilk aşamada manuel olarak veritabanından atanabilir.

\* `IsActive = false` yapılırsa kullanıcı giriş yapamaz.



\---



\# 2. OrganizerProfiles Tablosu



`OrganizerProfiles` tablosu, organizatör başvurularını ve organizatör profil bilgilerini tutar.



Bir kullanıcı organizatör olmak istediğinde bu tabloya kayıt açılır.



Başvuru ilk olarak:



```text

Pending

```



durumunda oluşur.



Admin başvuruyu onaylarsa:



```text

Approved

```



durumuna geçer.



\---



\## OrganizerProfiles Alanları



| Alan            | Tip       | Açıklama                          |

| --------------- | --------- | --------------------------------- |

| Id              | int       | Organizatör profil kimliği        |

| UserId          | int       | Başvuruyu yapan kullanıcı         |

| OrganizerName   | string    | Organizatör adı                   |

| OrganizerType   | string    | Organizatör tipi                  |

| Description     | string    | Organizatör açıklaması            |

| PhoneNumber     | string    | İletişim telefonu                 |

| InstagramUrl    | string    | Instagram veya sosyal medya linki |

| City            | string    | Şehir                             |

| District        | string    | İlçe                              |

| Status          | string    | Başvuru durumu                    |

| RejectionReason | string    | Reddedilme sebebi                 |

| CreatedAt       | DateTime  | Başvuru oluşturulma tarihi        |

| ApprovedAt      | DateTime? | Onaylanma tarihi                  |



\---



\## OrganizerType Değerleri



İlk aşamada kullanılabilecek organizatör tipleri:



```text

Individual

Venue

Club

Institution

```



Açıklamaları:



| Değer       | Açıklama                          |

| ----------- | --------------------------------- |

| Individual  | Bireysel organizatör              |

| Venue       | Kafe, işletme, mekan              |

| Club        | Kulüp veya topluluk               |

| Institution | Kurum, okul, belediye, dernek vb. |



\---



\## OrganizerProfile Status Değerleri



```text

Pending

Approved

Rejected

Suspended

```



| Durum     | Açıklama                    |

| --------- | --------------------------- |

| Pending   | Admin onayı bekliyor        |

| Approved  | Admin tarafından onaylandı  |

| Rejected  | Admin tarafından reddedildi |

| Suspended | Askıya alındı               |



\---



\## OrganizerProfiles Örnek Kayıt



```json

{

&#x20; "id": 1,

&#x20; "userId": 1,

&#x20; "organizerName": "Ömer Organizasyon",

&#x20; "organizerType": "Individual",

&#x20; "description": "Bireysel etkinlikler ve halı saha organizasyonları düzenliyorum.",

&#x20; "phoneNumber": "05555555555",

&#x20; "instagramUrl": "https://instagram.com/test",

&#x20; "city": "Aydın",

&#x20; "district": "Nazilli",

&#x20; "status": "Pending",

&#x20; "rejectionReason": "",

&#x20; "createdAt": "2026-05-31T18:00:00Z",

&#x20; "approvedAt": null

}

```



\---



\## OrganizerProfiles İlişkileri



```text

OrganizerProfiles.UserId → Users.Id

```



Bir kullanıcı en fazla bir organizatör profiline sahip olacak şekilde tasarlanmıştır.



\---



\# 3. EventCategories Tablosu



`EventCategories` tablosu, etkinlik kategorilerini tutar.



Etkinlikler bir kategoriye bağlı oluşturulur.



\---



\## EventCategories Alanları



| Alan        | Tip      | Açıklama                        |

| ----------- | -------- | ------------------------------- |

| Id          | int      | Kategori kimliği                |

| Name        | string   | Kategori adı                    |

| Description | string   | Kategori açıklaması             |

| IsActive    | bool     | Kategorinin aktif olup olmadığı |

| CreatedAt   | DateTime | Kategori oluşturulma tarihi     |



\---



\## İlk Kategori Örnekleri



```text

Turnuva

Spor

Sosyal Buluşma

Oyun Gecesi

Diğer

```



\---



\## EventCategories Örnek Kayıt



```json

{

&#x20; "id": 1,

&#x20; "name": "Turnuva",

&#x20; "description": "Turnuva ve yarışma etkinlikleri",

&#x20; "isActive": true,

&#x20; "createdAt": "2026-05-31T18:00:00Z"

}

```



\---



## EventCategories Notları

* Sadece `IsActive = true` olan kategoriler kullanıcı tarafında listelenir.
* Admin yeni kategori oluşturabilir.
* Admin kategoriyi pasif hale getirebilir.
* Admin pasif kategoriyi tekrar aktif hale getirebilir.
* Kategoriler etkinlik oluştururken kullanılır.
* Kategori silmek yerine `IsActive = false` yapılması tercih edilir.
* Bu yaklaşım, kategoriye bağlı eski etkinliklerin veritabanı ilişkilerinin bozulmasını engeller.




\---



\# 4. Events Tablosu



`Events` tablosu, organizatörler tarafından oluşturulan etkinlikleri tutar.



Etkinlikler oluşturulduğunda direkt yayına çıkmaz. İlk olarak:



```text

Pending

```



durumunda oluşur.



Admin onaylarsa:



```text

Approved

```



durumuna geçer ve kullanıcılar tarafından listelenebilir.



\---



\## Events Alanları



| Alan               | Tip       | Açıklama                                |

| ------------------ | --------- | --------------------------------------- |

| Id                 | int       | Etkinlik kimliği                        |

| OrganizerProfileId | int       | Etkinliği oluşturan organizatör profili |

| EventCategoryId    | int       | Etkinlik kategorisi                     |

| Title              | string    | Etkinlik başlığı                        |

| Description        | string    | Etkinlik açıklaması                     |

| StartDate          | DateTime  | Etkinlik başlangıç tarihi               |

| EndDate            | DateTime? | Etkinlik bitiş tarihi                   |

| City               | string    | Şehir                                   |

| District           | string    | İlçe                                    |

| LocationName       | string    | Mekan veya konum adı                    |

| Address            | string    | Açık adres                              |

| Latitude           | double?   | Enlem bilgisi                           |

| Longitude          | double?   | Boylam bilgisi                          |

| Capacity           | int       | Etkinlik kontenjanı                     |

| IsPaid             | bool      | Etkinlik ücretli mi                     |

| Price              | decimal?  | Katılım ücreti                          |

| CoverImageUrl      | string    | Kapak görseli URL bilgisi               |

| Rules              | string    | Etkinlik kuralları                      |

| Status             | string    | Etkinlik durumu                         |

| CreatedAt          | DateTime  | Etkinlik oluşturulma tarihi             |

| ApprovedAt         | DateTime? | Etkinlik onaylanma tarihi               |



\---



\## Event Status Değerleri



```text

Pending

Approved

Rejected

Cancelled

Completed

```



| Durum     | Açıklama                    |

| --------- | --------------------------- |

| Pending   | Admin onayı bekliyor        |

| Approved  | Yayında                     |

| Rejected  | Admin tarafından reddedildi |

| Cancelled | İptal edildi                |

| Completed | Tamamlandı                  |



\---



\## Events Örnek Kayıt



```json

{

&#x20; "id": 1,

&#x20; "organizerProfileId": 1,

&#x20; "eventCategoryId": 1,

&#x20; "title": "Nazilli Tavla Turnuvası",

&#x20; "description": "Keyifli bir tavla turnuvası düzenliyoruz. Herkes katılabilir.",

&#x20; "startDate": "2026-06-01T20:00:00Z",

&#x20; "endDate": "2026-06-01T23:00:00Z",

&#x20; "city": "Aydın",

&#x20; "district": "Nazilli",

&#x20; "locationName": "X Cafe",

&#x20; "address": "Nazilli merkez",

&#x20; "latitude": null,

&#x20; "longitude": null,

&#x20; "capacity": 32,

&#x20; "isPaid": false,

&#x20; "price": null,

&#x20; "coverImageUrl": "",

&#x20; "rules": "Eleme usulü oynanacaktır.",

&#x20; "status": "Pending",

&#x20; "createdAt": "2026-05-31T18:00:00Z",

&#x20; "approvedAt": null

}

```



\---



\## Events İlişkileri



```text

Events.OrganizerProfileId → OrganizerProfiles.Id

Events.EventCategoryId → EventCategories.Id

```



Bir organizatör birden fazla etkinlik oluşturabilir.



Bir kategoriye birden fazla etkinlik bağlı olabilir.



\---



\## Events Notları



\* Kullanıcı tarafında sadece `Approved` etkinlikler görünür.

\* Admin onayı olmadan etkinlik yayına çıkmaz.

\* Filtreleme şehir, ilçe ve kategori üzerinden yapılır.

\* Kontenjan kontrolü `EventParticipants` tablosundaki aktif katılım sayısına göre yapılır.

\* Katılımcı sayısı hesaplanırken sadece `Status = Joined` olan kayıtlar sayılır.



\---



\# 5. EventParticipants Tablosu



`EventParticipants` tablosu, kullanıcıların hangi etkinliklere katıldığını tutar.



Bir kullanıcı bir etkinliğe katıldığında bu tabloya kayıt açılır.



\---



\## EventParticipants Alanları



| Alan     | Tip      | Açıklama              |

| -------- | -------- | --------------------- |

| Id       | int      | Katılım kaydı kimliği |

| EventId  | int      | Katıldığı etkinlik    |

| UserId   | int      | Katılan kullanıcı     |

| Status   | string   | Katılım durumu        |

| JoinedAt | DateTime | Katılım tarihi        |



\---



\## EventParticipant Status Değerleri



```text

Joined

Cancelled

Attended

NoShow

```



| Durum     | Açıklama                                 |

| --------- | ---------------------------------------- |

| Joined    | Kullanıcı etkinliğe aktif olarak katıldı |

| Cancelled | Kullanıcı katılımını iptal etti          |

| Attended  | Kullanıcı etkinliğe geldi                |

| NoShow    | Kullanıcı etkinliğe gelmedi              |



\---



\## EventParticipants Örnek Kayıt



```json

{

&#x20; "id": 1,

&#x20; "eventId": 1,

&#x20; "userId": 2,

&#x20; "status": "Joined",

&#x20; "joinedAt": "2026-05-31T19:00:00Z"

}

```



\---



\## EventParticipants İlişkileri



```text

EventParticipants.EventId → Events.Id

EventParticipants.UserId → Users.Id

```



Bir etkinliğin birden fazla katılımcısı olabilir.



Bir kullanıcı birden fazla etkinliğe katılabilir.



\---



\## EventParticipants Notları



\* Kullanıcı aynı etkinliğe ikinci kez aktif olarak katılamaz.

\* Kullanıcı etkinlikten ayrıldığında kayıt silinmez.

\* Ayrılma işleminde `Status = Cancelled` yapılır.

\* Aktif katılımcı sayısı sadece `Joined` kayıtları üzerinden hesaplanır.

\* İleride etkinlik sonrası yoklama için `Attended` ve `NoShow` durumları kullanılabilir.



\---



\# \_\_EFMigrationsHistory Tablosu



Bu tablo Entity Framework Core tarafından otomatik oluşturulur.



Migration geçmişini takip eder.



Elle müdahale edilmemelidir.



\---



\## \_\_EFMigrationsHistory Alanları



| Alan           | Açıklama                |

| -------------- | ----------------------- |

| MigrationId    | Uygulanan migration adı |

| ProductVersion | EF Core sürümü          |



\---



\# İlişki Diyagramı



Basit ilişki diyagramı:



```text

Users

&#x20; Id

&#x20; FullName

&#x20; Email

&#x20; Role

&#x20;  │

&#x20;  │ 1 - 1

&#x20;  ▼

OrganizerProfiles

&#x20; Id

&#x20; UserId

&#x20; OrganizerName

&#x20; Status

&#x20;  │

&#x20;  │ 1 - N

&#x20;  ▼

Events

&#x20; Id

&#x20; OrganizerProfileId

&#x20; EventCategoryId

&#x20; Title

&#x20; Status

&#x20;  ▲

&#x20;  │ N - 1

EventCategories

&#x20; Id

&#x20; Name

&#x20; IsActive



Events

&#x20; Id

&#x20;  │

&#x20;  │ 1 - N

&#x20;  ▼

EventParticipants

&#x20; Id

&#x20; EventId

&#x20; UserId

&#x20; Status

&#x20;  ▲

&#x20;  │ N - 1

Users

&#x20; Id

&#x20; FullName

&#x20; Email

```



\---



\# Model Bazlı İlişki Açıklaması



\## User - OrganizerProfile



```text

Bir User, bir OrganizerProfile kaydına sahip olabilir.

Bir OrganizerProfile, bir User kaydına bağlıdır.

```



İlişki:



```text

OrganizerProfiles.UserId → Users.Id

```



Silme davranışı:



```text

Restrict

```



\---



\## OrganizerProfile - Event



```text

Bir OrganizerProfile, birden fazla Event oluşturabilir.

Bir Event, bir OrganizerProfile kaydına bağlıdır.

```



İlişki:



```text

Events.OrganizerProfileId → OrganizerProfiles.Id

```



Silme davranışı:



```text

Restrict

```



\---



\## EventCategory - Event



```text

Bir EventCategory, birden fazla Event kaydına bağlı olabilir.

Bir Event, bir EventCategory kaydına bağlıdır.

```



İlişki:



```text

Events.EventCategoryId → EventCategories.Id

```



Silme davranışı:



```text

Restrict

```



\---



\## Event - EventParticipant



```text

Bir Event, birden fazla EventParticipant kaydına sahip olabilir.

Bir EventParticipant, bir Event kaydına bağlıdır.

```



İlişki:



```text

EventParticipants.EventId → Events.Id

```



Silme davranışı:



```text

Restrict

```



\---



\## User - EventParticipant



```text

Bir User, birden fazla EventParticipant kaydına sahip olabilir.

Bir EventParticipant, bir User kaydına bağlıdır.

```



İlişki:



```text

EventParticipants.UserId → Users.Id

```



Silme davranışı:



```text

Restrict

```



\---



\# Silme Davranışı



Projede ilişkilerde genel olarak:



```text

DeleteBehavior.Restrict

```



kullanılmıştır.



Bunun amacı, ilişkili verilerin yanlışlıkla silinmesini engellemektir.



Örnek:



\* Kullanıcı silinirse organizatör başvurusunun otomatik silinmesi istenmez.

\* Etkinlik silinirse katılım kayıtlarının kontrolsüz silinmesi istenmez.

\* Kategori silinirse bağlı etkinliklerin bozulması istenmez.



İleride silme yerine daha çok şu yaklaşım tercih edilebilir:



```text

Soft Delete

```



Yani kayıt veritabanından tamamen silinmez, sadece pasif hale getirilir.



\---



\# Tarih Yönetimi



Projede DateTime alanları PostgreSQL tarafında `timestamp with time zone` olarak çalışmaktadır.



Bu nedenle tarih değerleri UTC olarak kaydedilmelidir.



Kullanılan örnek alanlar:



```text

CreatedAt

ApprovedAt

StartDate

EndDate

JoinedAt

```



Backend tarafında tarih işlemlerinde şu yaklaşım kullanılmalıdır:



```csharp

DateTime.UtcNow

```



Postman veya mobil uygulamadan tarih gönderirken örnek format:



```json

{

&#x20; "startDate": "2026-06-01T20:00:00",

&#x20; "endDate": "2026-06-01T23:00:00"

}

```



Backend tarafında gerekli durumlarda `DateTimeKind.Utc` atanmalıdır.



\---



\# Katılımcı Sayısı Hesaplama



Etkinlik katılımcı sayısı ayrı bir kolon olarak tutulmamaktadır.



Katılımcı sayısı şu şekilde hesaplanır:



```text

EventParticipants tablosunda

EventId = ilgili etkinlik Id

Status = Joined

```



olan kayıtların sayısı alınır.



Örnek:



```csharp

\_context.EventParticipants.Count(p => p.EventId == eventId \&\& p.Status == "Joined")

```



Bu değer API response içinde:



```text

ParticipantCount

```



olarak döndürülür.



\---



\# Şu An Kullanılan DTO Yapıları



Veritabanı modelleri doğrudan dışarı açılmak yerine DTO yapıları kullanılmaktadır.



Ana DTO klasörleri:



```text

Dtos/Auth

Dtos/Organizer

Dtos/Admin

Dtos/Category

Dtos/Event

```



\---



\# Auth DTO'ları



```text

RegisterRequest

LoginRequest

AuthResponse

```



\---



\# Organizer DTO'ları



```text

CreateOrganizerProfileRequest

OrganizerProfileResponse

```



\---



\# Admin DTO'ları



```text

RejectOrganizerRequest

```



\---



\# Category DTO'ları



```text

CreateCategoryRequest

CategoryResponse

```



\---



\# Event DTO'ları



```text

CreateEventRequest

EventResponse

EventParticipantResponse

```



\---



\# İleride Eklenebilecek Tablolar



MVP sonrası proje büyüdükçe aşağıdaki tablolar eklenebilir.



\---



\## EventImages



Etkinlik fotoğraflarını tutmak için kullanılabilir.



Muhtemel alanlar:



```text

Id

EventId

ImageUrl

ImageType

CreatedAt

```



\---



\## OrganizerImages



Organizatör veya mekan profil fotoğraflarını tutmak için kullanılabilir.



Muhtemel alanlar:



```text

Id

OrganizerProfileId

ImageUrl

CreatedAt

```



\---



\## Notifications



Bildirim kayıtlarını tutmak için kullanılabilir.



Muhtemel alanlar:



```text

Id

UserId

Title

Message

IsRead

CreatedAt

```



\---



\## Reports



Şikayet ve bildirimleri tutmak için kullanılabilir.



Muhtemel alanlar:



```text

Id

ReporterUserId

TargetType

TargetId

Reason

Description

Status

CreatedAt

```



\---



\## Payments



İleride online ödeme sistemi eklenirse kullanılabilir.



Muhtemel alanlar:



```text

Id

UserId

EventId

Amount

Status

PaymentProvider

CreatedAt

```



\---



\## FeaturedEvents



Öne çıkarılmış etkinlikleri yönetmek için kullanılabilir.



Muhtemel alanlar:



```text

Id

EventId

StartDate

EndDate

IsActive

CreatedAt

```



\---



\## Reviews



Etkinlik veya organizatör yorumları için kullanılabilir.



Muhtemel alanlar:



```text

Id

EventId

UserId

Rating

Comment

CreatedAt

```



\---



\# Veritabanı Tasarım Notları



\* İlk MVP için veritabanı basit tutulmuştur.

\* Kafe, bireysel kişi, kulüp veya kurum ayrımı ayrı tablolarla yapılmamıştır.

\* Tüm organizatörler `OrganizerProfiles` tablosunda tutulur.

\* Mekan bilgisi ilk sürümde `Events` tablosu içinde tutulur.

\* Ayrı `Venues` tablosu ilk MVP için eklenmemiştir.

\* Bu yaklaşım geliştirme hızını artırır ve MVP için yeterlidir.

\* İleride çok sayıda sabit mekan oluşursa ayrı `Venues` tablosu eklenebilir.

\* Etkinlik fotoğrafları ilk aşamada sadece `CoverImageUrl` olarak tutulur.

\* Gerçek dosya yükleme sistemi MVP sonrası eklenecektir.



\---



\# Genel Veritabanı Özeti



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

Organizer kendi etkinliğinin katılımcılarını görebilir.

```



Bu yapı, Etkinlik Projesi'nin ilk MVP sürümü için yeterli ve genişletilebilir bir temel sağlar.



