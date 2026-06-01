\# API Listesi



Bu dosya, Etkinlik Projesi backend API endpointlerini takip etmek için hazırlanmıştır.



Backend temel adresi local geliştirme ortamında:



```http

http://localhost:5270

```



\---



\# Auth



\## Register



```http

POST /api/Auth/register

```



Yeni kullanıcı kaydı oluşturur.



Kullanıcı ilk kayıt olduğunda varsayılan rolü:



```text

Participant

```



olur.



\### Request



```json

{

&#x20; "fullName": "Ömer Yaralı",

&#x20; "email": "omer@test.com",

&#x20; "phoneNumber": "05555555555",

&#x20; "password": "123456"

}

```



\### Response



```json

{

&#x20; "userId": 1,

&#x20; "fullName": "Ömer Yaralı",

&#x20; "email": "omer@test.com",

&#x20; "role": "Participant",

&#x20; "token": "JWT\_TOKEN"

}

```



\---



\## Login



```http

POST /api/Auth/login

```



Kullanıcı girişi yapar.



Başarılı girişte kullanıcı bilgileri ve JWT token döner.



\### Request



```json

{

&#x20; "email": "omer@test.com",

&#x20; "password": "123456"

}

```



\### Response



```json

{

&#x20; "userId": 1,

&#x20; "fullName": "Ömer Yaralı",

&#x20; "email": "omer@test.com",

&#x20; "role": "Participant",

&#x20; "token": "JWT\_TOKEN"

}

```



\---



\# Organizer



\## Organizatör Başvurusu Yap



```http

POST /api/Organizer/apply

```



Giriş yapan kullanıcı organizatör başvurusu yapar.



Başvuru ilk olarak:



```text

Pending

```



durumunda oluşturulur.



\### Yetki



```text

Authorize

```



\### Header



```http

Authorization: Bearer JWT\_TOKEN

```



\### Request



```json

{

&#x20; "organizerName": "Ömer Organizasyon",

&#x20; "organizerType": "Individual",

&#x20; "description": "Bireysel etkinlikler ve halı saha organizasyonları düzenliyorum.",

&#x20; "phoneNumber": "05555555555",

&#x20; "instagramUrl": "https://instagram.com/test",

&#x20; "city": "Aydın",

&#x20; "district": "Nazilli"

}

```



\### Response



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



\## Kendi Organizatör Profilim



```http

GET /api/Organizer/my-profile

```



Giriş yapan kullanıcının organizatör profilini getirir.



\### Yetki



```text

Authorize

```



\### Header



```http

Authorization: Bearer JWT\_TOKEN

```



\### Response



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



\# Admin - Organizer



\## Bekleyen Organizatör Başvuruları



```http

GET /api/Admin/organizers/pending

```



Admin onay bekleyen organizatör başvurularını listeler.



\### Yetki



```text

Admin

```



\### Header



```http

Authorization: Bearer ADMIN\_TOKEN

```



\### Response



```json

\[

&#x20; {

&#x20;   "id": 1,

&#x20;   "userId": 1,

&#x20;   "organizerName": "Ömer Organizasyon",

&#x20;   "organizerType": "Individual",

&#x20;   "description": "Bireysel etkinlikler düzenliyorum.",

&#x20;   "phoneNumber": "05555555555",

&#x20;   "instagramUrl": "https://instagram.com/test",

&#x20;   "city": "Aydın",

&#x20;   "district": "Nazilli",

&#x20;   "status": "Pending",

&#x20;   "rejectionReason": "",

&#x20;   "createdAt": "2026-05-31T18:00:00Z",

&#x20;   "approvedAt": null

&#x20; }

]

```



\---



\## Organizatör Başvurusu Onayla



```http

PUT /api/Admin/organizers/{id}/approve

```



Admin organizatör başvurusunu onaylar.



Onay işleminden sonra:



```text

OrganizerProfile.Status = Approved

User.Role = Organizer

```



olur.



\### Yetki



```text

Admin

```



\### Header



```http

Authorization: Bearer ADMIN\_TOKEN

```



\### Response



```text

Organizatör başvurusu onaylandı.

```



\---



\## Organizatör Başvurusu Reddet



```http

PUT /api/Admin/organizers/{id}/reject

```



Admin organizatör başvurusunu reddeder.



\### Yetki



```text

Admin

```



\### Header



```http

Authorization: Bearer ADMIN\_TOKEN

```



\### Request



```json

{

&#x20; "rejectionReason": "Profil bilgileri eksik."

}

```



\### Response



```text

Organizatör başvurusu reddedildi.

```



\---



\# Category



\## Kategorileri Listele



```http

GET /api/Category

```



Aktif etkinlik kategorilerini listeler.



\### Yetki



```text

Public

```



\### Response



```json

\[

&#x20; {

&#x20;   "id": 1,

&#x20;   "name": "Turnuva",

&#x20;   "description": "Turnuva ve yarışma etkinlikleri",

&#x20;   "isActive": true

&#x20; },

&#x20; {

&#x20;   "id": 2,

&#x20;   "name": "Spor",

&#x20;   "description": "Spor etkinlikleri ve maç organizasyonları",

&#x20;   "isActive": true

&#x20; }

]

```



\---



\## Kategori Oluştur



```http

POST /api/Category

```



Yeni etkinlik kategorisi oluşturur.



\### Yetki



```text

Admin

```



\### Header



```http

Authorization: Bearer ADMIN\_TOKEN

```



\### Request



```json

{

&#x20; "name": "Turnuva",

&#x20; "description": "Turnuva ve yarışma etkinlikleri"

}

```



\### Response



```json

{

&#x20; "id": 1,

&#x20; "name": "Turnuva",

&#x20; "description": "Turnuva ve yarışma etkinlikleri",

&#x20; "isActive": true

}

```



\---



\# Event



\## Onaylı Etkinlikleri Listele



```http

GET /api/Event/approved

```



Onaylı etkinlikleri listeler.



Bu endpoint mobil uygulamanın ana sayfasında kullanılacaktır.



\### Yetki



```text

Public

```



\### Filtreli Kullanım



```http

GET /api/Event/approved?city=Aydın

```



```http

GET /api/Event/approved?city=Aydın\&district=Nazilli

```



```http

GET /api/Event/approved?city=Aydın\&district=Nazilli\&categoryId=1

```



\### Query Parametreleri



| Parametre  | Tip    | Açıklama                   |

| ---------- | ------ | -------------------------- |

| city       | string | Şehre göre filtreleme      |

| district   | string | İlçeye göre filtreleme     |

| categoryId | int    | Kategoriye göre filtreleme |



\### Response



```json

\[

&#x20; {

&#x20;   "id": 1,

&#x20;   "organizerProfileId": 1,

&#x20;   "organizerName": "Ömer Organizasyon",

&#x20;   "eventCategoryId": 1,

&#x20;   "categoryName": "Turnuva",

&#x20;   "title": "Nazilli Tavla Turnuvası",

&#x20;   "description": "Keyifli bir tavla turnuvası düzenliyoruz.",

&#x20;   "startDate": "2026-06-01T20:00:00Z",

&#x20;   "endDate": "2026-06-01T23:00:00Z",

&#x20;   "city": "Aydın",

&#x20;   "district": "Nazilli",

&#x20;   "locationName": "X Cafe",

&#x20;   "address": "Nazilli merkez",

&#x20;   "latitude": null,

&#x20;   "longitude": null,

&#x20;   "capacity": 32,

&#x20;   "participantCount": 1,

&#x20;   "isPaid": false,

&#x20;   "price": null,

&#x20;   "coverImageUrl": "",

&#x20;   "rules": "Eleme usulü oynanacaktır.",

&#x20;   "status": "Approved",

&#x20;   "createdAt": "2026-05-31T18:00:00Z",

&#x20;   "approvedAt": "2026-05-31T18:10:00Z"

&#x20; }

]

```



\---



\## Etkinlik Detayı



```http

GET /api/Event/{id}

```



Onaylı etkinliğin detayını getirir.



\### Yetki



```text

Public

```



\### Response



```json

{

&#x20; "id": 1,

&#x20; "organizerProfileId": 1,

&#x20; "organizerName": "Ömer Organizasyon",

&#x20; "eventCategoryId": 1,

&#x20; "categoryName": "Turnuva",

&#x20; "title": "Nazilli Tavla Turnuvası",

&#x20; "description": "Keyifli bir tavla turnuvası düzenliyoruz.",

&#x20; "startDate": "2026-06-01T20:00:00Z",

&#x20; "endDate": "2026-06-01T23:00:00Z",

&#x20; "city": "Aydın",

&#x20; "district": "Nazilli",

&#x20; "locationName": "X Cafe",

&#x20; "address": "Nazilli merkez",

&#x20; "latitude": null,

&#x20; "longitude": null,

&#x20; "capacity": 32,

&#x20; "participantCount": 1,

&#x20; "isPaid": false,

&#x20; "price": null,

&#x20; "coverImageUrl": "",

&#x20; "rules": "Eleme usulü oynanacaktır.",

&#x20; "status": "Approved",

&#x20; "createdAt": "2026-05-31T18:00:00Z",

&#x20; "approvedAt": "2026-05-31T18:10:00Z"

}

```



\---



\## Etkinlik Oluştur



```http

POST /api/Event

```



Onaylı organizatör yeni etkinlik oluşturur.



Etkinlik ilk oluşturulduğunda:



```text

Pending

```



durumunda olur. Admin onayından sonra yayına çıkar.



\### Yetki



```text

Organizer

```



\### Header



```http

Authorization: Bearer ORGANIZER\_TOKEN

```



\### Request



```json

{

&#x20; "eventCategoryId": 1,

&#x20; "title": "Nazilli Tavla Turnuvası",

&#x20; "description": "Keyifli bir tavla turnuvası düzenliyoruz. Herkes katılabilir.",

&#x20; "startDate": "2026-06-01T20:00:00",

&#x20; "endDate": "2026-06-01T23:00:00",

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

&#x20; "rules": "Eleme usulü oynanacaktır."

}

```



\### Response



```json

{

&#x20; "id": 1,

&#x20; "organizerProfileId": 1,

&#x20; "organizerName": "Ömer Organizasyon",

&#x20; "eventCategoryId": 1,

&#x20; "categoryName": "Turnuva",

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

&#x20; "participantCount": 0,

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



\## Kendi Etkinliklerim



```http

GET /api/Event/my-events

```



Giriş yapan organizatörün kendi oluşturduğu etkinlikleri listeler.



\### Yetki



```text

Organizer

```



\### Header



```http

Authorization: Bearer ORGANIZER\_TOKEN

```



\### Response



```json

\[

&#x20; {

&#x20;   "id": 1,

&#x20;   "organizerProfileId": 1,

&#x20;   "organizerName": "Ömer Organizasyon",

&#x20;   "eventCategoryId": 1,

&#x20;   "categoryName": "Turnuva",

&#x20;   "title": "Nazilli Tavla Turnuvası",

&#x20;   "description": "Keyifli bir tavla turnuvası düzenliyoruz.",

&#x20;   "startDate": "2026-06-01T20:00:00Z",

&#x20;   "endDate": "2026-06-01T23:00:00Z",

&#x20;   "city": "Aydın",

&#x20;   "district": "Nazilli",

&#x20;   "locationName": "X Cafe",

&#x20;   "address": "Nazilli merkez",

&#x20;   "latitude": null,

&#x20;   "longitude": null,

&#x20;   "capacity": 32,

&#x20;   "participantCount": 1,

&#x20;   "isPaid": false,

&#x20;   "price": null,

&#x20;   "coverImageUrl": "",

&#x20;   "rules": "Eleme usulü oynanacaktır.",

&#x20;   "status": "Approved",

&#x20;   "createdAt": "2026-05-31T18:00:00Z",

&#x20;   "approvedAt": "2026-05-31T18:10:00Z"

&#x20; }

]

```



\---



\## Etkinliğe Katıl



```http

POST /api/Event/{id}/join

```



Giriş yapan kullanıcı onaylı etkinliğe katılır.



Aynı kullanıcı aynı etkinliğe ikinci kez katılamaz.



Kontenjan doluysa katılım yapılamaz.



\### Yetki



```text

Authorize

```



\### Header



```http

Authorization: Bearer JWT\_TOKEN

```



\### Response



```text

Etkinliğe katılım başarılı.

```



\---



\## Etkinlikten Ayrıl



```http

POST /api/Event/{id}/leave

```



Giriş yapan kullanıcı katıldığı etkinlikten ayrılır.



Katılım kaydı silinmez, durumu:



```text

Cancelled

```



olarak güncellenir.



\### Yetki



```text

Authorize

```



\### Header



```http

Authorization: Bearer JWT\_TOKEN

```



\### Response



```text

Etkinlik katılımı iptal edildi.

```



\---



\## Katıldığım Etkinlikler



```http

GET /api/Event/my-joined-events

```



Giriş yapan kullanıcının aktif olarak katıldığı etkinlikleri listeler.



Sadece `Joined` durumundaki kayıtlar döner.



\### Yetki



```text

Authorize

```



\### Header



```http

Authorization: Bearer JWT\_TOKEN

```



\### Response



```json

\[

&#x20; {

&#x20;   "id": 1,

&#x20;   "organizerProfileId": 1,

&#x20;   "organizerName": "Ömer Organizasyon",

&#x20;   "eventCategoryId": 1,

&#x20;   "categoryName": "Turnuva",

&#x20;   "title": "Nazilli Tavla Turnuvası",

&#x20;   "description": "Keyifli bir tavla turnuvası düzenliyoruz.",

&#x20;   "startDate": "2026-06-01T20:00:00Z",

&#x20;   "endDate": "2026-06-01T23:00:00Z",

&#x20;   "city": "Aydın",

&#x20;   "district": "Nazilli",

&#x20;   "locationName": "X Cafe",

&#x20;   "address": "Nazilli merkez",

&#x20;   "latitude": null,

&#x20;   "longitude": null,

&#x20;   "capacity": 32,

&#x20;   "participantCount": 1,

&#x20;   "isPaid": false,

&#x20;   "price": null,

&#x20;   "coverImageUrl": "",

&#x20;   "rules": "Eleme usulü oynanacaktır.",

&#x20;   "status": "Approved",

&#x20;   "createdAt": "2026-05-31T18:00:00Z",

&#x20;   "approvedAt": "2026-05-31T18:10:00Z"

&#x20; }

]

```



\---



\## Etkinlik Katılımcıları



```http

GET /api/Event/{id}/participants

```



Organizatör kendi etkinliğinin katılımcılarını listeler.



Organizatör sadece kendi oluşturduğu etkinliğin katılımcılarını görebilir.



\### Yetki



```text

Organizer

```



\### Header



```http

Authorization: Bearer ORGANIZER\_TOKEN

```



\### Response



```json

\[

&#x20; {

&#x20;   "userId": 2,

&#x20;   "fullName": "Test Katılımcı",

&#x20;   "email": "katilimci@test.com",

&#x20;   "joinedAt": "2026-05-31T19:00:00Z"

&#x20; }

]

```



\---



\# Admin - Event



\## Bekleyen Etkinlikler



```http

GET /api/Admin/events/pending

```



Admin onay bekleyen etkinlikleri listeler.



\### Yetki



```text

Admin

```



\### Header



```http

Authorization: Bearer ADMIN\_TOKEN

```



\### Response



```json

\[

&#x20; {

&#x20;   "id": 1,

&#x20;   "organizerProfileId": 1,

&#x20;   "organizerName": "Ömer Organizasyon",

&#x20;   "eventCategoryId": 1,

&#x20;   "categoryName": "Turnuva",

&#x20;   "title": "Nazilli Tavla Turnuvası",

&#x20;   "description": "Keyifli bir tavla turnuvası düzenliyoruz.",

&#x20;   "startDate": "2026-06-01T20:00:00Z",

&#x20;   "endDate": "2026-06-01T23:00:00Z",

&#x20;   "city": "Aydın",

&#x20;   "district": "Nazilli",

&#x20;   "locationName": "X Cafe",

&#x20;   "address": "Nazilli merkez",

&#x20;   "latitude": null,

&#x20;   "longitude": null,

&#x20;   "capacity": 32,

&#x20;   "participantCount": 0,

&#x20;   "isPaid": false,

&#x20;   "price": null,

&#x20;   "coverImageUrl": "",

&#x20;   "rules": "Eleme usulü oynanacaktır.",

&#x20;   "status": "Pending",

&#x20;   "createdAt": "2026-05-31T18:00:00Z",

&#x20;   "approvedAt": null

&#x20; }

]

```



\---



\## Etkinlik Onayla



```http

PUT /api/Admin/events/{id}/approve

```



Admin etkinliği onaylar.



Onaydan sonra etkinlik:



```text

Approved

```



durumuna geçer ve kullanıcılar tarafından listelenebilir.



\### Yetki



```text

Admin

```



\### Header



```http

Authorization: Bearer ADMIN\_TOKEN

```



\### Response



```text

Etkinlik onaylandı.

```



\---



\## Etkinlik Reddet



```http

PUT /api/Admin/events/{id}/reject

```



Admin etkinliği reddeder.



Reddedilen etkinlik kullanıcı tarafında görünmez.



\### Yetki



```text

Admin

```



\### Header



```http

Authorization: Bearer ADMIN\_TOKEN

```



\### Response



```text

Etkinlik reddedildi.

```



\---



\# Test



\## Token Test Endpointi



```http

GET /api/Test/me

```



JWT token içindeki kullanıcı bilgilerini test etmek için kullanılır.



\### Yetki



```text

Authorize

```



\### Header



```http

Authorization: Bearer JWT\_TOKEN

```



\### Response



```json

{

&#x20; "userId": "1",

&#x20; "fullName": "Ömer Yaralı",

&#x20; "email": "omer@test.com",

&#x20; "role": "Participant"

}

```



\---



\# Durum Değerleri



\## User Role



```text

Participant

Organizer

Admin

```



\## OrganizerProfile Status



```text

Pending

Approved

Rejected

Suspended

```



\## Event Status



```text

Pending

Approved

Rejected

Cancelled

Completed

```



\## EventParticipant Status



```text

Joined

Cancelled

Attended

NoShow

```



