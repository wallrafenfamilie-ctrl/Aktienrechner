# Aktien-Cockpit 4.6 – GitHub-Pages-Update

1. **Vorher** in Version 4.5 ein vollständiges JSON-Backup exportieren und sicher ablegen.
2. Diese sieben Dateien im bestehenden GitHub-Repository im Stammverzeichnis hochladen und vorhandene Dateien ersetzen.
3. Die App nicht deinstallieren und keine Browser-/App-Daten löschen.
4. App nach Aktualisierung neu öffnen. Alte Watchlist, Buchungen und Trades bleiben unter denselben localStorage-Schlüsseln.
5. Kontrolliere zuerst Aktienanzahl, offene Positionen, abgeschlossene Verkäufe und Kapitalwerte.
6. ISIN/WKN bei Bedarf nachtragen. Es werden **keine** Käufe automatisch gebucht oder doppelte Einträge gelöscht.
7. Jahrziele können pro Jahr geändert werden. Für 2026 gilt als Vorschlag 658 × 3/12 = 164,50 €.

Wichtig: Dies ist eine lokale PWA. Vor jedem größeren Update ein JSON-Backup sichern. Stop- und Steuerrechner sind Modellrechnungen.

## Ergänzung: Trade-Effizienz
- Unter **Abgeschlossene Verkäufe** hat jeder Verkauf einen aufklappbaren Effizienz-Reiter.
- Unter **Offene Positionen** erscheinen Haltedauer und die Auswertung bereits realisierter Teilverkäufe.
- Unter **ETF-Challenge & Statistik** gibt es die aufklappbare **Trade-Effizienz** nach Jahr, Monat und Haltedauer (0–14, 15–60, über 60 Tage).
- Kennzahlen: Nettogewinn, Nettorendite auf verkauftes Kapital, durchschnittliche Haltedauer, linear vergleichbare 30-Tage-Werte, Trefferquote und Zahl der Verkäufe.
- Bei Teilverkäufen gilt die gewichtete Haltedauer der tatsächlich verkauften FIFO-Tranchen. Ein Teilverkauf zählt in der Trefferquote als ein Verkauf.
- 30-Tage-Kennzahlen sind **keine Prognose**; die aggregierte Rendite ist **keine Depotjahresrendite**. Bereits bestehende lokale Daten werden nicht überschrieben.
