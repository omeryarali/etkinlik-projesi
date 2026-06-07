# Yayin ve Guvenlik Checklist

Son guncelleme: `2026-06-07`

Bu belge, BiKatil'i canliya almadan once kontrol edilmesi gereken temel adimlari ozetler.

## 1. Backend Ortam Degiskenleri

Asagidaki ayarlar bos birakilmamali:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__SecretKey`
- `Jwt__TokenLifetimeHours`
- `Cors__AllowedOrigins__0`
- gerekiyorsa `Cors__AllowedOrigins__1`, `Cors__AllowedOrigins__2`, ...

Opsiyonel bootstrap admin:

- `BootstrapAdmin__FullName`
- `BootstrapAdmin__Email`
- `BootstrapAdmin__Password`
- `BootstrapAdmin__PhoneNumber`

Not:

- `Jwt__SecretKey` placeholder olamaz.
- Production ortaminda `Cors:AllowedOrigins` bos olursa backend acilmaz.

## 2. Admin Panel Ortam Degiskeni

- `NEXT_PUBLIC_API_BASE_URL`

Ornek:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

## 3. Mobile Ortam Degiskeni

- `EXPO_PUBLIC_API_BASE_URL`

Ornek:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

## 4. Publish Oncesi Komutlar

### Backend

```powershell
dotnet build
```

### Admin Panel

```powershell
npm run lint
npm run build
```

### Mobile

```powershell
npm run lint
```

## 5. Guvenlik Kontrol Listesi

- JWT secret guclu ve production icin ozel mi?
- Allowed origin listesi gercek domainlerle ayarlandi mi?
- Bootstrap admin bilgileri yalnizca ilk kurulum icin mi kullanilacak?
- Admin kullanicisi production sifresi placeholder degil mi?
- Database migrationlari guncel mi?
- Test endpointi public degil mi? (`TestController` artik admin-only ve swagger disi)

## 6. Davranis Kontrolleri

- pasiflestirilen kullanici eski token ile islem yapamiyor mu?
- organizer rolu dusen kullanici eski organizer tokeni ile event acamiyor mu?
- sifre degistiren kullanici yeniden login olmaya zorlaniyor mu?
- ayni kullanici ayni etkinlige cift kayit acamiyor mu?
- admin panel 401 aldiginda oturumu temizleyip login'e donuyor mu?

## 7. Bilinen Sonraki Adimlar

- mobile token storage'i `AsyncStorage` yerine `expo-secure-store` tarafina tasimak
- sifremi unuttum akislarini eklemek
- medya yukleme altyapisini gercek servisle baglamak
- temel smoke test / integration test eklemek
