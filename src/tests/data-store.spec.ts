import { TestBed } from '@angular/core/testing';
import { DataStore } from '../app/data-store';

describe('DataStore', () => {
  let store: DataStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(DataStore);
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
});
