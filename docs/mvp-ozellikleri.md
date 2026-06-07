# MVP Ozellikleri

Son guncelleme: `2026-06-07`

## MVP Hedefi

BiKatil MVP'sinin hedefi, yerel etkinlik kesfi ile organizer yayin akisini uretime yakin bir duzende dogrulamaktir.

Kontrol sorusu:

> Kullanici etkinligi bulup katilabiliyor mu, organizer etkinligi olusturup admin onayi ile yayina alabiliyor mu?

## MVP Icinde Olanlar

### Kimlik ve Hesap

- kayit olma
- login
- `/api/Auth/me`
- profil guncelleme
- sifre degistirme
- rol bazli JWT

### Organizer Akisi

- organizer basvurusu
- organizer profilini gorme
- organizer profilini guncelleme
- admin onayi ile organizer rolune gecis
- organizer askiya alma / tekrar aktif etme

### Etkinlik Akisi

- organizer olarak etkinlik olusturma
- etkinlik guncelleme
- etkinlik iptal etme
- etkinligi tamamlandi yapma
- approved etkinlikleri public listeleme
- detay sayfasi
- sehir, ilce, kategori, tarih, search ve kontenjan filtreleri

### Katilim Akisi

- etkinlige katilma
- etkinlikten ayrilma
- katildigim etkinlikleri gorme
- organizerin katilimcilari gormesi
- `Attended` / `NoShow` isaretleme

### Admin Akisi

- dashboard ozet istatistikleri
- kullanici listeleme
- kullanici aktif / pasif yapma
- organizer listeleme ve yonetme
- etkinlik listeleme ve onay akisi
- kategori yonetimi

### Arayuzler

- admin login ve yonetim sayfalari
- mobil login / register / kesfet / profil / organizer alanlari

## MVP Icinde Guvenlik Tarafi

- sifre hashleme: BCrypt
- JWT dogrulama
- role + active state kontrolu
- token version invalidation
- auth rate limit
- kontrollu CORS

## MVP Disinda Kalanlar

- online odeme
- sponsorlu etkinlik / one cikarma
- push notification
- gercek medya yukleme servisi
- mesajlasma
- yorum ve puanlama
- sifremi unuttum
- SMS veya e-posta dogrulama
- secure device storage gecisi

## MVP Sonrasi Net Oncelikler

1. Mobile token saklamayi `expo-secure-store` seviyesine tasimak
2. Dosya yukleme ve medya servisini eklemek
3. Sifremi unuttum akislarini eklemek
4. Harita / konum deneyimini guclendirmek
5. Push bildirim altyapisini kurmak
