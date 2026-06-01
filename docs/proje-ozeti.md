\# Proje Özeti



Bu dosya, Etkinlik Projesi'nin genel amacını, hedef kullanıcılarını, temel iş akışını ve teknik yapısını açıklamak için hazırlanmıştır.



\---



\# Proje Adı



Etkinlik Projesi



\---



\# Projenin Genel Amacı



Etkinlik Projesi, kullanıcıların bulundukları şehir veya ilçedeki etkinlikleri, turnuvaları ve sosyal organizasyonları kolayca keşfedebileceği bir mobil uygulama olarak planlanmıştır.



Uygulamanın temel çıkış noktası şu soruya cevap vermektir:



> Bugün ilçemde hangi etkinlik veya turnuva var?



Kullanıcılar uygulama üzerinden onaylı etkinlikleri görebilecek, detaylarını inceleyebilecek ve katılmak istedikleri etkinliklere başvuru yapabilecektir.



Organizatörler ise uygulama üzerinden etkinlik oluşturabilecek, katılımcı toplayabilecek ve kendi etkinliklerini yönetebilecektir.



\---



\# Projenin Temel Fikri



Günümüzde yerel etkinlikler çoğunlukla Instagram, WhatsApp grupları, afişler, kafe duyuruları veya kişisel çevre üzerinden duyurulmaktadır.



Bu durum şu sorunlara yol açmaktadır:



\* Kullanıcılar yakınındaki etkinliklerden haberdar olamamaktadır.

\* Kafeler, kulüpler veya bireysel organizatörler katılımcı toplamakta zorlanmaktadır.

\* Etkinlik duyuruları dağınık platformlarda kalmaktadır.

\* Bir etkinliğin güvenilirliği ve ortamı hakkında önceden bilgi almak zorlaşmaktadır.



Etkinlik Projesi bu sorunu çözmek için bölgesel etkinlikleri tek bir platformda toplamayı hedefler.



\---



\# Uygulamanın Ana Değer Önerisi



Etkinlik Projesi'nin kullanıcıya sunduğu temel değer:



> Yakınındaki etkinlikleri tek yerden keşfet, detayını incele ve kolayca katıl.



Organizatöre sunduğu temel değer:



> Etkinliğini duyur, katılımcı topla ve görünürlüğünü artır.



Admin tarafına sunduğu temel değer:



> Etkinlikleri ve organizatörleri kontrol ederek güvenli bir platform oluştur.



\---



\# Hedef Kullanıcılar



\## 1. Katılımcılar



Etkinliklere katılmak isteyen normal kullanıcılardır.



Örnek kullanıcılar:



\* Tavla turnuvasına katılmak isteyen kişi

\* Halı saha maçı arayan kişi

\* Kutu oyunu etkinliği arayan kişi

\* Satranç turnuvası arayan kişi

\* Sosyal buluşmalara katılmak isteyen kişi

\* Bulunduğu ilçede bugün ne yapılacağını öğrenmek isteyen kişi



\---



\## 2. Organizatörler



Etkinlik oluşturup katılımcı toplamak isteyen kullanıcılardır.



Organizatörler sadece kafe sahipleriyle sınırlı değildir.



Örnek organizatörler:



\* Kafe sahipleri

\* Bireysel organizatörler

\* Halı saha organizasyonu yapan kişiler

\* Kulüpler

\* Topluluklar

\* Okul/üniversite grupları

\* Dernekler

\* Kurumlar

\* Belediye veya gençlik merkezi gibi yapılar



\---



\## 3. Admin



Sistemi yöneten ve güvenliği sağlayan kullanıcıdır.



Adminin temel görevi:



\* Organizatör başvurularını kontrol etmek

\* Etkinlikleri onaylamak veya reddetmek

\* Kategorileri yönetmek

\* Uygunsuz veya sahte içerikleri engellemek



\---



\# Kullanıcı Rolleri



Projede 3 temel kullanıcı rolü vardır:



```text

Participant

Organizer

Admin

```



\---



\## Participant



Normal katılımcı kullanıcıdır.



Yapabilecekleri:



\* Kayıt olabilir.

\* Giriş yapabilir.

\* Onaylı etkinlikleri görebilir.

\* Etkinlik detayına bakabilir.

\* Etkinliğe katılabilir.

\* Etkinlikten ayrılabilir.

\* Katıldığı etkinlikleri görebilir.

\* Organizatör olmak için başvuru yapabilir.



\---



\## Organizer



Admin tarafından onaylanmış organizatör kullanıcıdır.



Yapabilecekleri:



\* Etkinlik oluşturabilir.

\* Kendi etkinliklerini görebilir.

\* Kendi etkinliğine katılan kullanıcıları görebilir.

\* Yeni etkinlikler açarak katılımcı toplayabilir.



Not:



Organizatörün oluşturduğu etkinlikler direkt yayına çıkmaz. Etkinlikler önce admin onayına düşer.



\---



\## Admin



Sistemin yöneticisidir.



Yapabilecekleri:



\* Bekleyen organizatör başvurularını listeleyebilir.

\* Organizatör başvurularını onaylayabilir.

\* Organizatör başvurularını reddedebilir.

\* Bekleyen etkinlikleri listeleyebilir.

\* Etkinlikleri onaylayabilir.

\* Etkinlikleri reddedebilir.

\* Kategori oluşturabilir.



\---



\# Temel Uygulama Akışı



Projenin temel akışı şu şekildedir:



```text

Kullanıcı kayıt olur.

Kullanıcı giriş yapar.

Kullanıcı onaylı etkinlikleri görür.

Kullanıcı isterse organizatör başvurusu yapar.

Admin organizatör başvurusunu inceler.

Admin başvuruyu onaylarsa kullanıcı Organizer rolüne geçer.

Organizer etkinlik oluşturur.

Etkinlik Pending durumunda admin onayına düşer.

Admin etkinliği onaylar.

Etkinlik Approved olur ve kullanıcılar tarafından görülebilir.

Katılımcı etkinliğe katılır.

Katılımcı isterse etkinlikten ayrılır.

Organizer kendi etkinliğine katılan kullanıcıları görür.

```



\---



\# Organizatör Başvuru Mantığı



Uygulamada herkes direkt etkinlik oluşturamaz.



Önce normal kullanıcı olarak kayıt olunur. Daha sonra kullanıcı isterse organizatör başvurusu yapar.



Başvuruda alınan bilgiler:



\* Organizatör adı

\* Organizatör tipi

\* Açıklama

\* Telefon numarası

\* Instagram veya sosyal medya linki

\* Şehir

\* İlçe



Başvuru ilk olarak şu durumda oluşur:



```text

Pending

```



Admin başvuruyu inceler.



Admin onaylarsa:



```text

OrganizerProfile.Status = Approved

User.Role = Organizer

```



olur.



Admin reddederse:



```text

OrganizerProfile.Status = Rejected

```



olur.



\---



\# Etkinlik Oluşturma Mantığı



Onaylı organizatörler etkinlik oluşturabilir.



Etkinlik oluştururken alınan temel bilgiler:



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



Etkinlik oluşturulduğunda direkt yayına çıkmaz.



İlk durum:



```text

Pending

```



Admin onaylarsa:



```text

Approved

```



durumuna geçer.



Kullanıcılar sadece `Approved` durumundaki etkinlikleri görebilir.



\---



\# Etkinlik Katılım Mantığı



Giriş yapan kullanıcılar onaylı etkinliklere katılabilir.



Kurallar:



\* Kullanıcı aynı etkinliğe ikinci kez katılamaz.

\* Etkinlik kontenjanı dolmuşsa yeni katılım yapılamaz.

\* Kullanıcı isterse etkinlikten ayrılabilir.

\* Ayrılan kullanıcının kaydı silinmez, katılım durumu `Cancelled` olur.

\* Aktif katılımlar `Joined` olarak tutulur.



Katılım durumları:



```text

Joined

Cancelled

Attended

NoShow

```



\---



\# Etkinlik Durumları



Etkinlikler aşağıdaki durumlara sahip olabilir:



```text

Pending

Approved

Rejected

Cancelled

Completed

```



\## Pending



Etkinlik oluşturulmuştur ancak henüz admin tarafından onaylanmamıştır.



\## Approved



Etkinlik admin tarafından onaylanmıştır ve kullanıcılar tarafından görülebilir.



\## Rejected



Etkinlik admin tarafından reddedilmiştir.



\## Cancelled



Etkinlik iptal edilmiştir.



\## Completed



Etkinlik tamamlanmıştır.



\---



\# Organizatör Durumları



Organizatör profilleri aşağıdaki durumlara sahip olabilir:



```text

Pending

Approved

Rejected

Suspended

```



\## Pending



Başvuru yapılmıştır, admin onayı beklenmektedir.



\## Approved



Başvuru onaylanmıştır, kullanıcı organizatör olmuştur.



\## Rejected



Başvuru reddedilmiştir.



\## Suspended



Organizatör hesabı askıya alınmıştır.



\---



\# Etkinlik Kategorileri



İlk aşamada kullanılacak temel kategoriler:



```text

Turnuva

Spor

Sosyal Buluşma

Oyun Gecesi

Diğer

```



İleride eklenecek örnek alt alanlar:



\* Tavla

\* Okey

\* Satranç

\* Dama

\* Dart

\* Halı saha

\* Kutu oyunu

\* Quiz night

\* Kulüp tanışma toplantısı

\* Eğitim/seminer

\* Gezi

\* Atölye



\---



\# Teknik Yapı



Proje şu teknik mimari üzerine kurulmaktadır:



```text

Backend: ASP.NET Core Web API

Veritabanı: PostgreSQL

ORM: Entity Framework Core

Authentication: JWT

API Test: Swagger / Postman

Versiyon Kontrol: GitHub

```



İlerleyen aşamalarda eklenecek yapılar:



```text

Mobil Uygulama: React Native / Expo

Admin Panel: Next.js

Bildirim: Firebase Cloud Messaging

Dosya Depolama: Firebase Storage / Cloudflare R2 / S3

```



\---



\# Mevcut Backend Yapısı



Backend klasörü:



```text

backend/EtkinlikProjesi.Api

```



Temel klasörler:



```text

Controllers

Data

Dtos

Models

Migrations

Services

Helpers

```



\---



\# Ana Modeller



Projede şu ana kadar kullanılan temel modeller:



```text

User

OrganizerProfile

Event

EventCategory

EventParticipant

```



\---



\## User



Kullanıcı bilgilerini tutar.



Temel alanlar:



\* Id

\* FullName

\* Email

\* PhoneNumber

\* PasswordHash

\* ProfileImageUrl

\* Role

\* IsActive

\* CreatedAt



\---



\## OrganizerProfile



Organizatör başvuru ve profil bilgilerini tutar.



Temel alanlar:



\* Id

\* UserId

\* OrganizerName

\* OrganizerType

\* Description

\* PhoneNumber

\* InstagramUrl

\* City

\* District

\* Status

\* RejectionReason

\* CreatedAt

\* ApprovedAt



\---



\## Event



Etkinlik bilgilerini tutar.



Temel alanlar:



\* Id

\* OrganizerProfileId

\* EventCategoryId

\* Title

\* Description

\* StartDate

\* EndDate

\* City

\* District

\* LocationName

\* Address

\* Latitude

\* Longitude

\* Capacity

\* IsPaid

\* Price

\* CoverImageUrl

\* Rules

\* Status

\* CreatedAt

\* ApprovedAt



\---



\## EventCategory



Etkinlik kategorilerini tutar.



Temel alanlar:



\* Id

\* Name

\* Description

\* IsActive

\* CreatedAt



\---



\## EventParticipant



Etkinliğe katılan kullanıcıları tutar.



Temel alanlar:



\* Id

\* EventId

\* UserId

\* Status

\* JoinedAt



\---



\# Şu Ana Kadar Tamamlanan Backend Özellikleri



```text

ASP.NET Core Web API projesi oluşturuldu.

PostgreSQL bağlantısı kuruldu.

Entity Framework Core migration sistemi kuruldu.

Veritabanı tabloları oluşturuldu.

Swagger çalıştırıldı.

JWT token üretimi yapıldı.

JWT doğrulama eklendi.

Swagger Bearer token desteği eklendi.

Register endpointi oluşturuldu.

Login endpointi oluşturuldu.

Organizer apply endpointi oluşturuldu.

Organizer my-profile endpointi oluşturuldu.

Admin organizer approval endpointleri oluşturuldu.

Category endpointleri oluşturuldu.

Event create endpointi oluşturuldu.

Admin event approval endpointleri oluşturuldu.

Approved event listeleme endpointi oluşturuldu.

Event filtreleme eklendi.

Event detail endpointi oluşturuldu.

Event join endpointi oluşturuldu.

Event leave endpointi oluşturuldu.

My joined events endpointi oluşturuldu.

Organizer event participants endpointi oluşturuldu.

ParticipantCount response alanı eklendi.

```



\---



\# MVP'de Hedeflenen İlk Kullanım Senaryosu



İlk saha testinde hedeflenen senaryo:



```text

1\. Kullanıcı uygulamaya kayıt olur.

2\. Kullanıcı yakınındaki etkinlikleri görür.

3\. Kullanıcı etkinlik detayına girer.

4\. Kullanıcı etkinliğe katılır.

5\. Kullanıcı isterse organizatör başvurusu yapar.

6\. Admin başvuruyu onaylar.

7\. Organizer etkinlik oluşturur.

8\. Admin etkinliği onaylar.

9\. Diğer kullanıcılar etkinliği görür ve katılır.

```



\---



\# İlk Saha Testi Hedefi



İlk MVP testinde hedef:



```text

3 organizatör

5 gerçek etkinlik

50 kullanıcı

10-20 gerçek katılım

```



Organizatör örnekleri:



```text

1 kafe

1 bireysel halı saha organizatörü

1 kulüp/topluluk

```



Bu test sayesinde uygulamanın sadece kafe etkinliklerinde değil, farklı organizatör tiplerinde de çalışıp çalışmadığı görülecektir.



\---



\# Para Kazanma Mantığı



İlk MVP'de para kazanma öncelikli değildir.



İlk amaç:



```text

Kullanıcı kazanmak

Organizatör kazanmak

Gerçek etkinlik akışını test etmek

```



Sonraki aşamalarda değerlendirilecek para kazanma modelleri:



\* Öne çıkarılmış etkinlik

\* Yerel reklam alanları

\* Organizatör abonelik sistemi

\* Etkinlik başına küçük komisyon

\* Sponsorlu mekan veya sponsorlu kategori

\* Kurumsal/ belediye paneli



\---



\# İlk MVP'de Olmayacak Özellikler



İlk MVP'de aşağıdaki özellikler zorunlu değildir:



\* Online ödeme

\* Komisyon sistemi

\* Uygulama içi mesajlaşma

\* Yorum ve puanlama

\* Gelişmiş reklam paneli

\* Push notification

\* Gerçek dosya/fotoğraf yükleme

\* Harita entegrasyonu

\* Gelişmiş raporlama

\* Otomatik SMS doğrulama

\* Gelişmiş admin panel



Bu özellikler proje gerçek kullanıcılarla test edildikten sonra kademeli olarak eklenebilir.



\---



\# Güvenlik ve Kontrol Mantığı



Projenin güvenilir olması için bazı temel kontroller uygulanır:



\* Herkes direkt organizatör olamaz.

\* Organizatör başvurusu admin onayından geçer.

\* Her etkinlik admin onayından geçer.

\* Kullanıcılar sadece onaylı etkinlikleri görebilir.

\* Aynı kullanıcı aynı etkinliğe tekrar katılamaz.

\* Etkinlik kontenjanı kontrol edilir.

\* Şifreler hashlenerek saklanır.

\* Yetkili endpointlerde JWT token kontrolü yapılır.

\* Admin ve organizer işlemlerinde rol bazlı yetkilendirme uygulanır.



\---



\# Genel Değerlendirme



Etkinlik Projesi, yerel etkinlikleri ve sosyal organizasyonları tek platformda toplayarak hem katılımcılar hem de organizatörler için değer oluşturmayı hedefleyen bir uygulamadır.



Katılımcı için temel değer:



> Yakınımdaki etkinlikleri kolayca bulayım ve katılayım.



Organizatör için temel değer:



> Etkinliğimi duyurayım ve katılımcı toplayayım.



Admin için temel değer:



> Platformun güvenilirliğini ve içerik kalitesini kontrol edeyim.



Proje şu anda backend MVP iskeleti açısından önemli bir seviyeye gelmiştir. Bundan sonraki aşamalarda dokümantasyon, mobil uygulama, admin panel ve saha testi adımları ile proje gerçek kullanıcı testine hazırlanacaktır.



