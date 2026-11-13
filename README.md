# Present-Service 2.0 – strona B2B i generator briefu

**Status:** gotowy podgląd GitHub Pages; **nie jest jeszcze systemem produkcyjnym**. Oryginalna witryna https://present-service.pl/ pozostaje niezmieniona.

Projekt działa bez frameworka i bez bazy danych konsumentów. Zachowuje oficjalne logo, kolory firmowe oraz ofertę Present-Service. Wersja 2.0 została przygotowana przede wszystkim pod pozyskiwanie zapytań od klientów biznesowych.

## Co nowego w 2.0

- Rozbudowany konfigurator: kanał komunikacji, etap życia i wiek dziecka, liczba dzieci, przedział wieku matki, jedno lub kilka województw, miasta/regiony, termin, budżet i cel kampanii.
- Zapytanie tworzone lokalnie: podgląd, kopiowanie i otwarcie w aplikacji pocztowej. **Nie ma udawanej wysyłki:** przejście do poczty to nie jest potwierdzenie dostarczenia.
- Przygotowany, **domyślnie wyłączony** kanał bezpośredniego wysyłania leadów: szablon Cloudflare Worker z walidacją, ochroną Turnstile i integracją z Resend, tylko po konfiguracji i prawnej akceptacji.
- Nowa sekcja budowania zaufania: jasno opisany sposób współpracy, dane rejestrowe spółki, rzetelne ograniczenia dotyczące udostępniania danych.
- Ujednolicone elementy graficzne i większe etykiety formularza na urządzeniach mobilnych; brak zewnętrznych fontów Google.
- Przygotowana integracja z Umami do anonimowych zdarzeń konwersji, **wyłączona domyślnie**.
- Osobne podstrony produktowe, metadane SEO, kontrole poprawności i opcjonalny skrypt przygotowania wersji produkcyjnej.

## Podgląd GitHub Pages

Po udanym workflow `Deploy Present-Service preview`:
https://bitminder.github.io/Present_service_update/

Źródło: `main`, GitHub Actions. Workflow `.github/workflows/deploy.yml` uruchamia sprawdzanie stron przed publikacją.

## Ważne ograniczenia

**Bezpośrednia wysyłka formularza nie działa jeszcze na GitHub Pages.** W `site-config.js` `leadEndpoint` i `turnstileSiteKey` są puste. Formularz przygotowuje wiadomość w przeglądarce, a użytkownik musi ją wysłać ze swojego programu pocztowego. Pełne wdrożenie serwera jest opisane w [backend/README.md](backend/README.md). Nie umieszczaj tam kluczy API ani danych osób z bazy.

**Nie ma prawdziwej dostępności segmentów.** Brak integracji z bazą rodzin oraz obliczeń potencjalnej liczebności. Pokazanie realnej liczby odbiorców wymaga odrębnej, bezpiecznej warstwy agregacji z ochroną małych grup, kontrolą uprawnień i audytem RODO.

**Brak opublikowanych referencji klientów.** Nie dodano fikcyjnych logo, wyników kampanii ani opinii. Warto je dodać po otrzymaniu materiałów i pisemnej zgody na publikację.

**RODO:** `informacje-o-danych.html` jest na razie informacją demonstracyjną, a nie zatwierdzoną polityką prywatności. Przed uruchomieniem formularza lub strony produkcyjnej konieczna jest weryfikacja podstaw przetwarzania i reguł kontaktu marketingowego, odbiorców danych, retencji, zgód/uprawnień oraz dostawców usług. Dane dotyczące rodzin i dzieci wymagają szczególnej ostrożności.

## Kontrola jakości

Wymagany Node.js 22 lub nowszy. Uruchom lokalnie:

```sh
node --check app.js
node --check --input-type=module < backend/lead-worker.js
node scripts/check-site.mjs
```

Te kontrole obejmują składnię, lokalne linki, metadane, polski język stron, logo i blokadę indeksowania **podglądu**. Nie są zamiennikiem testu przeglądarki, Lighthouse, WCAG 2.2 AA ani audytu bezpieczeństwa.

## Testy przeglądarkowe po audycie (13.11.2026)

Po przeglądzie wersji 2.0 poprawiono poziomy kontrastu drobnych opisów i układ na urządzeniach o szerokości 320 px. Izolowany audyt Playwright + axe-core przeszedł pomyślnie: **10/10 scenariuszy**. Zweryfikowano m.in. szerokości 320/390/768/1440 px, menu mobilne, walidację regionów, generowanie briefu, wszystkie podstrony i automatyczne reguły WCAG 2.2 AA na stronie głównej, stronie bazy danych rodzin oraz stronie informacji o danych.

Raport testów: https://github.com/bitminder/Present_service_update/actions/runs/43503975879

Te testy nie potwierdzają pełnej zgodności z WCAG 2.2 AA, nie zastępują audytu Lighthouse ani testu end-to-end dostarczenia e-maila. Bezpośrednie wysyłanie zapytań i analityka pozostają wyłączone do czasu konfiguracji i zatwierdzeń.

## SEO i przejście na domenę firmy

Podgląd pozostaje `noindex,nofollow`, a `robots.txt` zawiera `Disallow: /`. **To jest celowe.** Nie indeksuj wersji testowej obok oryginalnej strony.

`scripts/build-production.mjs` tworzy osobny eksport z canonical URL, danymi Organization w JSON-LD, sitemapą i produkcyjnym robots.txt. Uruchamia się **wyłącznie po** potwierdzeniu dopuszczenia treści, danych firmowych i gotowej polityki prywatności. Skrypt dodatkowo blokuje eksport, jeśli na stronie prywatności pozostał tekst demonstracyjny.

Po zatwierdzeniu i zastąpieniu polityki:

```sh
CONFIRM_PUBLICATION=YES APPROVED_PRIVACY_POLICY=YES APPROVED_DATA_CLAIMS=YES SITE_URL=https://www.present-service.pl/ node scripts/build-production.mjs
```

Wynik: folder `dist/` (nie wdraża się sam na domenie). Przed migracją sprawdź przekierowania 301 z poprzednich adresów, hosting, monitoring, Search Console, formularz, adresy e-mail i consent dla analityki.

## Następne kroki po akceptacji firmy

1. Potwierdzić aktualną liczbę rekordów, czynne programy samplingowe, prawa do materiałów i dane kontaktowe.
2. Uzyskać prawdziwe case studies, logotypy klientów i pisemne zgody na ich publikację.
3. Przygotować końcową politykę prywatności i zatwierdzony proces obsługi leadów.
4. Uruchomić Workers/Resend/Turnstile i wykonać testy wysyłki end-to-end.
5. Jeśli przetwarzanie danych jest zatwierdzone, włączyć analitykę konwersji i ustawić cele.
6. Po audycie wydajności, dostępności i SEO zdecydować o migracji na domenę firmy.

---

Witryna jest statycznym projektem B2B i nie sprzedaje automatycznie danych osobowych. Żadne dane rodziców lub dzieci nie są przesyłane przez podgląd.
