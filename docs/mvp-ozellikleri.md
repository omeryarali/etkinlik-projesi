\# MVP Özellikleri



Bu dosya, Etkinlik Projesi'nin ilk çalışabilir sürümünde bulunacak temel özellikleri ve sonraki sürümlere bırakılacak geliştirmeleri takip etmek için hazırlanmıştır.



MVP, yani \*\*Minimum Viable Product\*\*, projenin en küçük çalışabilir ürün sürümüdür.

Amaç, uygulamanın temel fikrini hızlıca test edebilmek ve gerçek kullanıcılardan geri bildirim alabilmektir.



\---



\# Projenin MVP Amacı



Etkinlik Projesi'nin ilk MVP amacı:



> Kullanıcılar bulundukları şehir/ilçedeki etkinlikleri görebilsin, etkinlik detayına bakabilsin ve etkinliğe katılabilsin. Organizatörler etkinlik oluşturabilsin. Admin ise organizatör ve etkinlikleri onaylayabilsin.



Bu ilk sürümde amaç para kazanmak değil, sistemin çalıştığını ve insanların uygulamayı kullanmak isteyip istemediğini test etmektir.



\---



\# Kullanıcı Rolleri



MVP sürümünde 3 temel rol bulunur:



\## 1. Participant



Normal katılımcı kullanıcıdır.



Yapabilecekleri:



\* Kayıt olabilir.

\* Giriş yapabilir.

\* Onaylı etkinlikleri görebilir.

\* Şehir, ilçe ve kategoriye göre etkinlik filtreleyebilir.

\* Etkinlik detayına bakabilir.

\* Etkinliğe katılabilir.

\* Katıldığı etkinlikten ayrılabilir.

\* Katıldığı etkinlikleri görebilir.

\* Organizatör olmak için başvuru yapabilir.



\---



\## 2. Organizer



Admin tarafından onaylanmış organizatör kullanıcıdır.



Yapabilecekleri:



\* Kendi organizatör profilini görüntüleyebilir.

\* Etkinlik oluşturabilir.

\* Oluşturduğu etkinlikleri görebilir.

\* Kendi etkinliğine katılan kullanıcıları listeleyebilir.



Not:



Organizatörün oluşturduğu etkinlikler direkt yayına çıkmaz. Önce admin onayına düşer.



\---



\## 3. Admin



Sistemi yöneten kullanıcıdır.



Yapabilecekleri:



\* Bekleyen organizatör başvurularını görebilir.

\* Organizatör başvurularını onaylayabilir.

\* Organizatör başvurularını reddedebilir.

\* Bekleyen etkinlikleri görebilir.

\* Etkinlikleri onaylayabilir.

\* Etkinlikleri reddedebilir.

\* Kategori oluşturabilir.



\---



\# MVP'de Olacak Özellikler



\## 1. Auth Sistemi



Durum: Tamamlandı



MVP'de kullanıcı kayıt ve giriş sistemi bulunur.



Özellikler:



\* Kullanıcı kayıt olabilir.

\* Kullanıcı giriş yapabilir.

\* Şifreler hashlenerek veritabanına kaydedilir.

\* Giriş yapan kullanıcıya JWT token döner.

\* Rol bazlı yetkilendirme yapılır.



Endpointler:



```http

POST /api/Auth/register

POST /api/Auth/login

GET /api/Test/me

```



\---



\## 2. Rol Sistemi



Durum: Tamamlandı



MVP'de 3 temel rol vardır:



```text

Participant

Organizer

Admin

```



Varsayılan kayıt olan kullanıcı:



```text

Participant

```



rolüyle oluşturulur.



Admin onayından geçen kullanıcı:



```text

Organizer

```



rolüne geçirilir.



Admin kullanıcı şimdilik veritabanından manuel olarak ayarlanır.



\---



\## 3. Organizatör Başvuru Sistemi



Durum: Tamamlandı



Katılımcı kullanıcı organizatör olmak için başvuru yapabilir.



Başvuru ilk olarak:



```text

Pending

```



durumunda oluşur.



Admin başvuruyu kontrol eder ve onaylar ya da reddeder.



Endpointler:



```http

POST /api/Organizer/apply

GET /api/Organizer/my-profile

GET /api/Admin/organizers/pending

PUT /api/Admin/organizers/{id}/approve

PUT /api/Admin/organizers/{id}/reject

```



\---



\## 4. Etkinlik Kategori Sistemi



Durum: Tamamlandı



Etkinlikler kategoriye bağlı oluşturulur.



İlk kategori örnekleri:



```text

Turnuva

Spor

Sosyal Buluşma

Oyun Gecesi

Diğer

```



Endpointler:



```http

GET /api/Category

POST /api/Category

```



\---



\## 5. Etkinlik Oluşturma Sistemi



Durum: Tamamlandı



Onaylı organizatör etkinlik oluşturabilir.



Etkinlik oluştururken temel bilgiler alınır:



\* Kategori

\* Başlık

\* Açıklama

\* Başlangıç tarihi

\* Bitiş tarihi

\* Şehir

\* İlçe

\* Konum adı

\* Adres

\* Latitude

\* Longitude

\* Kontenjan

\* Ücretli/ücretsiz bilgisi

\* Fiyat

\* Kapak görseli URL

\* Kurallar



Etkinlik ilk oluşturulduğunda:



```text

Pending

```



durumundadır.



Endpointler:



```http

POST /api/Event

GET /api/Event/my-events

```



\---



\## 6. Admin Etkinlik Onay Sistemi



Durum: Tamamlandı



Admin, organizatörlerin oluşturduğu etkinlikleri kontrol eder.



Admin etkinliği onaylarsa etkinlik:



```text

Approved

```



durumuna geçer.



Admin etkinliği reddederse etkinlik:



```text

Rejected

```



durumuna geçer.



Endpointler:



```http

GET /api/Admin/events/pending

PUT /api/Admin/events/{id}/approve

PUT /api/Admin/events/{id}/reject

```



\---



\## 7. Onaylı Etkinlikleri Listeleme



Durum: Tamamlandı



Kullanıcılar sadece admin tarafından onaylanmış etkinlikleri görebilir.



Endpoint:



```http

GET /api/Event/approved

```



Filtreleme desteklenir:



```http

GET /api/Event/approved?city=Aydın

GET /api/Event/approved?city=Aydın\&district=Nazilli

GET /api/Event/approved?city=Aydın\&district=Nazilli\&categoryId=1

```



Filtre alanları:



\* Şehir

\* İlçe

\* Kategori



\---



\## 8. Etkinlik Detay Sayfası İçin API



Durum: Tamamlandı



Kullanıcı bir etkinliğe tıkladığında etkinlik detayını görebilir.



Endpoint:



```http

GET /api/Event/{id}

```



Bu endpoint sadece onaylı etkinlikleri döndürür.



\---



\## 9. Etkinliğe Katılım Sistemi



Durum: Tamamlandı



Giriş yapan kullanıcı onaylı etkinliğe katılabilir.



Kurallar:



\* Aynı kullanıcı aynı etkinliğe ikinci kez katılamaz.

\* Kontenjan doluysa katılım yapılamaz.

\* Kullanıcı isterse etkinlikten ayrılabilir.

\* Ayrılan kullanıcının kaydı silinmez, durumu `Cancelled` yapılır.



Endpointler:



```http

POST /api/Event/{id}/join

POST /api/Event/{id}/leave

GET /api/Event/my-joined-events

```



\---



\## 10. Katılımcı Sayısı



Durum: Tamamlandı



Etkinlik listesinde ve detayında katılımcı sayısı döner.



Örnek:



```text

participantCount: 12

capacity: 32

```



Mobil uygulamada şu şekilde gösterilebilir:



```text

12 / 32 kişi katıldı

```



\---



\## 11. Organizatör Katılımcıları Görebilsin



Durum: Tamamlandı



Organizatör kendi etkinliğine katılan kullanıcıları görebilir.



Endpoint:



```http

GET /api/Event/{id}/participants

```



Organizatör sadece kendi etkinliğinin katılımcılarını görebilir.



\---



\# MVP Backend Durumu



Backend tarafında tamamlanan ana parçalar:



```text

ASP.NET Core Web API kurulumu

PostgreSQL bağlantısı

Entity Framework Core migration sistemi

JWT authentication

Role-based authorization

Swagger Bearer token desteği

CORS ayarı

Register/Login

Organizer başvuru sistemi

Admin organizer onay sistemi

Kategori sistemi

Etkinlik oluşturma sistemi

Admin etkinlik onay sistemi

Etkinlik listeleme ve filtreleme

Etkinlik detay endpointi

Etkinliğe katılma/ayrılma

Katılımcı sayısı

Organizatör katılımcı listesi

```



\---



\# MVP'de Olmayacak, Sonraya Bırakılacak Özellikler



Aşağıdaki özellikler ilk MVP sürümüne dahil edilmeyecektir. Sistem test edilip gerçek kullanıcı geri bildirimi alındıktan sonra eklenecektir.



\## 1. Ödeme Sistemi



İlk sürümde uygulama üzerinden ödeme alınmayacak.



Ücretli etkinlik varsa sadece bilgi olarak gösterilecek.



Örnek:



```text

Katılım ücreti: 100 TL

Ödeme: Mekanda yapılacaktır.

```



Sonraki aşamada ödeme sistemi eklenebilir.



\---



\## 2. Komisyon Sistemi



İlk MVP'de komisyon alınmayacak.



Komisyon sistemi ileride, uygulama gerçek kullanıcı ve organizatör kazandıktan sonra değerlendirilecektir.



\---



\## 3. Reklam ve Öne Çıkarma



İlk MVP'de reklam paneli olmayacak.



Sonraki aşamalarda şunlar eklenebilir:



\* Öne çıkarılmış etkinlik

\* Öne çıkarılmış organizatör

\* Yerel işletme reklamları

\* Ana sayfa sponsorlu alanlar



\---



\## 4. Mobil Bildirimler



İlk MVP'de push notification zorunlu değildir.



Sonraki aşamada Firebase Cloud Messaging ile şu bildirimler eklenebilir:



\* Etkinlik onaylandı

\* Etkinliğe yeni katılımcı geldi

\* Etkinlik tarihi yaklaşıyor

\* Organizatör başvurusu onaylandı

\* Yeni etkinlik yayınlandı



\---



\## 5. Fotoğraf Yükleme



İlk MVP'de gerçek dosya yükleme yapılmayabilir.



Şimdilik `coverImageUrl` alanı kullanılabilir.



Sonraki aşamada şunlar eklenebilir:



\* Etkinlik kapak fotoğrafı yükleme

\* Etkinlik galeri fotoğrafları

\* Organizatör profil fotoğrafı

\* Etkinlik sonrası fotoğraflar



Dosya depolama için ileride şu servisler değerlendirilebilir:



\* Firebase Storage

\* Cloudflare R2

\* AWS S3

\* Supabase Storage



\---



\## 6. Yorum ve Puanlama



İlk MVP'de yorum ve puanlama sistemi olmayacak.



Sonraki aşamada etkinlik sonrası kullanıcı yorumları ve organizatör puanlama eklenebilir.



\---



\## 7. Mesajlaşma Sistemi



İlk MVP'de uygulama içi mesajlaşma olmayacak.



İlk aşamada iletişim için telefon/Instagram/WhatsApp bilgileri kullanılabilir.



\---



\## 8. Gelişmiş Admin Panel



İlk etapta admin işlemleri API üzerinden ve daha sonra basit web panel üzerinden yönetilecektir.



Gelişmiş admin panel sonraya bırakılabilir.



İleride admin panelde şunlar olabilir:



\* Dashboard

\* Kullanıcı yönetimi

\* Organizatör yönetimi

\* Etkinlik yönetimi

\* Kategori yönetimi

\* Şikayet yönetimi

\* Raporlama

\* İstatistikler



\---



\## 9. Gelişmiş Arama



İlk MVP'de temel filtreleme yeterlidir:



\* Şehir

\* İlçe

\* Kategori



Sonraki aşamada şunlar eklenebilir:



\* Tarihe göre filtre

\* Ücretsiz/ücretli filtre

\* Yakınımdaki etkinlikler

\* Harita üzerinden arama

\* Anahtar kelime arama

\* Bugün/Yarın/Bu hafta filtreleri



\---



\## 10. Harita Entegrasyonu



İlk MVP'de latitude/longitude alanları tutulabilir fakat harita entegrasyonu zorunlu değildir.



Sonraki aşamada Google Maps veya Mapbox kullanılabilir.



\---



\# MVP Başarı Kriterleri



İlk MVP'nin başarılı sayılması için teknik ve saha tarafında bazı hedefler belirlenmelidir.



\## Teknik Başarı Kriterleri



```text

Kullanıcı kayıt/giriş yapabiliyor mu?

JWT token sistemi sorunsuz çalışıyor mu?

Organizatör başvurusu yapılabiliyor mu?

Admin organizatörü onaylayabiliyor mu?

Organizatör etkinlik oluşturabiliyor mu?

Admin etkinliği onaylayabiliyor mu?

Kullanıcı onaylı etkinlikleri görebiliyor mu?

Kullanıcı etkinliğe katılabiliyor mu?

Kullanıcı etkinlikten ayrılabiliyor mu?

Katılımcı sayısı doğru geliyor mu?

```



\---



\## Saha Başarı Kriterleri



İlk gerçek test için hedefler:



```text

3 organizatör bulunması

5 gerçek etkinlik açılması

50 kullanıcının uygulamayı denemesi

10-20 gerçek etkinlik katılımı alınması

En az 1 etkinliğin uygulama üzerinden dolması veya katılımcı toplaması

```



\---



\# İlk Saha Testi Senaryosu



İlk saha testi için önerilen senaryo:



```text

1 kafe etkinliği

1 bireysel halı saha etkinliği

1 kulüp/topluluk etkinliği

```



Bu şekilde sistemin sadece kafe değil, farklı organizatör tipleri için de çalışıp çalışmadığı test edilir.



\---



\# İlk MVP Akışı



Genel akış şu şekildedir:



```text

Kullanıcı kayıt olur

Kullanıcı giriş yapar

Kullanıcı organizatör başvurusu yapar

Admin başvuruyu onaylar

Kullanıcı Organizer rolüne geçer

Organizer etkinlik oluşturur

Etkinlik Pending durumuna düşer

Admin etkinliği onaylar

Etkinlik Approved olur

Katılımcılar etkinliği görür

Katılımcı etkinliğe katılır

Katılımcı isterse etkinlikten ayrılır

Organizer katılımcı listesini görür

```



\---



\# MVP Sonrası Öncelikli Geliştirmeler



MVP tamamlandıktan sonra ilk eklenecek özellikler şu sırada değerlendirilebilir:



```text

1\. Mobil uygulama tasarımı ve ekranları

2\. Admin panel web arayüzü

3\. Profil güncelleme

4\. Etkinlik güncelleme/iptal

5\. Fotoğraf yükleme sistemi

6\. Tarih ve ücret filtreleri

7\. Bildirim sistemi

8\. Harita entegrasyonu

9\. Reklam/öne çıkarma modeli

10\. Ödeme ve komisyon sistemi

```



\---



\# Notlar



Bu MVP sürümünde en önemli amaç teknik olarak mükemmel bir sistem yapmak değil, fikrin çalışıp çalışmadığını test etmektir.



İlk sürümde öncelik:



```text

Basitlik

Güvenilirlik

Admin kontrolü

Gerçek etkinlik oluşturma

Gerçek katılımcı toplama

```



olmalıdır.



Proje büyüdükçe özellikler kademeli olarak eklenmelidir.



