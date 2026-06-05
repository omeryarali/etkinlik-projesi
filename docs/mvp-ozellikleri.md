# MVP Özellikleri

Son güncelleme: `2026-06-05`

## MVP Hedefi

İlk çalışır sürümün hedefi, yerel etkinlik keşfi ve temel yönetim akışlarını üretime yakın biçimde doğrulamaktır.

MVP sorusu:

> Kullanıcı etkinliği bulabiliyor, katılabiliyor ve organizer tarafı etkinlik yayınlayabiliyor mu?

## Kapsamdaki Roller

- `Participant`
- `Organizer`
- `Admin`

## MVP İçinde Olan Özellikler

### Kimlik Doğrulama ve Profil

- Kayıt olma
- Giriş yapma
- Mevcut kullanıcıyı görüntüleme
- Profil güncelleme
- Şifre değiştirme

### Organizer Akışı

- Organizer başvurusu yapma
- Kendi organizer profilini görüntüleme
- Organizer profilini güncelleme
- Admin onayı sonrası organizer rolü kazanma
- Askıya alınan organizerin tekrar aktifleştirilmesi

### Kategori Yönetimi

- Aktif kategorileri listeleme
- Admin tarafından kategori oluşturma
- Kategoriyi aktif yapma
- Kategoriyi pasif yapma

### Etkinlik Yönetimi

- Organizer olarak etkinlik oluşturma
- Organizer olarak etkinlik güncelleme
- Etkinlik iptal etme
- Etkinliği tamamlandı yapma
- Onaylı etkinlikleri public olarak listeleme
- Şehir, ilçe, kategori, tarih, ücret, arama ve kontenjan filtreleri
- Etkinlik detay sayfası

### Katılım Yönetimi

- Etkinliğe katılma
- Etkinlikten ayrılma
- Katıldığım etkinlikleri listeleme
- Organizerin kendi etkinlik katılımcılarını görmesi
- Katılımcıyı `Attended` veya `NoShow` olarak işaretleme

### Admin Yönetimi

- Dashboard istatistikleri
- Kullanıcı listeleme
- Kullanıcıyı aktif/pasif yapma
- Organizer listeleme
- Organizer onaylama
- Organizer reddetme
- Organizer askıya alma
- Organizeri yeniden aktifleştirme
- Etkinlik listeleme
- Etkinlik onaylama
- Etkinlik reddetme

### Admin Panel

- Admin login
- Yetkisiz kullanıcıyı login sayfasına yönlendirme
- Dashboard ekranı
- Organizer yönetim ekranı
- Event yönetim ekranı
- User yönetim ekranı
- Category yönetim ekranı

### Mobile

Mobil uygulama MVP öncesi aktif geliştirme aşamasında.

Repoda mevcut olan ana mobil akışlar:

- Giriş
- Kayıt
- Ana sayfada yaklaşan etkinlikler
- Etkinlik detayı
- Profil ekranı
- Profil düzenleme
- Şifre değiştirme
- Katıldığım etkinlikler
- Organizer başvurusu
- Organizer etkinlik akışları

## Kısmen Tamamlanmış veya Dikkat Gerektiren Alanlar

- Mobil arayüzler mevcut olsa da uçtan uca doğrulama tamamlanmış kabul edilmemeli
- Kategori yönetimi için admine özel "tüm kategoriler" listeleme endpointi henüz yok
- Dosya yükleme ve medya yönetimi henüz gerçek altyapıya bağlı değil
- Ortam değişkenleri ve deploy dokümanı henüz eksik

## MVP Dışında Kalan Özellikler

- Online ödeme
- Komisyon sistemi
- Sponsorlu etkinlik ve öne çıkarma
- Push notification
- Gerçek medya yükleme altyapısı
- Mesajlaşma
- Yorum ve puanlama
- Harita entegrasyonu
- Şifremi unuttum akışı
- SMS veya e-posta doğrulama

## MVP Başarı Kriterleri

- Kullanıcı kayıt ve giriş yapabiliyor
- JWT tabanlı yetkilendirme stabil çalışıyor
- Organizer başvurusu admin tarafından yönetilebiliyor
- Organizer etkinlik oluşturabiliyor
- Admin etkinliği onaylayabiliyor
- Kullanıcı etkinlikleri filtreleyebiliyor
- Kullanıcı etkinliğe katılabiliyor ve ayrılabiliyor
- Organizer katılımcı listesini yönetebiliyor
- Admin panel temel yönetim görevlerini tamamlayabiliyor

## İlk Saha Testi Hedefi

```text
3 organizer
5 gerçek etkinlik
50 kullanıcı
10-20 gerçek katılım
En az 1 etkinliğin uygulama üzerinden katılımcı toplaması
```

## MVP Sonrası Öncelikler

1. Mobil uygulamayı üretim kalitesine taşımak
2. Backend ve admin panel deploy sürecini oturtmak
3. Medya yükleme altyapısı eklemek
4. Şifremi unuttum akışını eklemek
5. Harita ve konum deneyimini geliştirmek
6. Bildirim sistemini eklemek
