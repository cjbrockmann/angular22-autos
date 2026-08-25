import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DataStore } from './data-store';
import { seedDataStore } from './testing/data-store-testing';
import autosJson from '../../public/data/autos.json';
import haendlerJson from '../../public/data/haendler.json';
import kundenJson from '../../public/data/kunden.json';

describe('DataStore', () => {
  let store: DataStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    store = seedDataStore();
  });

  it('loads cars from the JSON seed data', () => {
    expect(store.cars().length).toBeGreaterThan(0);
    expect(store.dealers().length).toBeGreaterThan(0);
    expect(store.customers().length).toBeGreaterThan(0);
  });

  it('adds and updates a car in the singleton list', () => {
    const id = store.nextCarId();
    store.saveCar({
      ID: id,
      Marke: 'Testmarke',
      Modell: 'Testmodell',
      Fahrgestellnummer: 'XYZ',
      KundenID: 1,
      HaendlerID: 1,
      Erstzulassung: '2026-01-01',
      ErstKennzeichen: 'F-T 1',
    });

    expect(store.getCar(id)?.Marke).toBe('Testmarke');

    store.saveCar({
      ID: id,
      Marke: 'Geändert',
      Modell: 'Testmodell',
      Fahrgestellnummer: 'XYZ',
      KundenID: 1,
      HaendlerID: 1,
      Erstzulassung: '2026-01-01',
      ErstKennzeichen: 'F-T 1',
    });

    expect(store.getCar(id)?.Marke).toBe('Geändert');
  });

  it('adds, updates and deletes a dealer in the singleton list', () => {
    const id = store.nextDealerId();
    store.saveDealer({
      ID: id,
      Firmenname: 'Test GmbH',
      PLZ: '12345',
      Ort: 'Testort',
      Email: 'test@example.de',
      Telefon: '000',
    });

    expect(store.getDealer(id)?.Firmenname).toBe('Test GmbH');

    store.saveDealer({
      ID: id,
      Firmenname: 'Geändert GmbH',
      PLZ: '12345',
      Ort: 'Testort',
      Email: 'test@example.de',
      Telefon: '000',
    });

    expect(store.getDealer(id)?.Firmenname).toBe('Geändert GmbH');

    store.deleteDealer(id);
    expect(store.getDealer(id)).toBeUndefined();
  });

  it('adds, updates and deletes a customer in the singleton list', () => {
    const id = store.nextCustomerId();
    store.saveCustomer({
      ID: id,
      Nachname: 'Test',
      Vorname: 'Tina',
      Anrede: 'Frau',
      PLZ: '12345',
      Ort: 'Testort',
      Email: 'tina@example.de',
      Telefon: '111',
    });

    expect(store.getCustomer(id)?.Nachname).toBe('Test');

    store.saveCustomer({
      ID: id,
      Nachname: 'Geändert',
      Vorname: 'Tina',
      Anrede: 'Frau',
      PLZ: '12345',
      Ort: 'Testort',
      Email: 'tina@example.de',
      Telefon: '111',
    });

    expect(store.getCustomer(id)?.Nachname).toBe('Geändert');

    store.deleteCustomer(id);
    expect(store.getCustomer(id)).toBeUndefined();
  });

  it('reuses a freed car id after delete', () => {
    const id = store.nextCarId();
    store.saveCar({
      ID: id,
      Marke: 'Temp',
      Modell: 'X',
      Fahrgestellnummer: 'T',
      KundenID: 1,
      HaendlerID: 1,
      Erstzulassung: '2026-01-01',
      ErstKennzeichen: 'F-T 2',
    });
    store.deleteCar(id);
    expect(store.nextCarId()).toBe(id);
  });
});

describe('DataStore HTTP load', () => {
  it('fills the singleton from /data JSON files once', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    const store = TestBed.inject(DataStore);
    const http = TestBed.inject(HttpTestingController);
    const pending = store.load();

    http.expectOne('/data/autos.json').flush(autosJson);
    http.expectOne('/data/haendler.json').flush(haendlerJson);
    http.expectOne('/data/kunden.json').flush(kundenJson);

    await pending;

    expect(store.cars().length).toBeGreaterThan(0);
    expect(store.dealers().length).toBeGreaterThan(0);
    expect(store.customers().length).toBeGreaterThan(0);
    await store.load();
    http.verify();
  });
});
