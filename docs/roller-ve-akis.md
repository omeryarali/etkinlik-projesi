# Roller ve Akislar

Son guncelleme: `2026-06-07`

## Roller

- `Participant`
- `Organizer`
- `Admin`

## Participant

Yapabilir:

- kayit olabilir
- login olabilir
- approved etkinlikleri gorebilir
- etkinlik detayini gorebilir
- etkinlige katilabilir
- etkinlikten ayrilabilir
- kendi profilini duzenleyebilir
- sifresini degistirebilir
- organizer basvurusu yapabilir
- katildigi etkinlikleri gorebilir

Yapamaz:

- organizer onayi olmadan etkinlik olusturamaz
- baska organizerin katilimci listesini goremez
- admin islemleri yapamaz

## Organizer

Yapabilir:

- kendi organizer profilini gorebilir
- etkinlik olusturabilir
- kendi etkinliklerini listeleyebilir
- kendi etkinligini guncelleyebilir
- kendi etkinligini iptal edebilir
- kendi etkinligini tamamlandi yapabilir
- kendi etkinlik katilimcilarini gorebilir
- katilimcilari `Attended` / `NoShow` olarak isaretleyebilir

Yapamaz:

- admin onayi olmadan etkinligi yayina alamaz
- baska organizerin etkinligini yonetemez
- admin islemleri yapamaz

## Admin

Yapabilir:

- dashboard istatistiklerini gorebilir
- kullanicilari listeleyebilir
- kullanicilari aktif / pasif yapabilir
- organizer basvurularini onaylayabilir veya askiya alabilir
- etkinlikleri onaylayabilir veya reddedebilir
- kategorileri yonetebilir

## Durum Degerleri

### User.Role

```text
Participant
Organizer
Admin
```

### OrganizerProfile.Status

```text
Pending
Approved
Rejected
Suspended
```

### Event.Status

```text
Pending
Approved
Rejected
Cancelled
Completed
```

### EventParticipant.Status

```text
Joined
Cancelled
Attended
NoShow
```

## Ana Is Akislari

### 1. Kayit ve Login

```text
Kullanici kayit olur.
Sistem sifreyi hashler.
Sistem Participant roluyle kullaniciyi olusturur.
JWT token dondurulur.
Login ve register endpointleri rate limit altindadir.
```

### 2. Organizer Basvurusu

```text
Participant organizer basvurusu yapar.
Basvuru Pending olur.
Admin onaylarsa User.Role = Organizer olur.
Token version arttigi icin eski oturumlar gecersizlesir.
```

### 3. Organizer Profil Guncelleme

```text
Approved organizer profilini gunceller.
Profil tekrar Pending olur.
ApprovedAt temizlenir.
User.Role tekrar Participant olur.
Token version artar.
Kullanici yeniden admin onayi bekler.
```

### 4. Etkinlik Yayin Akisi

```text
Organizer etkinlik olusturur.
Etkinlik Pending kaydolur.
Admin onaylarsa etkinlik Approved olur.
Public listelerde yalnizca Approved etkinlikler gorunur.
```

### 5. Etkinlige Katilim

```text
Kullanici Approved etkinlige katilmak ister.
Sistem aktif katilim ve kontenjani kontrol eder.
Katilim islemi serializable transaction icinde calisir.
Ayni EventId + UserId icin tek kayit korunur.
```

### 6. Sifre Degistirme

```text
Kullanici mevcut sifresiyle yeni sifre belirler.
Yeni sifre en az 8 karakter, harf ve rakam icermelidir.
Sifre degisince TokenVersion artar.
Eski tokenlar aninda gecersiz olur.
```

### 7. Admin Panel Oturumu

```text
Admin login olur.
Token ayri saklanir.
Admin profil objesi token kopyasi olmadan saklanir.
401 alinirsa oturum temizlenir ve login sayfasina donulur.
```
