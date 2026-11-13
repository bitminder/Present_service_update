# Present-Service – Website-Relaunch

Nowa, responsywna strona marketingowa B2B dla firmy [Present-Service](https://www.present-service.pl/). Projekt stanowi **niezależny podgląd nowej witryny**, bez ingerencji w obecny serwis firmowy.

## Zawartość

- `index.html`: strona główna, oferta, programy, segmentacja i generator zapytania.
- `baza-danych-rodzin.html`: specjalistyczna strona o segmentacji rodzin.
- `direct-mail.html`, `emailing.html`, `mobile-marketing.html`: osobne strony ofertowe.
- `mamaklub-sampling.html`: prezentacja programów Mamaklub i samplingu.
- `informacje-o-danych.html`: demonstracyjna informacja o zapytaniach i kontakcie ws. danych.
- `styles.css`, `offer.css`: projekt graficzny i układ responsywny.
- `app.js`: nawigacja mobilna i generator briefu.
- `favicon.svg`, `robots.txt`, `.nojekyll`: elementy techniczne.

## Podgląd / hosting

W GitHub otwórz **Settings → Pages** i wybierz w **Build and deployment** opcję **GitHub Actions**. Workflow `.github/workflows/deploy.yml` automatycznie wdraża stronę po każdym pushu do gałęzi `main`; można go także uruchomić ręcznie przez **Actions → Deploy Present-Service preview → Run workflow**.

Po zakończeniu workflow statusem **Success**, podgląd powinien być dostępny pod adresem:

https://bitminder.github.io/Present_service_update/

Do czasu włączenia Pages adres może nie działać. Możesz również otworzyć `index.html` w przeglądarce lub użyć lokalnego serwera, np. `python3 -m http.server 8000`.

## Jak działa formularz

Konfigurator kampanii **nie jest połączony z żadną bazą danych** i nie oblicza realnych wielkości segmentów. Nie przesyła danych formularza na serwer. Przygotowuje brief i udostępnia go do skopiowania lub wysłania przez własny program pocztowy użytkownika (`mailto:`). Linki ze stron ofertowych ustawiają odpowiedni kanał w konfiguratorze.

**Uwaga:** nie należy opisywać tego mechanizmu jako automatycznego formularza kontaktowego, dopóki nie zostanie skonfigurowany bezpieczny backend wysyłki z ochroną przed spamem i prawidłową informacją o przetwarzaniu danych.

## Wymagane przed uruchomieniem na domenie produkcyjnej

1. **Akceptacja danych i usług:** potwierdzić bieżące liczby kontaktów, zakres oferty, programy Mamaklub, numery telefonów i adresy e-mail. Liczby w makiecie zostały zaczerpnięte z obecnej strony Present-Service i nie są potwierdzeniem aktualnej dostępności konkretnych segmentów. Wersja projektowa nie powtarza deklaracji o comiesięcznym dopływie nowych rekordów.
2. **Prawo i RODO:** potwierdzić podstawy przetwarzania, legalność każdej wysyłki i ewentualnego udostępniania danych, zgody/uprawnienia dla poszczególnych kanałów i informacje prawne. Szczególną ostrożność zachować przy segmentach powiązanych z dziećmi. Nie publikować formularza zbierającego dane osobowe bez kompletnych obowiązków informacyjnych.
3. **Polityka prywatności:** zastąpić demonstracyjną stronę `informacje-o-danych.html` zatwierdzoną polityką, zgodną z rzeczywistymi procesami firmy; uwzględnić zewnętrzne Google Fonts lub hostować fonty lokalnie.
4. **SEO przy migracji:** po zatwierdzeniu produkcji usunąć meta `noindex,nofollow` ze wszystkich stron; zmienić `robots.txt` (obecnie `Disallow: /`); skonfigurować prawidłowe adresy kanoniczne (`canonical`), `sitemap.xml`, przekierowania 301 z istniejących adresów, Search Console, cele konwersji i analitykę zgodnie z przepisami. **Nie wprowadzać tych zmian na środowisku podglądu**, bo mogłoby to spowodować konkurencję SEO z działającą witryną.
5. **Materiały wizualne:** zatwierdzić znak graficzny, typografię, prawa do grafik i ostateczny tekst. Aktualnie użyto własnego symbolu/typografii zamiast oficjalnego logo.
6. **Testy produkcyjne:** sprawdzić aplikację w aktualnych przeglądarkach mobilnych, dostępność, szybkość ładowania, działanie skrzynki e-mail oraz ewentualny system obsługi zapytań.

## Zakres i bezpieczeństwo

W repozytorium nie ma danych klientów ani dostępu do baz osobowych. Publiczny podgląd nie oferuje pobierania rekordów i nie jest połączony z systemem sprzedażowym. Projekt nie zmienia działającej strony `present-service.pl`.

© 2026 — wersja demonstracyjna wymagająca akceptacji firmy.
