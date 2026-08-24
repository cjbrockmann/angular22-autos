# Kundenservice (Angular 22)

Neuimplementierung der Angular-12-Anwendung mit aktuellem Angular 22.1.

Die App lädt Fahrzeug-, Kunden- und Händlerdaten aus lokalen JSON-Dateien in einen Singleton-Speicher (`DataStore`) und simuliert dort das Ändern und Speichern. Das Layout nutzt Bootstrap 5.

Die folgenden Befehle gelten im Verzeichnis `neu/`.

## Voraussetzungen

Einmalig die Abhängigkeiten installieren:

```powershell
Set-Location .\neu
npm install
```

```bash
cd neu
npm install
```

## Entwicklungsserver

```powershell
Set-Location .\neu
npm start
```

```bash
cd neu
npm start
```

Anschließend unter `http://localhost:4200/` öffnen.

Wenn die PowerShell-Session bereits in `neu/` liegt:

```powershell
npm start
```

## Build

```powershell
Set-Location .\neu
npm run build
```

```bash
cd neu
npm run build
```

Das Ergebnis liegt unter `neu/dist/neu/`.

## Tests

```powershell
Set-Location .\neu
npm test
```

```bash
cd neu
npm test
```
