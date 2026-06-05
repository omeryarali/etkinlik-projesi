# Roller ve Akışlar

Son güncelleme: `2026-06-05`

Bu belge, sistemdeki rollerin yetkilerini ve ana iş akışlarını özetler.

## Roller

- `Participant`
- `Organizer`
- `Admin`

## Rol Özeti

### Participant

Yapabilir:

- Kayıt olabilir
- Giriş yapabilir
- Profilini görüntüleyebilir ve güncelleyebilir
- Şifresini değiştirebilir
- Onaylı etkinlikleri görebilir
- Etkinlik filtreleyebilir
- Etkinlik detayına girebilir
- Etkinliğe katılabilir
- Etkinlikten ayrılabilir
- Katıldığı etkinlikleri görebilir
- Organizer başvurusu yapabilir

Yapamaz:

- Organizer onayı olmadan etkinlik oluşturamaz
- Başkasının etkinlik katılımcı listesini göremez
- Admin işlemleri yapamaz

### Organizer

Yapabilir:

- Kendi organizer profilini görüntüleyebilir
- Etkinlik oluşturabilir
- Kendi etkinliklerini listeleyebilir
- Kendi etkinliğini güncelleyebilir
- Kendi etkinliğini iptal edebilir
- Kendi etkinliğini tamamlandı yapabilir
- Kendi etkinlik katılımcılarını görebilir
- Katılımcılara yoklama işleyebilir

Yapamaz:

- Etkinliği admin onayı olmadan yayına alamaz
- Başka organizerin etkinliğini yönetemez
- Admin işlemleri yapamaz

### Admin

Yapabilir:

- Dashboard istatistiklerini görebilir
- Kullanıcıları listeleyebilir
- Kullanıcıları aktif veya pasif yapabilir
- Organizer başvurularını yönetebilir
- Etkinlikleri onaylayabilir veya reddedebilir
- Kategorileri yönetebilir

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

## Ana Akışlar

### 1. Kayıt ve Giriş

```text
Kullanıcı kayıt olur.
Sistem kullanıcıyı Participant rolüyle oluşturur.
Şifre BCrypt ile hashlenir.
JWT token üretilir.
Kullanıcı giriş yaptığında rolüne uygun token alır.
```

### 2. Organizer Başvuru Akışı

```text
Participant organizer başvurusu yapar.
Başvuru Pending olarak oluşturulur.
Admin başvuruyu inceler.
Admin onaylarsa OrganizerProfile.Status = Approved olur.
User.Role = Organizer olur.
Kullanıcı tekrar giriş yaptığında organizer yetkileriyle işlem yapabilir.
```

### 3. Organizer Profil Güncelleme Akışı

```text
Organizer profilini günceller.
Profil daha önce Approved ise tekrar Pending olur.
ApprovedAt temizlenir.
User.Role tekrar Participant yapılır.
Profil yeniden admin onayına düşer.
```

### 4. Etkinlik Yayın Akışı

```text
Organizer etkinlik oluşturur.
Etkinlik Pending olarak kaydedilir.
Admin etkinliği inceler.
Admin onaylarsa etkinlik Approved olur.
Public listelerde yalnızca Approved etkinlikler görünür.
```

### 5. Etkinlik Güncelleme Akışı

```text
Organizer kendi etkinliğini günceller.
Güncellenen etkinlik tekrar Pending olur.
ApprovedAt alanı temizlenir.
Etkinlik yeniden admin onayına düşer.
```

### 6. Katılım Akışı

```text
Kullanıcı etkinlik detayına girer.
Sistem etkinliğin Approved olduğunu kontrol eder.
Sistem kullanıcının daha önce aktif katılımı olup olmadığını kontrol eder.
Sistem kontenjanı kontrol eder.
Katılım kaydı Joined olarak oluşturulur.
```

### 7. Etkinlikten Ayrılma Akışı

```text
Kullanıcı etkinlikten ayrılır.
Kayıt silinmez.
Katılım kaydı Cancelled durumuna çekilir.
```

### 8. Yoklama Akışı

```text
Organizer kendi etkinlik katılımcı listesini açar.
Katılımcıyı Attended veya NoShow olarak işaretler.
Cancelled durumundaki katılımcıya yoklama işlenmez.
```

## Yetki Matrisi

| İşlem | Public | Participant | Organizer | Admin |
|---|---:|---:|---:|---:|
| Kayıt olma | Evet | Evet | Evet | Evet |
| Giriş yapma | Evet | Evet | Evet | Evet |
| Onaylı etkinlikleri görüntüleme | Evet | Evet | Evet | Evet |
| Etkinliğe katılma | Hayır | Evet | Evet | Evet |
| Organizer başvurusu yapma | Hayır | Evet | Hayır | Hayır |
| Etkinlik oluşturma | Hayır | Hayır | Evet | Hayır |
| Katılımcı listesini görme | Hayır | Hayır | Evet | Hayır |
| Organizer onaylama | Hayır | Hayır | Hayır | Evet |
| Event onaylama | Hayır | Hayır | Hayır | Evet |
| Kategori oluşturma | Hayır | Hayır | Hayır | Evet |

## Admin Panel Akışı

```text
Admin login olur.
Token localStorage içinde saklanır.
Admin korumalı sayfalara yönlendirilir.
Token geçersizse kullanıcı login sayfasına döner.
Admin dashboard, users, organizers, events ve categories ekranlarından işlem yapar.
```
