# Present-Service — website relaunch (wersja demonstracyjna)

Nowa responsywna strona marketingowa na podstawie publicznie dostępnej oferty [present-service.pl](https://www.present-service.pl/). To **nowy, niezależny projekt**, nie zmienia działającej strony firmowej ani innych repozytoriów.

## Co działa

- Strona główna w języku polskim (mobile, tablet i desktop).
- Czytelna oferta: direct mail, e-mailing, mobile marketing, rozwiązania dedykowane.
- Portfolio projektów: Mamaklub, 9 Miesięcy, Dzidziuś, Szkrab, Paka Przedszkolaka, poradnik „Już jestem”, warsztaty.
- Segmentacja ofertowa i przykłady odbiorców.
- Interaktywny **konfigurator zapytania B2B**: wybór kanału, etapu życia rodziny, regionu i celu; tworzenie briefu; otwarcie wiadomości w programie e-mail; możliwość skopiowania treści.
- Bezpośrednie linki do prawdziwych firmowych adresów e-mail i numerów telefonu z opublikowanej strony.
- Sekcja FAQ, opisy usług, wyraźne CTA, semantyczne nagłówki, meta description, Open Graph.
- Menu na telefon, responsywne karty, obsługa klawiatury i preferencji ograniczonych animacji.

## Podgląd lokalny

Wystarczy otworzyć \`index.html\` w przeglądarce. Dla prawidłowego serwowania plików można uruchomić:

\`\`\`bash
python3 -m http.server 8000
\`\`\`

i wejść na http://localhost:8000.

## Podgląd przez GitHub Pages

W repozytorium: **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.

Po włączeniu usługi adres podglądu powinien mieć postać:

https://bitminder.github.io/Present_service_update/

Przed potwierdzeniem wdrożenia GitHub Pages może wymagać kilku minut na publikację. **Samo dodanie plików do repozytorium nie uruchamia automatycznie GitHub Pages.**

## Ważne — przed wdrożeniem produkcyjnym

1. **Weryfikacja danych oferty.** Liczby 3 mln+, ~500 tys. i 900 tys. pochodzą z obecnie opublikowanej witryny Present-Service, a nie z nowego audytu bazy. Przed publikacją na domenie należy je potwierdzić; na stronie pokazujemy zastrzeżenie aktualności. W szczególności nie powtarzamy deklaracji o stałym napływie nowych kontaktów.
2. **Weryfikacja programów.** Ustal, czy 9 Miesięcy, Dzidziuś, Szkrab, Paka Przedszkolaka i Mamaklub są nadal prowadzone; na stronie opisane jako portfolio.
3. **RODO / prawo komunikacji marketingowej w Polsce.** Potwierdź podstawy prawne, cele, zakres zgód, dopuszczalne kanały i ewentualne udostępnianie danych. Nie ma tu dostępu do danych osobowych ani do segmentów o małej liczebności. Nowa witryna nie dowodzi istnienia zgód marketingowych.
4. **Mechanizm kontaktu.** Formularz nie wysyła automatycznie — generuje e-mail \`mailto:\`. Użytkownik musi zatwierdzić wysyłkę w swoim programie pocztowym. Przy rozbudowie o formularz serwerowy potrzebne będą: backend, ochrona antyspamowa, pouczenie RODO, obsługa dostarczalności i zabezpieczenia.
5. **Kontakt i identyfikacja.** Potwierdź \`marketing@present-service.pl\`, \`biuro@present-service.pl\`, \`mojedane@present-service.pl\`, KRS, NIP i numery telefonów.
6. **Polityka prywatności.** Strona \`informacje-o-danych.html\` jest uczciwym opisem demonstracyjnego formularza, a nie pełną polityką prywatności firmy. Wymaga uzgodnienia z prawnikiem / IOD.
7. **Branding.** Logo i favicon są nową propozycją stylistyczną, nie wiernym odwzorowaniem oficjalnych materiałów. W razie potrzeby zastąp oryginalną identyfikacją marki.
8. **SEO i publikacja.** Projekt ma celowo \`noindex, nofollow\`, aby testowa kopia nie konkurowała z witryną \`present-service.pl\`. Dopiero po uruchomieniu na domenie firmowej: usuń noindex, dodaj właściwe canonical URL, sitemap.xml, sitemapę do Search Console, przekierowania 301 ze starych ścieżek i analitykę zgodną z prawem. Nie publikuj kanonicznych linków na domenę, której nie obsługuje ten kod.
9. **Fonty.** Wersja demonstracyjna pobiera Google Fonts. Przed wdrożeniem przeanalizuj zgodność z zasadami ochrony danych; dobrym rozwiązaniem jest self-hosting fontów lub system font stack.

## Gdzie szukać plików

| Plik | Co zawiera |
| --- | --- |
| \`index.html\` | Landing page z sekcjami ofertowymi i formularzem |
| \`styles.css\` | Layout, typografia i style responsywne |
| \`app.js\` | Menu, wstępne ustawianie kanału, generator briefu |
| \`informacje-o-danych.html\` | Wyjaśnienie sposobu obsługi danych w wersji demonstracyjnej |
| \`favicon.svg\` | Koncepcyjna ikona marki |
| \`.nojekyll\` | Obsługa statycznego serwisu przez GitHub Pages |

## Źródła podstawowych informacji ofertowych

- https://www.present-service.pl/oferta-baza-danych.html
- https://www.present-service.pl/oferta-mamaklub.html
- https://www.present-service.pl/oferta-rozwiazania-dedykowane.html
- https://www.present-service.pl/o-nas.html
- https://www.present-service.pl/kontakt.html

**Wersja:** demonstracyjna, 13 listopada 2026. Do przeglądu i akceptacji przed wdrożeniem produkcyjnym.
