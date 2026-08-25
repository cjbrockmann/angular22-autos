export interface CARS {
  ID: number;
  Marke: string;
  Modell: string;
  Fahrgestellnummer: string;
  KundenID: number | null;
  HaendlerID: number | null;
  Erstzulassung: string;
  ErstKennzeichen: string;
  src?: string;
  Kunde?: string;
  Haendler?: string;
}

export interface HAENDLER {
  ID: number;
  Firmenname: string;
  PLZ: string;
  Ort: string;
  Email: string;
  Telefon: string;
}

export interface KUNDE {
  ID: number;
  Nachname: string;
  Vorname?: string;
  Anrede: string;
  PLZ: string;
  Ort: string;
  Email: string;
  Telefon?: string;
}
