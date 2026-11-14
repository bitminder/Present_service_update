# Present-Service 3.0 – fiktive Beispieldaten austauschen

**Stand:** 14.11.2026 · Arbeitsstand `data-experience-3-0` auf GitHub Pages.

## Was derzeit bewusst FIKTIV ist

Die fiktiven Beispielsegmente sind **ausschließlich Demonstrationen**, keine bestätigten Einträge in der Present-Service-Datenbank. Bitte niemals als aktuelle Reichweiten oder Kundenreferenzen zitieren.

| Demo-Segment | Fiktive Anzahl | Fiktive Kriterien | Wo ändern? |
|---|---:|---|---|
| Rodzice niemowląt | 18.400 | 0–6 Monate, Mazowieckie, Direct mail | `index.html` → `data-demo-example="1"` |
| Rodziny z przedszkolakami | 7.200 | 4–6 Jahre, Wielkopolskie, E-mailing | `index.html` → `data-demo-example="2"` |
| Rodziny z małymi dziećmi | 54.000 | 1–3 Jahre, Małopolskie + Śląskie, Mobile | `index.html` → `data-demo-example="3"` |

In `index.html` gibt es die Sektion `id="przykladowe-segmenty"` mit dem klar sichtbaren Hinweis `Dane demonstracyjne`. Die Werte stehen sowohl im angezeigten Text der Karte als auch in den HTML-Attributen `data-demo-channel`, `data-demo-stage`, `data-demo-regions`, `data-demo-volume` und `data-demo-goal`. **Beide Stellen synchron ändern.**

Die Spezifikationskarte in `index.html` ist an `class="quality-sheet"` erkennbar. Sie enthält ebenfalls den Hinweis `FIKCYJNY PRZYKŁAD` und zeigt keine echten personenbezogenen Informationen. Du kannst sie durch einen vollständig freigegebenen, datenschutzkonformen Auszug aus einer aggregierten Spezifikation ersetzen.

Die herunterladbare Datei `assets/specyfikacja-demo.csv` enthält ausschließlich künstliche Angaben und keine Namen, Adressen, Telefonnummern oder E-Mail-Adressen von Familien. Bitte bei späterer Bearbeitung nur Daten veröffentlichen, deren Veröffentlichung eindeutig zulässig ist.

## Wichtig: Nicht alles ist fiktiv

**Nicht** mit den neuen, frei erfundenen Zahlen verwechseln: Die älteren, mit Vorbehalten versehenen Angaben `3 mln+`, `~500 tys.` und `900 tys.` stammen aus der früheren öffentlich zugänglichen Firmenwebsite. Sie sind **nicht neu bestätigt** und sollten ebenfalls gegen die aktuellen verfügbaren Bestände und Kanäle geprüft werden. Die entsprechenden Texte stehen in `index.html` und den jeweiligen Leistungsseiten.

Die im Footer genannten Firmendaten und Kontakte sind vorhandene Projektangaben; ihre Richtigkeit muss vor dem produktiven Einsatz mit der Firma abgeglichen werden.

## Freigabekontrolle für die echte Firmenwebsite

- [ ] Jedes genannte Datenvolumen mit Stichtag, Nutzungszweck und Kanal von Present-Service bestätigt
- [ ] Datenkategorien, rechtliche Nutzungsmöglichkeiten und Auslieferungsmodelle dokumentiert
- [ ] Fiktive Beispielkarten entweder sichtbar als Demo belassen und freigeben **oder** durch bestätigte Daten ersetzen
- [ ] Keine echten personenbezogenen Datensätze öffentlich im CSV, HTML, Tracking oder Quellcode
- [ ] Echte Kundenreferenzen nur mit schriftlicher Freigabe
- [ ] Vollständige Datenschutzerklärung durch das Unternehmen geprüft und veröffentlicht
- [ ] Anfrageversand-Endpunkt und Antispam inkl. Zustellprüfung eingerichtet **oder** klar als E-Mail-Entwurf belassen
- [ ] SEO-Projektvorschau und `noindex` erst im getrennten Produktions-Export korrigiert
- [ ] Alte URL-Struktur, Weiterleitungen, Hosting, Backups und DNS vor Domainwechsel geprüft

## Was technisch funktioniert

Die drei Beispiele sind mit dem Kampagnenplaner verbunden, aber nur **durch einen bewussten Klick** auf „Użyj tego przykładu w briefie“. Die Felder bleiben editierbar. Die Beispiele setzen **keine** Kontaktinformationen, Zustimmung oder Datenfreigabe. Ohne JavaScript führt die Beispielschaltfläche direkt zum unveränderten Formular.

**Keine Hintergrundübermittlung:** Die aktuelle GitHub-Vorschau erstellt einen E-Mail-Entwurf. Ein serverseitiger Direktversand bleibt bis zur korrekten Konfiguration deaktiviert.

## Dateien für Anpassungen

- `index.html`: Startseite, Beispielkarten, Datenqualitäts-Karte und Texte
- `experience.css`: Gestaltung der neuen Komponenten
- `app.js`: optionale vorausgefüllte Beispiele und lokale Brief-Erstellung
- `assets/specyfikacja-demo.csv`: Download der Musterspezifikation
- `segmentacja-danych.html`: Kriterien und rechtliche/qualitative Prüfpunkte
- `zastosowania-danych.html`: erfundene, als Szenarien gekennzeichnete Anwendungsfälle
- `site-config.js`: nur öffentliche Konfigurationswerte, **niemals Secrets oder Tokens**
- `scripts/build-production.mjs`: separater, absichtlich freigabepflichtiger Produktions-Export

Alle Änderungen werden zunächst in GitHub Pages getestet. Die ursprüngliche Firmenwebsite unter `present-service.pl` bleibt unverändert, solange kein produktiver Hosting-Zugang vorliegt.
