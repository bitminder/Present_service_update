# Present-Service 3.1 – Bildquellen, Lizenzen und Einsatzzweck

Die Website nutzt **fünf lokal gespeicherte, optimierte Fotografien**, die ursprünglich auf Pexels veröffentlicht wurden. Sie dienen ausschließlich der **Illustration typischer Lebenssituationen von Familien**.

**Wichtig:** Abgebildete Personen werden **nicht** als Kunden von Present-Service, Mitglieder konkreter Datenbanksegmente, Empfänger einer Kampagne oder Fürsprecher des Angebots dargestellt. Keine der Fotografien ist ein Beleg für eine aktive Kampagne oder deren Reichweite. Das ist auch auf der Website vermerkt.

## Quellen und Nutzung

| Datei im Projekt | Urheber / Fotoquelle | Verwendung |
|---|---|---|
| `assets/families/hero-parents-baby.webp` | Yana Prokopenok — https://www.pexels.com/photo/parents-playing-with-baby-11145071/ | Hero: Eltern mit Baby zu Hause |
| `assets/families/segment-baby.webp` | Anna Shvets — https://www.pexels.com/photo/parents-playing-with-their-baby-11369370/ | Demonstrationskarte: Familien mit Säuglingen |
| `assets/families/segment-preschool.webp` | olia danilevich — https://www.pexels.com/photo/a-happy-couple-sitting-on-a-couch-with-their-daughter-8524966/ | Demonstrationskarte: Familien mit älteren Kindern; Datenbank-Unterseite |
| `assets/families/segment-toddler.webp` | Tran Nhu Tuan — https://www.pexels.com/photo/happy-ethnic-family-with-kid-on-sofa-7936747/ | Demonstrationskarte: junge Familien |
| `assets/families/mamaklub-family.webp` | Dasha Halepova — https://www.pexels.com/photo/couple-sitting-on-couch-with-children-16852512/ | Ergänzendes Mamaklub-Angebot und Unterseite |

## Rechtsgrundlagen und Vorsicht

Pexels License: https://www.pexels.com/legal-pages/license

Pexels erklärt, dass Fotos kostenlos für kommerzielle Webseiten genutzt werden dürfen und keine Pflicht zur Namensnennung besteht. Pexels fordert zugleich, **keine Zustimmung oder Produktunterstützung durch die abgebildeten Personen zu suggerieren**. Die Pexels-Nutzungsbedingungen weisen darauf hin, dass Rechte an erkennbaren Personen besondere Sorgfalt erfordern können.

Die Bilder werden hier nur zur allgemeinen Illustration von Zielgruppen / familiären Lebensphasen in einem sachlichen Kontext eingesetzt. Für eine endgültige Firmenveröffentlichung sollten Markeninhaber oder Rechtsberatung nochmals prüfen, ob die konkrete werbliche Nutzung zusätzliche Einwilligungen benötigt. Alternativ die Fotos durch professionell lizenziertes Bildmaterial mit dokumentierten Model-Releases ersetzen.

## Technische Verarbeitung

Die Bilder wurden in einem **isolierten GitHub-Actions-Workflow** aus den oben genannten, namentlich ausgewählten Pexels-Fotoseiten bezogenen Bilddateien erstellt. Sie wurden auf maximal 920–1250 Pixel Breite skaliert und ins moderne WebP-Format umgewandelt, um unnötig große Downloads zu vermeiden.

Die Dateien werden auf derselben Domain wie die Website ausgeliefert (`assets/families`). Es werden keine externen Bild-CDN-Requests aus dem Browser ausgelöst. Im HTML sind Bildgrößen, `loading="lazy"` für untere Bereiche, `decoding="async"` und aussagekräftige Alternativtexte gesetzt.

## Bildaustausch

Du kannst später alle fünf Fotos durch Firmenmaterial ersetzen, das inhaltlich besser passt und für das ihr vollständige Nutzungsrechte nachweisen könnt. Verwende dieselben Dateinamen oder aktualisiere die Pfade in:
- `index.html`
- `baza-danych-rodzin.html`
- `mamaklub-sampling.html`
- `family-photos.css` für Bildausschnitt / `object-position`

Keine **erkennbaren Personen** als vermeintliche Datensätze oder Kunden portraitieren; echte Firmenkampagnen und Kundenlogos nur mit deren Freigabe zeigen. Quellen, Autorennamen und Bildhinweise bei Austausch entsprechend aktualisieren.
