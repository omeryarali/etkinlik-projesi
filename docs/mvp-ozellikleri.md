<!--
Etkinlik Projesi dokümantasyonu
Güncel kapsam: Backend MVP + Admin Panel MVP
-->
# MVP Özellikleri

Bu dosya, Etkinlik Projesi'nin ilk çalışabilir sürümünde bulunacak temel özellikleri ve sonraki sürümlere bırakılacak geliştirmeleri takip etmek için hazırlanmıştır.

MVP, yani Minimum Viable Product, projenin en küçük çalışabilir ürün sürümüdür.

---

## MVP Amacı

> Kullanıcılar bulundukları şehir/ilçedeki etkinlikleri görebilsin, filtreleyebilsin, detayına bakabilsin ve etkinliğe katılabilsin. Organizatörler etkinlik oluşturabilsin. Admin ise organizatörleri, etkinlikleri, kullanıcıları ve kategorileri yönetebilsin.

---

## Kullanıcı Rolleri

```text
Participant
Organizer
Admin
```

### Participant

- Kayıt olabilir.
- Giriş yapabilir.
- Kendi profilini görebilir.
- Profil bilgilerini güncelleyebilir.
- Şifresini değiştirebilir.
- Onaylı etkinlikleri görebilir.
- Etkinlikleri şehir, ilçe, kategori, tarih, ücret durumu, arama ve kontenjana göre filtreleyebilir.
- Etkinlik detayına bakabilir.
- Etkinliğe katılabilir.
- Etkinlikten ayrılabilir.
- Katıldığı etkinlikleri görebilir.
- Organizatör olmak için başvuru yapabilir.

### Organizer

- Etkinlik oluşturabilir.
- Kendi etkinliklerini listeleyebilir.
- Kendi etkinliğini güncelleyebilir.
- Kendi etkinliğini iptal edebilir.
- Kendi etkinliğini tamamlandı olarak işaretleyebilir.
- Kendi etkinliğinin katılımcılarını görebilir.
- Katılımcıları geldi/gelmedi olarak işaretleyebilir.

### Admin

- Dashboard istatistiklerini görebilir.
- Kullanıcıları listeleyebilir.
- Kullanıcıları aktif/pasif yapabilir.
- Organizatörleri onaylayabilir/reddedebilir.
- Organizatörleri askıya alabilir/tekrar aktif edebilir.
- Etkinlikleri onaylayabilir/reddedebilir.
- Kategorileri listeleyebilir.
- Kategori oluşturabilir.
- Kategorileri aktif/pasif yapabilir.

---

## Backend MVP Durumu

```text
Backend MVP: %92 - %95
```

Tamamlanan başlıklar:

```text
ASP.NET Core Web API
PostgreSQL bağlantısı
Entity Framework Core migration sistemi
JWT authentication
Role-based authorization
Swagger Bearer token desteği
CORS ayarı
Register/Login
Current user endpointi
Profil güncelleme
Şifre değiştirme
Organizer başvuru sistemi
Organizer profil güncelleme
Admin organizer onay/red sistemi
Admin organizer suspend/reactivate sistemi
Kategori sistemi
Kategori aktif/pasif sistemi
Etkinlik oluşturma
Etkinlik güncelleme
Etkinlik iptal
Etkinlik tamamlama
Admin etkinlik onay/red sistemi
Onaylı etkinlik listeleme
Gelişmiş etkinlik filtreleri
Pagination
Etkinlik detay endpointi
Etkinliğe katılma/ayrılma
Katıldığım etkinlikler
Organizatör katılımcı listesi
Katılımcı geldi/gelmedi işaretleme
Admin dashboard stats
Admin kullanıcı listeleme
Admin kullanıcı aktif/pasif yapma
Admin etkinlik/organizatör listeleme
```

---

## Admin Panel MVP Durumu

```text
Admin Panel MVP: %80 civarı
```

Tamamlanan sayfalar:

```text
/login
/dashboard
/organizers
/events
/users
/categories
```

Tamamlanan özellikler:

```text
Admin login
Admin rol kontrolü
Token saklama
Token bozulursa otomatik login'e yönlendirme
Logout
Ortak AdminLayout
Sol menü
Dashboard kartları
Dashboard kart linkleri
URL filtreleri
Organizatör listeleme/onaylama/askıya alma/aktif etme
Organizatör detay modalı
Etkinlik listeleme/onaylama/reddetme
Etkinlik detay modalı
Kullanıcı listeleme/aktif-pasif yapma
Kategori listeleme/ekleme/aktif-pasif yapma
Pagination
Status/role filtreleri
Confirm pencereleri
API hata yönetimi
```

---

## MVP'de Olacak Ana Özellikler

### Auth Sistemi

```http
POST /api/Auth/register
POST /api/Auth/login
GET /api/Auth/me
PUT /api/Auth/profile
PUT /api/Auth/change-password
```

### Organizatör Sistemi

```http
POST /api/Organizer/apply
GET /api/Organizer/my-profile
PUT /api/Organizer/profile
GET /api/Admin/organizers
GET /api/Admin/organizers/pending
PUT /api/Admin/organizers/{id}/approve
PUT /api/Admin/organizers/{id}/reject
PUT /api/Admin/organizers/{id}/suspend
PUT /api/Admin/organizers/{id}/reactivate
```

### Kategori Sistemi

```http
GET /api/Category
POST /api/Category
PUT /api/Category/{id}/activate
PUT /api/Category/{id}/deactivate
```

### Etkinlik Sistemi

```http
POST /api/Event
PUT /api/Event/{id}
GET /api/Event/my-events
POST /api/Event/{id}/cancel
POST /api/Event/{id}/complete
GET /api/Event/approved
GET /api/Event/{id}
```

### Katılım Sistemi

```http
POST /api/Event/{id}/join
POST /api/Event/{id}/leave
GET /api/Event/my-joined-events
GET /api/Event/{id}/participants
PUT /api/Event/{eventId}/participants/{userId}/attended
PUT /api/Event/{eventId}/participants/{userId}/no-show
```

### Admin Panel

```text
/login
/dashboard
/organizers
/events
/users
/categories
```

---

## MVP'de Olmayacak Özellikler

- Online ödeme
- Komisyon sistemi
- Reklam ve öne çıkarma
- Push notification
- Gerçek fotoğraf yükleme
- Yorum ve puanlama
- Mesajlaşma sistemi
- Harita entegrasyonu
- Şifremi unuttum
- SMS doğrulama

---

## MVP Başarı Kriterleri

```text
Kullanıcı kayıt/giriş yapabiliyor mu?
JWT token sistemi sorunsuz çalışıyor mu?
Profil güncelleme ve şifre değiştirme çalışıyor mu?
Organizatör başvurusu yapılabiliyor mu?
Admin organizatörü onaylayabiliyor mu?
Organizatör etkinlik oluşturabiliyor mu?
Admin etkinliği onaylayabiliyor mu?
Kullanıcı onaylı etkinlikleri filtreleyebiliyor mu?
Kullanıcı etkinliğe katılabiliyor mu?
Kullanıcı etkinlikten ayrılabiliyor mu?
Katılımcı sayısı doğru geliyor mu?
Admin panelden temel yönetim yapılabiliyor mu?
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

## MVP Sonrası Öncelikli Geliştirmeler

```text
1. Mobil uygulama iskeleti
2. Mobil auth ekranları
3. Mobil etkinlik listeleme/detay/katılım ekranları
4. Backend deploy
5. Admin panel deploy
6. Fotoğraf yükleme sistemi
7. Şifremi unuttum
8. Harita entegrasyonu
9. Push notification
10. Ödeme / komisyon sistemi
```
