# Proje Ozeti

Son guncelleme: `2026-06-07`

## Projenin Amaci

BiKatil, kullanicilarin yakinlarindaki etkinlikleri kesfedebildigi, organizerlerin etkinlik yayinlayabildigi ve admin ekibinin tum platformu tek merkezden yonetebildigi bir etkinlik platformudur.

Temel urun sorusu:

> Kullanici yakinindaki iyi etkinligi hizli bulabiliyor ve organizer bu etkinligi guvenli sekilde yayina alabiliyor mu?

## Repo Bilesenleri

Bu repoda 3 ana uygulama bulunur:

- `backend/EtkinlikProjesi.Api`: ASP.NET Core Web API
- `admin-panel`: Next.js tabanli admin arayuzu
- `mobile`: Expo / React Native mobil uygulama

## Teknik Yigin

### Backend

- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- Swagger

### Admin Panel

- Next.js 16
- React 19
- Tailwind CSS 4

### Mobile

- Expo
- React Native
- expo-router
- AsyncStorage

## Mevcut Urun Durumu

### Backend

Backend calisir durumda ve temel is akislarini kapsiyor:

- kayit, login, profil guncelleme, sifre degistirme
- organizer basvurusu ve organizer profil yonetimi
- kategori yonetimi
- etkinlik olusturma, guncelleme, iptal, tamamlama
- public etkinlik listeleme ve detay
- etkinlige katilma, ayrilma ve katilimci yoklamasi
- admin dashboard ve listeleme endpointleri

### Admin Panel

Admin panel aktif ve build alir durumda:

- `/login`
- `/dashboard`
- `/organizers`
- `/events`
- `/users`
- `/categories`

### Mobile

Mobil uygulama aktif gelistirme asamasinda ve ana urun akislarini kapsiyor:

- login / register
- kesfet
- etkinlik detay
- etkinliklerim
- organizer basvurusu
- organizer etkinlikleri
- profil, profil duzenleme, sifre degistirme

## Bu Guncellemede Sertlestirilen Alanlar

- JWT tokenlari artik `TokenVersion` ile izleniyor.
- Kullanici pasiflestirilirse, rolu degisirse veya sifresi degisirse eski tokenlar gecersiz kaliyor.
- `Auth/register` ve `Auth/login` icin rate limit eklendi.
- Genel API trafigi icin global rate limit eklendi.
- CORS artik tum ortamlarda kontrollu calisiyor; production icin explicit origin bekleniyor.
- Uygulama acilisinda migration calistirma ve istege bagli bootstrap admin olusturma akisi eklendi.
- `Users.NormalizedEmail`, `OrganizerProfiles.UserId` ve `EventParticipants(EventId, UserId)` tarafinda veritabani tekilligi eklendi.
- Admin panelde token yalnizca tek yerde saklaniyor.
- Mobile tarafta token kullanici objesi icinde tekrarli saklanmiyor.

## Bilinen Sinirlar

- Mobile tarafi hala `AsyncStorage` kullaniyor; daha guclu bir sonraki adim `expo-secure-store`.
- Dosya yukleme / medya altyapisi henuz gercek servisle bagli degil.
- Sifremi unuttum, e-posta dogrulama ve push notification akislari henuz yok.

## Dizin Yapisi

```text
EtkinlikProjesi
|-- backend
|   `-- EtkinlikProjesi.Api
|-- admin-panel
|-- mobile
`-- docs
```

## Son Dogrulama

Bu guncelleme sonrasinda asagidaki kontroller basariyla calisti:

- `dotnet build` (`backend/EtkinlikProjesi.Api`)
- `npm run lint` (`admin-panel`)
- `npm run build` (`admin-panel`)
- `npm run lint` (`mobile`)
