# Docs

Son guncelleme: `2026-06-07`

Bu klasor, BiKatil reposunun urun, teknik yapi, API ve yayin hazirligi dokumantasyonunu toplar.

## Icerik

- [Proje Ozeti](./proje-ozeti.md)
- [MVP Ozellikleri](./mvp-ozellikleri.md)
- [Roller ve Akislar](./roller-ve-akis.md)
- [API Listesi](./api-listesi.md)
- [Veritabani Tasarimi](./veritabani-tasarimi.md)
- [Yayin ve Guvenlik Checklist](./yayin-ve-guvenlik-checklist.md)

## Onerilen Okuma Sirasi

1. `proje-ozeti.md`
2. `roller-ve-akis.md`
3. `api-listesi.md`
4. `veritabani-tasarimi.md`
5. `yayin-ve-guvenlik-checklist.md`
6. `mvp-ozellikleri.md`

## Bu Dokumanlar Ne Icin Var?

- `proje-ozeti.md`: repodaki 3 uygulamanin ne yaptigi ve bugunku durumu
- `mvp-ozellikleri.md`: MVP kapsaminda kalan ve sonraya birakilan alanlar
- `roller-ve-akis.md`: Participant, Organizer ve Admin yetkileri
- `api-listesi.md`: backend endpoint ozeti ve kritik davranis kurallari
- `veritabani-tasarimi.md`: ana tablolar, iliskiler ve unique kurallar
- `yayin-ve-guvenlik-checklist.md`: publish oncesi kontrol ve ortam degiskenleri

## Kaynak Onceligi

Bu dokumanlar kodla hizali olacak sekilde guncellendi. Yine de son kaynak her zaman repo icindeki gercek implementasyondur.

Ozellikle once bakilacak yerler:

- `backend/EtkinlikProjesi.Api/Controllers`
- `backend/EtkinlikProjesi.Api/Program.cs`
- `backend/EtkinlikProjesi.Api/Data/AppDbContext.cs`
- `admin-panel/src`
- `mobile/src`

## Kisa Notlar

- Uygulamanin urun adi artik `BiKatil`.
- Backend tarafinda JWT, rate limit, CORS ve migration akisi sertlestirildi.
- Admin panel production build dogrulandi.
- Mobil tarafta token tekrarli saklama temizlendi; hala `AsyncStorage` kullanimina sahip.
