# Kundenservice (Angular 22)

Demo einer kleinen Kundenservice-Anwendung: Fahrzeuge, Händler und Kunden verwalten. Neuimplementierung einer Angular-12-App mit **Angular 22.1**, Standalone-Komponenten und Bootstrap 5.

Online ausprobieren: [StackBlitz](https://stackblitz.com/~/github.com/cjbrockmann/angular22-autos)

## Was die App zeigt

- Übersichten mit Filter (Marke bzw. Ort)
- Details, Neu anlegen, Editieren und Löschen (CRUD im Speicher)
- Verknüpfung Auto ↔ Kunde ↔ Händler
- Marken-Icons unter `public/autos/`

Routen: `/home`, `/autos`, `/autos/:ID`, `/haendler`, `/haendler/:ID`, `/person`, `/person/:ID`.  
Query-Parameter `viewstate` steuert die Detailansicht (`details`, `edit`, `new`).

## Datenhaltung

Beim Start lädt `DataStore` die Seed-Daten **einmal per HTTP GET**:

- `/data/autos.json`
- `/data/haendler.json`
- `/data/kunden.json`

Die Dateien liegen in `public/data/` und werden vom Dev-Server bzw. Build ausgeliefert. Danach hält ein Singleton die Listen im Speicher. Speichern und Löschen ändern nur diese Kopie — ein Reload stellt den JSON-Stand wieder her.

## Technik

- Angular 22.1, ausschließlich Standalone-Komponenten
- Start über `bootstrapApplication` und `provideAppInitializer` (lädt den Store)
- Zustand im `DataStore` (`providedIn: 'root'`, Signals)
- Layout mit Bootstrap 5
- Tests mit Vitest (`ng test`)
- Node `22.22.3` (siehe `.nvmrc`)

## Starten

Befehle im Projektverzeichnis (dieses Repo bzw. Ordner `neu/`):

```bash
nvm use          # optional, liest .nvmrc
npm install
npm start
```

Die App öffnet unter `http://localhost:4200/`. Mit Browser-Start: `npm start -- --open`.

```bash
npm test         # Unit-Tests (Vitest)
npm run build    # Produktion nach dist/neu/
```
