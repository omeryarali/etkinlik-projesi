<!--
Etkinlik Projesi dokümantasyonu
Güncel kapsam: Backend MVP + Admin Panel MVP
-->
# Roller ve Akış

Bu dosya, Etkinlik Projesi içerisindeki kullanıcı rollerini, her rolün yapabileceklerini ve temel uygulama akışlarını açıklar.

---

## Roller

```text
Participant
Organizer
Admin
```

---

## Participant

Participant, uygulamaya kayıt olan normal katılımcıdır.

### Yapabilir

- Kayıt olabilir.
- Giriş yapabilir.
- Kendi bilgilerini görüntüleyebilir.
- Profil bilgilerini güncelleyebilir.
- Şifresini değiştirebilir.
- Onaylı etkinlikleri listeleyebilir.
- Etkinlikleri filtreleyebilir.
- Etkinlik detayını görüntüleyebilir.
- Etkinliğe katılabilir.
- Etkinlikten ayrılabilir.
- Katıldığı etkinlikleri listeleyebilir.
- Organizatör başvurusu yapabilir.
- Kendi başvuru durumunu görebilir.

### Yapamaz

- Admin onayı olmadan etkinlik oluşturamaz.
- Başkasının etkinliğinin katılımcı listesini göremez.
- Etkinlik onaylayamaz veya reddedemez.
- Organizatör başvurularını yönetemez.
- Kategori oluşturamaz.
- Admin işlemleri yapamaz.

### Akış

```text
Kullanıcı kayıt olur.
Giriş yapar.
Onaylı etkinlikleri listeler.
Filtreleme veya arama yapar.
Etkinlik detayına girer.
Etkinliğe katılır.
İsterse etkinlikten ayrılır.
İsterse organizatör başvurusu yapar.
```

---

## Organizer

Organizer, admin tarafından onaylanmış organizatördür.

### Yapabilir

- Kendi organizatör profilini görüntüleyebilir.
- Etkinlik oluşturabilir.
- Kendi etkinliklerini listeleyebilir.
- Kendi etkinliğini güncelleyebilir.
- Kendi etkinliğini iptal edebilir.
- Kendi etkinliğini tamamlandı yapabilir.
- Kendi etkinliğine katılan kullanıcıları görebilir.
- Katılımcıları geldi/gelmedi olarak işaretleyebilir.

### Yapamaz

- Kendi etkinliğini direkt yayına alamaz.
- Başkasının etkinliğini yönetemez.
- Başkasının katılımcı listesini göremez.
- Admin işlemleri yapamaz.

### Organizer Olma Akışı

```text
Kullanıcı Participant olarak kayıt olur.
Organizatör başvuru formunu doldurur.
Başvuru Pending olur.
Admin panelden başvuruyu inceler.
Admin onaylarsa OrganizerProfile.Status = Approved olur.
User.Role = Organizer olur.
Kullanıcı tekrar login olduğunda Organizer rolüyle token alır.
```

### Organizer Profil Güncelleme Akışı

```text
Organizer profilini günceller.
Profil Approved ise tekrar Pending yapılır.
User.Role tekrar Participant yapılır.
Admin tekrar onaylamadan organizer yetkisi kullanılamaz.
```

### Organizer Etkinlik Akışı

```text
Organizer etkinlik oluşturur.
Etkinlik Pending olur.
Admin etkinliği onaylar.
Etkinlik Approved olur.
Organizer isterse etkinliği günceller.
Güncellenen etkinlik tekrar Pending olur.
Organizer etkinliği iptal edebilir.
Organizer etkinliği Completed yapabilir.
```

### Katılımcı Akışı

```text
Organizer katılımcı listesini açar.
Sistem etkinliğin organizer'a ait olup olmadığını kontrol eder.
Organizer katılımcıları görebilir.
Etkinlik sonrası Attended veya NoShow işaretleyebilir.
```

---

## Admin

Admin sistem yöneticisidir.

### Yapabilir

- Dashboard istatistiklerini görebilir.
- Kullanıcıları listeleyebilir.
- Kullanıcıları aktif/pasif yapabilir.
- Organizatörleri listeleyebilir.
- Organizatörleri onaylayabilir/reddedebilir.
- Organizatörleri askıya alabilir/aktif edebilir.
- Etkinlikleri listeleyebilir.
- Etkinlikleri onaylayabilir/reddedebilir.
- Kategorileri listeleyebilir.
- Kategori oluşturabilir.
- Kategorileri aktif/pasif yapabilir.

### Admin Organizer Akışı

```text
Admin login olur.
Organizatörler sayfasına girer.
Pending başvuruları listeler.
Detay modalından bilgileri inceler.
Onaylar veya reddeder.
Onayda User.Role = Organizer olur.
Askıya alma durumunda User.Role = Participant olur.
```

### Admin Event Akışı

```text
Admin etkinlikler sayfasına girer.
Pending etkinlikleri listeler.
Detay modalından bilgileri inceler.
Uygunsa Approved yapar.
Uygun değilse Rejected yapar.
```

### Admin Kullanıcı Akışı

```text
Admin kullanıcıları listeler.
Role göre filtreleyebilir.
Kullanıcıyı pasif yapabilir.
Pasif kullanıcı login olamaz.
Kullanıcı tekrar aktif yapılabilir.
```

### Admin Kategori Akışı

```text
Admin kategorileri listeler.
Yeni kategori ekler.
Kategori aktif/pasif yapar.
Kategori silinmez.
```

---

## Temel Sistem Akışları

### Kayıt ve Giriş

```text
Kullanıcı kayıt formunu doldurur.
Sistem e-posta kontrolü yapar.
Şifre BCrypt ile hashlenir.
Kullanıcı Participant rolüyle oluşturulur.
JWT token üretilir.
```

### Etkinliğe Katılım

```text
Kullanıcı etkinlik detayına girer.
Katıl butonuna basar.
Sistem etkinliğin Approved olup olmadığını kontrol eder.
Daha önce katılım var mı kontrol eder.
Kontenjan kontrolü yapar.
EventParticipant kaydı Joined olur.
```

### Etkinlikten Ayrılma

```text
Kullanıcı etkinlikten ayrılır.
Kayıt silinmez.
EventParticipant.Status = Cancelled yapılır.
```

### Yoklama

```text
Organizer etkinlik sonrası katılımcı listesini açar.
Katılımcıyı Attended veya NoShow olarak işaretler.
```

---

## Yetki Özeti

| İşlem | Public | Authorize | Participant | Organizer | Admin |
|---|---:|---:|---:|---:|---:|
| Kayıt olma | Evet | Hayır | Evet | Evet | Evet |
| Giriş yapma | Evet | Hayır | Evet | Evet | Evet |
| Onaylı etkinlikleri görme | Evet | Hayır | Evet | Evet | Evet |
| Etkinliğe katılma | Hayır | Evet | Evet | Evet | Evet |
| Organizatör başvurusu | Hayır | Evet | Evet | Hayır | Hayır |
| Etkinlik oluşturma | Hayır | Evet | Hayır | Evet | Hayır |
| Organizatör onaylama | Hayır | Evet | Hayır | Hayır | Evet |
| Etkinlik onaylama | Hayır | Evet | Hayır | Hayır | Evet |
| Kategori oluşturma | Hayır | Evet | Hayır | Hayır | Evet |

---

## Admin Panel Akışı

```text
Admin /login sayfasından giriş yapar.
Admin rolü kontrol edilir.
Token localStorage'a kaydedilir.
Admin /dashboard sayfasına yönlendirilir.
AdminLayout auth guard ile korunan sayfalara erişim sağlar.
Token bozuksa veya yoksa kullanıcı /login sayfasına atılır.
```

Admin panel sayfaları:

```text
/login
/dashboard
/organizers
/events
/users
/categories
```

---

## Genel Özet

```text
Participant etkinlikleri keşfeder ve katılır.
Participant isterse organizatör başvurusu yapar.
Admin başvuruyu onaylarsa kullanıcı Organizer olur.
Organizer etkinlik oluşturur.
Admin etkinliği onaylarsa etkinlik yayına çıkar.
Participant kullanıcılar etkinliği görür ve katılır.
Organizer katılımcılarını takip eder.
Admin sistem güvenliğini ve içerik kontrolünü sağlar.
```
