# Dokümantasyon Dizini

Son güncelleme: `2026-06-05`

Bu klasör, Etkinlik Projesi'nin ürün, akış, veri modeli ve API belgelerini toplar.

## İçerik

- [Proje Özeti](./proje-ozeti.md)
- [MVP Özellikleri](./mvp-ozellikleri.md)
- [Roller ve Akışlar](./roller-ve-akis.md)
- [API Listesi](./api-listesi.md)
- [Veritabanı Tasarımı](./veritabani-tasarimi.md)

## Hangi Doküman Ne İçin?

- `proje-ozeti.md`: Projenin amacı, kapsamı, teknoloji seçimi ve mevcut durumu
- `mvp-ozellikleri.md`: İlk sürümde hedeflenen kapsam ve sınırlar
- `roller-ve-akis.md`: Rol bazlı yetkiler ve temel iş akışları
- `api-listesi.md`: Backend endpoint özeti ve kullanım notları
- `veritabani-tasarimi.md`: Veri modeli ve ilişkiler

## Okuma Sırası Önerisi

1. `proje-ozeti.md`
2. `mvp-ozellikleri.md`
3. `roller-ve-akis.md`
4. `api-listesi.md`
5. `veritabani-tasarimi.md`

## Kaynak Önceliği

Bu dokümanlar kodla hizalanacak şekilde güncellenmiştir; yine de teknik doğruluk için son kaynak her zaman repo içindeki gerçek implementasyondur.

Özellikle doğrulama gereken yerler:

- `backend/EtkinlikProjesi.Api/Controllers`
- `backend/EtkinlikProjesi.Api/Models`
- `backend/EtkinlikProjesi.Api/Data`

## Notlar

- Önceki belgelerde görülen bozuk Türkçe karakterler temizlenmiştir.
- Mobil uygulama artık yalnızca plan seviyesinde değil, repoda aktif ekranlara sahiptir.
- Kategori yönetimi tarafında API ile admin panel arasında geliştirme ihtiyacı bulunan noktalar vardır; detay için `api-listesi.md` dosyasındaki notlara bakılabilir.
