\# Roller ve Akış



Bu dosya, Etkinlik Projesi içerisindeki kullanıcı rollerini, her rolün yapabileceklerini ve temel uygulama akışlarını açıklamak için hazırlanmıştır.



\---



\# Genel Rol Yapısı



Etkinlik Projesi'nde 3 temel kullanıcı rolü vardır:



```text

Participant

Organizer

Admin

```



Bu roller uygulamadaki yetki ve işlem sınırlarını belirler.



\---



\# 1. Participant



Participant, uygulamaya kayıt olan normal katılımcı kullanıcıdır.



Kullanıcı sisteme ilk kayıt olduğunda varsayılan olarak şu rol atanır:



```text

Participant

```



\---



\## Participant Ne Yapabilir?



Participant kullanıcının temel yetkileri:



\* Kayıt olabilir.

\* Giriş yapabilir.

\* JWT token alabilir.

\* Onaylı etkinlikleri listeleyebilir.

\* Etkinlikleri şehir, ilçe ve kategoriye göre filtreleyebilir.

\* Etkinlik detayını görüntüleyebilir.

\* Etkinliğe katılabilir.

\* Katıldığı etkinlikten ayrılabilir.

\* Katıldığı etkinlikleri listeleyebilir.

\* Organizatör olmak için başvuru yapabilir.

\* Kendi organizatör başvurusunun durumunu görebilir.



\---



\## Participant Ne Yapamaz?



Participant kullanıcının yapamayacağı işlemler:



\* Direkt etkinlik oluşturamaz.

\* Admin onayı olmadan organizatör olamaz.

\* Başkasının etkinliğinin katılımcı listesini göremez.

\* Etkinlik onaylayamaz veya reddedemez.

\* Organizatör başvurularını göremez.

\* Kategori oluşturamaz.

\* Admin işlemleri yapamaz.



\---



\## Participant Akışı



Participant kullanıcının temel akışı:



```text

Kullanıcı uygulamaya kayıt olur.

Kullanıcı giriş yapar.

Sistem kullanıcıya JWT token döner.

Kullanıcı onaylı etkinlikleri listeler.

Kullanıcı şehir, ilçe veya kategoriye göre filtreleme yapabilir.

Kullanıcı etkinlik detayına girer.

Kullanıcı etkinliğe katılır.

Kullanıcı isterse etkinlikten ayrılır.

Kullanıcı katıldığı etkinlikleri görüntüler.

Kullanıcı isterse organizatör başvurusu yapar.

```



\---



\## Participant İçin Örnek Kullanım Senaryosu



Örnek:



```text

Ahmet uygulamaya kayıt olur.

Ahmet Aydın/Nazilli bölgesindeki onaylı etkinlikleri listeler.

Nazilli Tavla Turnuvası etkinliğini görür.

Etkinlik detayına girer.

Kontenjanı ve kuralları inceler.

Etkinliğe katıl butonuna basar.

Sistem Ahmet'i etkinliğe Joined durumuyla kaydeder.

Ahmet daha sonra vazgeçerse etkinlikten ayrılabilir.

```



\---



\## Participant İle İlgili Endpointler



```http

POST /api/Auth/register

POST /api/Auth/login

GET /api/Event/approved

GET /api/Event/{id}

POST /api/Event/{id}/join

POST /api/Event/{id}/leave

GET /api/Event/my-joined-events

POST /api/Organizer/apply

GET /api/Organizer/my-profile

GET /api/Test/me

```



\---



\# 2. Organizer



Organizer, admin tarafından onaylanmış organizatör kullanıcıdır.



Bir kullanıcı direkt Organizer olarak kayıt olmaz. Önce Participant olarak kayıt olur, sonra organizatör başvurusu yapar.



Admin başvuruyu onaylarsa kullanıcının rolü:



```text

Organizer

```



olur.



\---



\## Organizer Ne Yapabilir?



Organizer kullanıcının temel yetkileri:



\* Participant yetkilerinin çoğunu kullanabilir.

\* Kendi organizatör profilini görüntüleyebilir.

\* Etkinlik oluşturabilir.

\* Kendi oluşturduğu etkinlikleri listeleyebilir.

\* Kendi etkinliğine katılan kullanıcıları görebilir.

\* Etkinliklerinin onay durumunu takip edebilir.



\---



\## Organizer Ne Yapamaz?



Organizer kullanıcının yapamayacağı işlemler:



\* Kendi etkinliğini direkt yayına alamaz.

\* Başkasının etkinliğini yönetemez.

\* Başkasının etkinliğinin katılımcı listesini göremez.

\* Organizatör başvurusu onaylayamaz.

\* Etkinlik onaylayamaz veya reddedemez.

\* Kategori oluşturamaz.

\* Admin işlemleri yapamaz.



\---



\## Organizer Olma Akışı



Organizer olma süreci:



```text

Kullanıcı Participant olarak kayıt olur.

Kullanıcı giriş yapar.

Kullanıcı organizatör başvuru formunu doldurur.

Başvuru Pending durumunda oluşur.

Admin başvuruyu inceler.

Admin başvuruyu onaylarsa OrganizerProfile.Status = Approved olur.

Kullanıcının Role alanı Organizer yapılır.

Kullanıcı tekrar login olduğunda Organizer token alır.

Organizer artık etkinlik oluşturabilir.

```



\---



\## Organizer Başvurusu Durumları



Organizatör profili şu durumlardan birine sahip olabilir:



```text

Pending

Approved

Rejected

Suspended

```



\## Pending



Başvuru yapılmıştır ve admin onayı beklenmektedir.



\## Approved



Başvuru onaylanmıştır. Kullanıcı Organizer rolüne geçmiştir.



\## Rejected



Başvuru reddedilmiştir. Kullanıcı organizatör yetkisi alamaz.



\## Suspended



Organizatör hesabı askıya alınmıştır. Bu durum ileriki sürümlerde aktif kullanılabilir.



\---



\## Organizer Etkinlik Oluşturma Akışı



Organizer etkinlik oluşturduğunda etkinlik direkt yayına çıkmaz.



Akış:



```text

Organizer giriş yapar.

Organizer etkinlik oluşturma formunu doldurur.

Sistem organizatör profilinin Approved olup olmadığını kontrol eder.

Sistem kategori bilgisini kontrol eder.

Sistem zorunlu alanları kontrol eder.

Etkinlik Pending durumunda oluşturulur.

Admin etkinliği inceler.

Admin onaylarsa etkinlik Approved olur.

Etkinlik kullanıcı tarafında görünür hale gelir.

```



\---



\## Organizer Etkinlik Yönetim Akışı



Organizer kendi etkinliklerini görebilir.



Akış:



```text

Organizer giriş yapar.

Kendi etkinliklerim ekranına girer.

Sistem OrganizerProfileId üzerinden organizatörün etkinliklerini getirir.

Organizer etkinliklerin durumunu görür.

Pending etkinlik admin onayı bekler.

Approved etkinlik kullanıcı tarafında görünür.

Rejected etkinlik kullanıcı tarafında görünmez.

```



\---



\## Organizer Katılımcı Listeleme Akışı



Organizer kendi etkinliğine katılan kullanıcıları görebilir.



Akış:



```text

Organizer giriş yapar.

Kendi etkinliklerinden birini seçer.

Katılımcılar ekranına girer.

Sistem etkinliğin bu organizatöre ait olup olmadığını kontrol eder.

Eğer etkinlik organizatöre aitse katılımcı listesi döner.

Başkasının etkinliği ise erişim engellenir.

```



\---



\## Organizer İçin Örnek Kullanım Senaryosu



Örnek:



```text

Ömer uygulamaya Participant olarak kayıt olur.

Organizatör olmak için başvuru yapar.

Başvuruda organizatör adı, telefon, şehir ve ilçe bilgisini girer.

Admin başvuruyu onaylar.

Ömer tekrar giriş yapar ve Organizer rolüyle token alır.

Ömer "Nazilli Tavla Turnuvası" adlı bir etkinlik oluşturur.

Etkinlik Pending olarak admin onayına düşer.

Admin etkinliği onaylar.

Etkinlik uygulamada görünür.

Katılımcılar etkinliğe katılır.

Ömer kendi etkinliğinin katılımcı listesini görebilir.

```



\---



\## Organizer İle İlgili Endpointler



```http

POST /api/Organizer/apply

GET /api/Organizer/my-profile

POST /api/Event

GET /api/Event/my-events

GET /api/Event/{id}/participants

```



\---



\# 3. Admin



Admin, sistemin yönetici kullanıcısıdır.



Admin kullanıcı, uygulamanın güvenli ve kontrollü çalışmasını sağlar.



İlk MVP aşamasında admin kullanıcısı veritabanından manuel olarak atanabilir.



\---



\## Admin Ne Yapabilir?



Admin kullanıcının temel yetkileri:



\* Bekleyen organizatör başvurularını listeleyebilir.

\* Organizatör başvurularını onaylayabilir.

\* Organizatör başvurularını reddedebilir.

\* Bekleyen etkinlikleri listeleyebilir.

\* Etkinlikleri onaylayabilir.

\* Etkinlikleri reddedebilir.

\* Kategori oluşturabilir.

\* Sistemin genel içerik kontrolünü sağlayabilir.



\---



\## Admin Ne Yapamaz?



Admin teknik olarak birçok işlemi yapabilecek yetkiye sahiptir ancak sistem mantığı açısından:



\* Kullanıcı adına otomatik etkinliğe katılım yapmamalıdır.

\* Kullanıcının şifresini göremez.

\* Kullanıcı şifreleri hashli tutulduğu için şifreyi okuyamaz.

\* Etkinlik içeriklerini keyfi değiştirmek yerine onay/red akışı kullanmalıdır.



\---



\## Admin Organizer Onay Akışı



Admin organizatör başvurularını kontrol eder.



Akış:



```text

Admin giriş yapar.

Bekleyen organizatör başvurularını listeler.

Başvuru detayını inceler.

Telefon, açıklama, profil bilgisi ve sosyal medya bilgisini kontrol eder.

Uygunsa başvuruyu onaylar.

Sistem OrganizerProfile.Status alanını Approved yapar.

Sistem kullanıcının Role alanını Organizer yapar.

Uygun değilse başvuruyu reddeder.

Reddederken RejectionReason alanına sebep yazabilir.

```



\---



\## Admin Event Onay Akışı



Admin etkinlik başvurularını kontrol eder.



Akış:



```text

Admin giriş yapar.

Bekleyen etkinlikleri listeler.

Etkinlik başlığı, açıklaması, tarih, konum, kapasite ve kategori bilgisini kontrol eder.

Uygunsa etkinliği onaylar.

Sistem Event.Status alanını Approved yapar.

Sistem ApprovedAt tarihini günceller.

Etkinlik artık kullanıcı tarafında görünür.

Uygun değilse etkinliği reddeder.

Sistem Event.Status alanını Rejected yapar.

```



\---



\## Admin Kategori Yönetim Akışı



Admin etkinlik kategorilerini yönetebilir.



Akış:



```text

Admin giriş yapar.

Kategori oluşturma endpointini kullanır.

Yeni kategori adı ve açıklamasını girer.

Sistem kategoriyi aktif olarak oluşturur.

Kullanıcı ve organizatör tarafında kategori listesinde görünür.

```



\---



\## Admin İçin Örnek Kullanım Senaryosu



Örnek:



```text

Admin uygulamaya giriş yapar.

Bekleyen organizatör başvurularını listeler.

Ömer Organizasyon başvurusunu inceler.

Bilgiler uygunsa başvuruyu onaylar.

Ömer Organizer rolüne geçer.

Daha sonra Ömer bir etkinlik oluşturur.

Admin bekleyen etkinlikleri listeler.

Nazilli Tavla Turnuvası etkinliğini inceler.

Etkinlik bilgileri uygunsa onaylar.

Etkinlik kullanıcı tarafında listelenir.

```



\---



\## Admin İle İlgili Endpointler



```http

GET /api/Admin/organizers/pending

PUT /api/Admin/organizers/{id}/approve

PUT /api/Admin/organizers/{id}/reject

GET /api/Admin/events/pending

PUT /api/Admin/events/{id}/approve

PUT /api/Admin/events/{id}/reject

POST /api/Category

```



\---



\# Temel Sistem Akışları



Bu bölümde uygulamanın ana iş akışları özetlenmiştir.



\---



\# Akış 1: Kullanıcı Kayıt ve Giriş



```text

Kullanıcı kayıt formunu doldurur.

Ad soyad, e-posta, telefon ve şifre gönderilir.

Sistem e-posta daha önce kayıtlı mı kontrol eder.

Şifre BCrypt ile hashlenir.

Kullanıcı Participant rolüyle oluşturulur.

JWT token üretilir.

Kullanıcı giriş yapmış olur.

```



Endpointler:



```http

POST /api/Auth/register

POST /api/Auth/login

```



\---



\# Akış 2: Organizatör Başvurusu



```text

Participant kullanıcı giriş yapar.

Organizatör başvuru formunu doldurur.

Sistem kullanıcının daha önce başvuru yapıp yapmadığını kontrol eder.

Zorunlu alanlar kontrol edilir.

OrganizerProfile kaydı Pending olarak oluşturulur.

Kullanıcı başvuru durumunu my-profile endpointi ile görebilir.

```



Endpointler:



```http

POST /api/Organizer/apply

GET /api/Organizer/my-profile

```



\---



\# Akış 3: Admin Organizatör Onayı



```text

Admin giriş yapar.

Bekleyen organizatör başvurularını listeler.

Başvuru uygunsa onaylar.

OrganizerProfile.Status = Approved olur.

User.Role = Organizer olur.

Kullanıcı tekrar login olduğunda Organizer rolüyle token alır.

```



Endpointler:



```http

GET /api/Admin/organizers/pending

PUT /api/Admin/organizers/{id}/approve

PUT /api/Admin/organizers/{id}/reject

```



\---



\# Akış 4: Organizer Etkinlik Oluşturma



```text

Organizer giriş yapar.

Etkinlik formunu doldurur.

Sistem OrganizerProfile.Status değerinin Approved olup olmadığını kontrol eder.

Kategori geçerli mi kontrol edilir.

Zorunlu alanlar kontrol edilir.

Kontenjan kontrol edilir.

Ücretli etkinlikse fiyat kontrol edilir.

Etkinlik Pending durumunda oluşturulur.

```



Endpointler:



```http

POST /api/Event

GET /api/Event/my-events

```



\---



\# Akış 5: Admin Etkinlik Onayı



```text

Admin giriş yapar.

Pending durumundaki etkinlikleri listeler.

Etkinlik bilgilerini kontrol eder.

Uygunsa onaylar.

Event.Status = Approved olur.

ApprovedAt tarihi atanır.

Etkinlik kullanıcı tarafında görünür hale gelir.

Uygun değilse reddeder.

Event.Status = Rejected olur.

```



Endpointler:



```http

GET /api/Admin/events/pending

PUT /api/Admin/events/{id}/approve

PUT /api/Admin/events/{id}/reject

```



\---



\# Akış 6: Etkinlik Listeleme ve Filtreleme



```text

Kullanıcı uygulamayı açar.

Sistem Approved etkinlikleri listeler.

Kullanıcı isterse şehir filtresi uygular.

Kullanıcı isterse ilçe filtresi uygular.

Kullanıcı isterse kategori filtresi uygular.

Sistem filtreye uygun etkinlikleri döndürür.

```



Endpoint:



```http

GET /api/Event/approved

```



Filtre örnekleri:



```http

GET /api/Event/approved?city=Aydın

GET /api/Event/approved?city=Aydın\&district=Nazilli

GET /api/Event/approved?city=Aydın\&district=Nazilli\&categoryId=1

```



\---



\# Akış 7: Etkinlik Detayı



```text

Kullanıcı listeden bir etkinliğe tıklar.

Sistem etkinliğin Approved olup olmadığını kontrol eder.

Onaylı etkinlikse detay bilgileri döner.

Etkinlik bilgileri, organizatör adı, kategori adı, konum, kontenjan ve katılımcı sayısı gösterilir.

```



Endpoint:



```http

GET /api/Event/{id}

```



\---



\# Akış 8: Etkinliğe Katılım



```text

Kullanıcı giriş yapar.

Kullanıcı onaylı etkinlik detayına girer.

Katıl butonuna basar.

Sistem etkinliğin Approved olup olmadığını kontrol eder.

Sistem kullanıcının daha önce katılıp katılmadığını kontrol eder.

Sistem kontenjan dolu mu kontrol eder.

Uygunsa EventParticipant kaydı oluşturulur.

Katılım durumu Joined olur.

```



Endpoint:



```http

POST /api/Event/{id}/join

```



\---



\# Akış 9: Etkinlikten Ayrılma



```text

Kullanıcı katıldığı etkinlikten ayrılmak ister.

Sistem kullanıcının aktif Joined kaydını bulur.

Kayıt silinmez.

EventParticipant.Status = Cancelled yapılır.

Katılımcı sayısı artık bu kullanıcıyı aktif katılımcı olarak saymaz.

```



Endpoint:



```http

POST /api/Event/{id}/leave

```



\---



\# Akış 10: Katıldığım Etkinlikler



```text

Kullanıcı giriş yapar.

Katıldığım etkinlikler ekranına girer.

Sistem kullanıcının Joined durumundaki etkinliklerini listeler.

Cancelled olan katılımlar listelenmez.

```



Endpoint:



```http

GET /api/Event/my-joined-events

```



\---



\# Akış 11: Organizer Katılımcı Listesi



```text

Organizer giriş yapar.

Kendi etkinliklerinden birini seçer.

Katılımcılar listesini açar.

Sistem etkinliğin bu organizatöre ait olup olmadığını kontrol eder.

Eğer etkinlik organizatöre aitse Joined durumundaki katılımcıları listeler.

```



Endpoint:



```http

GET /api/Event/{id}/participants

```



\---



\# Yetki Özeti



| İşlem                      | Public | Authorize | Participant | Organizer | Admin |

| -------------------------- | -----: | --------: | ----------: | --------: | ----: |

| Kayıt olma                 |   Evet |     Hayır |        Evet |      Evet |  Evet |

| Giriş yapma                |   Evet |     Hayır |        Evet |      Evet |  Evet |

| Onaylı etkinlikleri görme  |   Evet |     Hayır |        Evet |      Evet |  Evet |

| Etkinlik detayı görme      |   Evet |     Hayır |        Evet |      Evet |  Evet |

| Etkinliğe katılma          |  Hayır |      Evet |        Evet |      Evet |  Evet |

| Etkinlikten ayrılma        |  Hayır |      Evet |        Evet |      Evet |  Evet |

| Organizatör başvurusu      |  Hayır |      Evet |        Evet |     Hayır | Hayır |

| Etkinlik oluşturma         |  Hayır |      Evet |       Hayır |      Evet | Hayır |

| Kendi etkinliklerini görme |  Hayır |      Evet |       Hayır |      Evet | Hayır |

| Katılımcı listesini görme  |  Hayır |      Evet |       Hayır |      Evet | Hayır |

| Organizatör onaylama       |  Hayır |      Evet |       Hayır |     Hayır |  Evet |

| Etkinlik onaylama          |  Hayır |      Evet |       Hayır |     Hayır |  Evet |

| Kategori oluşturma         |  Hayır |      Evet |       Hayır |     Hayır |  Evet |



\---



\# Güvenlik Akışı



Sistemde güvenlik için şu kurallar uygulanır:



```text

Şifreler düz metin olarak saklanmaz.

Şifreler BCrypt ile hashlenir.

JWT token ile kimlik doğrulama yapılır.

Rol bazlı yetkilendirme uygulanır.

Admin endpointleri sadece Admin rolüne açıktır.

Organizer endpointleri sadece Organizer rolüne açıktır.

Kullanıcı sadece kendi verisine erişebilir.

Organizer sadece kendi etkinliğinin katılımcılarını görebilir.

Etkinlikler admin onayı olmadan yayına çıkmaz.

Organizatörler admin onayı olmadan etkinlik oluşturamaz.

```



\---



\# Genel Özet



Etkinlik Projesi'nde temel mantık şu şekildedir:



```text

Participant kullanıcı sistemi kullanır ve etkinliklere katılır.

Participant isterse organizatör başvurusu yapar.

Admin başvuruyu onaylarsa kullanıcı Organizer olur.

Organizer etkinlik oluşturur.

Admin etkinliği onaylarsa etkinlik yayına çıkar.

Participant kullanıcılar etkinliği görür ve katılır.

Organizer kendi etkinliğinin katılımcılarını takip eder.

Admin sistem güvenliğini ve içerik kontrolünü sağlar.

```



Bu rol ve akış yapısı, projenin ilk MVP sürümü için yeterli temel yapıyı sağlar.



