<!--
Etkinlik Projesi dokümantasyonu
Güncel kapsam: Backend MVP + Admin Panel MVP
-->
# Proje Özeti

## Proje Adı

Etkinlik Projesi

---

## Genel Amaç

Etkinlik Projesi, kullanıcıların bulundukları şehir veya ilçedeki etkinlikleri, turnuvaları ve sosyal organizasyonları kolayca keşfedebileceği bir mobil uygulama olarak planlanmıştır.

Temel soru:

> Bugün ilçemde hangi etkinlik veya turnuva var?

Kullanıcılar uygulama üzerinden onaylı etkinlikleri görebilecek, detaylarını inceleyebilecek ve katılmak istedikleri etkinliklere başvuru yapabilecektir.

Organizatörler etkinlik oluşturabilecek, katılımcı toplayabilecek ve kendi etkinliklerini yönetebilecektir.

Admin ise organizatörleri, etkinlikleri, kullanıcıları ve kategorileri kontrol ederek platformun güvenliğini sağlayacaktır.

---

## Problem

Yerel etkinlikler çoğunlukla Instagram, WhatsApp grupları, afişler, kafe duyuruları veya kişisel çevre üzerinden duyurulmaktadır.

Bu durum şu sorunlara yol açar:

- Kullanıcılar yakınındaki etkinliklerden haberdar olamaz.
- Organizatörler katılımcı toplamakta zorlanır.
- Etkinlik duyuruları dağınık platformlarda kalır.
- Katılım yönetimi manuel yapılır.
- Etkinliklerin güvenilirliği ve güncelliği takip edilemez.

---

## Değer Önerisi

Katılımcı için:

> Yakınındaki etkinlikleri tek yerden keşfet, detayını incele ve kolayca katıl.

Organizatör için:

> Etkinliğini duyur, katılımcı topla ve katılımcılarını yönet.

Admin için:

> Organizatör ve etkinlikleri kontrol ederek güvenli bir platform oluştur.

---

## Hedef Kullanıcılar

### Katılımcılar

- Tavla turnuvasına katılmak isteyen kişi
- Halı saha maçı arayan kişi
- Kutu oyunu etkinliği arayan kişi
- Satranç turnuvası arayan kişi
- Sosyal buluşmalara katılmak isteyen kişi

### Organizatörler

- Kafe sahipleri
- Bireysel organizatörler
- Halı saha organizasyonu yapan kişiler
- Kulüpler
- Topluluklar
- Üniversite grupları
- Dernekler
- Kurumlar
- Belediye veya gençlik merkezi gibi yapılar

### Admin

- Organizatör başvurularını kontrol eder.
- Etkinlikleri onaylar veya reddeder.
- Kullanıcıları yönetir.
- Kategorileri yönetir.
- Platform güvenliğini sağlar.

---

## Roller

```text
Participant
Organizer
Admin
```

---

## Temel Akış

```text
Kullanıcı kayıt olur.
Kullanıcı giriş yapar.
Kullanıcı onaylı etkinlikleri görür.
Kullanıcı isterse organizatör başvurusu yapar.
Admin panelden organizatör başvurusunu inceler.
Admin başvuruyu onaylarsa kullanıcı Organizer rolüne geçer.
Organizer etkinlik oluşturur.
Etkinlik Pending durumunda admin onayına düşer.
Admin etkinliği onaylar.
Etkinlik Approved olur.
Katılımcı etkinliğe katılır.
Katılımcı isterse etkinlikten ayrılır.
Organizer katılımcı listesini görür.
Organizer etkinlik sonrası katılımcıları geldi/gelmedi olarak işaretleyebilir.
```

---

## Teknik Yapı

```text
Backend: ASP.NET Core Web API
Veritabanı: PostgreSQL
ORM: Entity Framework Core
Authentication: JWT
API Test: Swagger / Postman
Admin Panel: Next.js
Admin Panel Styling: Tailwind CSS
Versiyon Kontrol: GitHub
```

İlerleyen aşamalar:

```text
Mobil Uygulama: React Native / Expo
Bildirim: Firebase Cloud Messaging
Dosya Depolama: Firebase Storage / Cloudflare R2 / AWS S3
Deploy: Render / Railway / Vercel vb.
```

---

## Proje Yapısı

```text
EtkinlikProjesi
├── backend
│   └── EtkinlikProjesi.Api
├── admin-panel
│   └── Next.js projesi
├── docs
└── mobile
    └── ileride oluşturulacak
```

---

## Backend Durumu

```text
Backend MVP: %92 - %95
```

Tamamlanan ana başlıklar:

```text
Auth
JWT
Rol bazlı yetkilendirme
Profil güncelleme
Şifre değiştirme
Organizer başvuru/onay/red
Organizer askıya alma/aktif etme
Kategori yönetimi
Etkinlik oluşturma/güncelleme/iptal/tamamlama
Admin etkinlik onayı/red
Gelişmiş etkinlik filtreleme
Pagination
Katılım sistemi
Katılımcı yoklama sistemi
Admin dashboard
Admin kullanıcı/etkinlik/organizatör listeleme
Swagger + CORS
```

---

## Admin Panel Durumu

```text
Admin Panel MVP: %80 civarı
```

Çalışan sayfalar:

```text
/login
/dashboard
/organizers
/events
/users
/categories
```

Özellikler:

```text
Admin login
Auth guard
Token helper
API hata yönetimi
Dashboard kartları
URL filtreleri
Detay modalları
Confirm pencereleri
Pagination
```

---

## Genel Proje Durumu

```text
Backend MVP: %92 - %95
Admin Panel MVP: %80 civarı
Mobil Uygulama: %0
Genel Proje: %60 civarı
```

---

## İlk Saha Testi Hedefi

```text
3 organizatör
5 gerçek etkinlik
50 kullanıcı
10-20 gerçek katılım
En az 1 etkinliğin uygulama üzerinden katılımcı toplaması
```

---

## Para Kazanma

İlk MVP'de para kazanma öncelikli değildir.

İlk amaç:

```text
Kullanıcı kazanmak
Organizatör kazanmak
Gerçek etkinlik akışını test etmek
```

Sonraki modeller:

- Öne çıkarılmış etkinlik
- Yerel reklam alanları
- Organizatör abonelik sistemi
- Etkinlik başına küçük komisyon
- Sponsorlu mekan veya kategori

---

## Genel Değerlendirme

Etkinlik Projesi, yerel etkinlikleri ve sosyal organizasyonları tek platformda toplamayı hedefleyen bir uygulamadır.

Backend ve admin panel tarafında güçlü bir MVP seviyesine gelmiştir. Bundan sonraki ana aşama mobil uygulama tarafına başlamak, ardından deploy ve saha testi sürecine geçmektir.
