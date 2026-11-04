# Aktien-Cockpit 4.4.1 – GitHub Pages

1. **Vor dem Update** in der bisherigen App die Watchlist als JSON exportieren.
2. Im Repository `wallrafenfamilie-ctrl/Aktienrechner` die Dateien dieses ZIP-Archivs **direkt ins Hauptverzeichnis** hochladen (nicht den ZIP-Ordner).
3. Vorhandene `index.html` ersetzen. Alte Dateien können bleiben, aber `index.html`, `app.js`, `sw.js`, `manifest.json` und beide Icons müssen zusammen vorliegen.
4. Unter **Settings → Pages**: Deploy from a branch → `main` → `/ (root)`.
5. Auf Android die HTTPS-Adresse in Chrome öffnen und im Menü „App installieren“ wählen. Bei Updates Seite neu laden, gegebenenfalls App komplett schließen und wieder öffnen.

URL (bei aktivierten GitHub Pages): https://wallrafenfamilie-ctrl.github.io/Aktienrechner/

## Datensicherung und Updates
Watchlist-Daten werden weiterhin unter dem alten Schlüssel `aktien-cockpit-4-1` in `localStorage` gespeichert; die Kapitalbuchungen separat unter `aktien-cockpit-capital-4-4`. So bleiben vorhandene Watchlists beim Update auf **derselben URL und demselben Browserprofil** erhalten. Löschen von Website-Daten, ein anderer Browser, Gerätewechsel oder ein Wechsel der URL kann sie entfernen. Deshalb regelmäßig unter **Watchlist → Alles sichern (JSON)** exportieren; das Backup enthält auch Kapitalbuchungen und den optionalen Gesamtwert.

Ein Import eines älteren 4.3-Backups importiert die Watchlist, ohne vorhandene Kapitalbuchungen zu löschen. Ein 4.4-Backup importiert beides. Der Import ersetzt vorhandene Daten der betroffenen Bereiche.

## Rechenhinweise
Der Nettogewinn wird aus Verkaufserlös minus Kaufkosten, Verkaufsgebühr und geschätzter Steuer berechnet. Standard: 1 € je Order und 26,375 % ohne Kirchensteuer. Verlustverrechnung, Spread und tatsächliche Ausführung können abweichen. Der Gewinn-Stop ist ein **rechnerischer Verkaufskurs**, keine garantierte Absicherung oder automatisch platzierte Broker-Order.

Kapitalübersicht: Einzahlungen minus Auszahlungen plus realisierte Nettoergebnisse plus Nettozinsen. Der optionale aktuelle Gesamtwert ist eine manuelle Kontrollgröße; Differenzen können auch aus Buchungsfehlern, offenen Positionen oder nicht erfassten Kosten entstehen.

Keine Cloud, keine automatischen Börsenkurse und keine Verbindung zu Trade Republic.

## Update 4.4.1
Für alle Zahlenfelder gibt es nun eine ±-Taste. Sie wechselt das Vorzeichen auch auf Android-Tastaturen ohne Minustaste. Einfach den Betrag eingeben und ± tippen. **Nicht die App deinstallieren oder Website-Daten löschen.** Alle sieben Dateien erneut in dasselbe GitHub-Pages-Verzeichnis hochladen. Nach Veröffentlichung die App vollständig schließen und neu öffnen; ggf. die Website in Chrome neu laden.
