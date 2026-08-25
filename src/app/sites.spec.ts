import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { DataStore } from './data-store';
import { Autos } from './sites/autos/autos';
import { Autodetails } from './sites/autos/autodetails/autodetails';
import { Haendler } from './sites/haendler/haendler';
import { Haendlerdetails } from './sites/haendler/haendlerdetails/haendlerdetails';
import { Home } from './sites/home/home';
import { Person } from './sites/person/person';
import { Persondetails } from './sites/person/persondetails/persondetails';
import { dataStoreTestProviders, seedDataStore } from './testing/data-store-testing';

describe('Home', () => {
  it('links to the vehicle, dealer and customer overviews', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [...dataStoreTestProviders, provideRouter([])],
    }).compileComponents();
    seedDataStore();

    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[href="/autos"]')?.textContent).toContain('Fahrzeug-Übersicht');
    expect(compiled.querySelector('a[href="/haendler"]')?.textContent).toContain(
      'Händler-Übersicht',
    );
    expect(compiled.querySelector('a[href="/person"]')?.textContent).toContain('Kunden-Übersicht');
    expect(compiled.textContent).toContain('Fahrzeuge');
    expect(compiled.textContent).toContain('DataStore');
  });
});

describe('Autos', () => {
  it('renders seeded cars in the table', async () => {
    await TestBed.configureTestingModule({
      imports: [Autos],
      providers: [...dataStoreTestProviders, provideRouter([])],
    }).compileComponents();
    seedDataStore();

    const fixture = TestBed.createComponent(Autos);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#autoliste')).toBeTruthy();
    expect(compiled.textContent).toContain('Ford');
    expect(compiled.textContent).toContain('Mercedes');
    expect(compiled.querySelector('a[href="/autos/0?viewstate=new"]')?.textContent).toContain(
      'Neu',
    );
  });

  it('sorts cars by brand when the Marke header is clicked', async () => {
    await TestBed.configureTestingModule({
      imports: [Autos],
      providers: [...dataStoreTestProviders, provideRouter([])],
    }).compileComponents();
    seedDataStore();

    const fixture = TestBed.createComponent(Autos);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const markeButton = [...compiled.querySelectorAll('th button')].find((button) =>
      button.textContent?.includes('Marke'),
    ) as HTMLButtonElement;
    markeButton.click();
    fixture.detectChanges();

    const brands = [...compiled.querySelectorAll('tbody tr')].map(
      (row) => row.querySelectorAll('td')[2]?.textContent?.trim(),
    );
    expect(brands[0]).toBe('Ford');
    expect(brands.at(-1)).toBe('Quant');

    markeButton.click();
    fixture.detectChanges();
    const reversed = [...compiled.querySelectorAll('tbody tr')].map(
      (row) => row.querySelectorAll('td')[2]?.textContent?.trim(),
    );
    expect(reversed[0]).toBe('Quant');
  });
});

describe('Autodetails', () => {
  it('shows customer and dealer names for an existing car', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/autos/1?viewstate=details', Autodetails);

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Focus II');
    expect(text).toContain('Hans');
    expect(text).toContain('Ford');
    expect(harness.routeNativeElement?.querySelector('img')?.getAttribute('src')).toBe(
      '/autos/ford.svg',
    );
  });

  it('shows 9G-Tronic gears for a Mercedes diesel', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/autos/14?viewstate=details', Autodetails);

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('C 220 d');
    expect(text).toContain('Automatik (9G-Tronic)');
    expect(text).toContain('9');
  });

  it('keeps the user in edit mode when required fields are missing', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/autos/0?viewstate=new', Autodetails);

    component.saveAndStay();
    harness.detectChanges();

    expect(component.errorMessage).toBe('Bitte Daten vervollständigen!');
    expect(component.editmodus).toBe(true);
  });

  it('persists a new car in the singleton store', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/autos/0?viewstate=new', Autodetails);
    const store = TestBed.inject(DataStore);
    const nextId = store.nextCarId();

    component.auto = {
      ID: nextId,
      Marke: 'Opel',
      Modell: 'Corsa',
      Fahrgestellnummer: 'OPL-1',
      KundenID: 1,
      HaendlerID: 5,
      Erstzulassung: '2020-03-03',
      ErstKennzeichen: 'MZ-OP 1',
    };
    component.saveAndStay();

    expect(store.getCar(nextId)?.Marke).toBe('Opel');
    expect(component.message).toBe('Datensatz hinzugefügt!');
  });

  it('removes a car from the singleton store', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    const store = TestBed.inject(DataStore);
    const id = store.nextCarId();
    store.saveCar({
      ID: id,
      Marke: 'Weg',
      Modell: 'X',
      Fahrgestellnummer: 'DEL',
      KundenID: 1,
      HaendlerID: 1,
      Erstzulassung: '2026-01-01',
      ErstKennzeichen: 'F-D 1',
    });

    const component = await harness.navigateByUrl(`/autos/${id}?viewstate=details`, Autodetails);
    component.deleteAndLeave();

    expect(store.getCar(id)).toBeUndefined();
  });
});

describe('Haendler', () => {
  it('renders seeded dealers in the table', async () => {
    await TestBed.configureTestingModule({
      imports: [Haendler],
      providers: [...dataStoreTestProviders, provideRouter([])],
    }).compileComponents();
    seedDataStore();

    const fixture = TestBed.createComponent(Haendler);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#haendlerliste')).toBeTruthy();
    expect(compiled.textContent).toContain('Mercedes Center');
    expect(compiled.querySelector('a[href="/haendler/0?viewstate=new"]')?.textContent).toContain(
      'Neu',
    );
  });
});

describe('Haendlerdetails', () => {
  it('shows dealer fields for an existing record', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/haendler/1?viewstate=details', Haendlerdetails);

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Ford');
    expect(text).toContain('Wiesbaden');
  });

  it('keeps the user in edit mode when required fields are missing', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/haendler/0?viewstate=new', Haendlerdetails);

    component.saveAndStay();
    harness.detectChanges();

    expect(component.errorMessage).toBe('Bitte Daten vervollständigen!');
    expect(component.editmodus).toBe(true);
  });

  it('persists a new dealer in the singleton store', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/haendler/0?viewstate=new', Haendlerdetails);
    const store = TestBed.inject(DataStore);
    const nextId = store.nextDealerId();

    component.dealer = {
      ID: nextId,
      Firmenname: 'Seat',
      PLZ: '60311',
      Ort: 'Frankfurt',
      Email: 'info@seat.de',
      Telefon: '069123',
    };
    component.saveAndStay();

    expect(store.getDealer(nextId)?.Firmenname).toBe('Seat');
    expect(component.message).toBe('Datensatz hinzugefügt!');
  });
});

describe('Person', () => {
  it('renders seeded customers in the table', async () => {
    await TestBed.configureTestingModule({
      imports: [Person],
      providers: [...dataStoreTestProviders, provideRouter([])],
    }).compileComponents();
    seedDataStore();

    const fixture = TestBed.createComponent(Person);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#kundenliste')).toBeTruthy();
    expect(compiled.textContent).toContain('Müller');
    expect(compiled.textContent).toContain('Meier');
    expect(compiled.querySelector('a[href="/person/0?viewstate=new"]')?.textContent).toContain(
      'Neu',
    );
  });
});

describe('Persondetails', () => {
  it('shows customer fields for an existing record', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/person/1?viewstate=details', Persondetails);

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Müller');
    expect(text).toContain('Hans');
  });

  it('keeps the user in edit mode when required fields are missing', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/person/0?viewstate=new', Persondetails);

    component.saveAndStay();
    harness.detectChanges();

    expect(component.errorMessage).toBe('Bitte Daten vervollständigen!');
    expect(component.editmodus).toBe(true);
  });

  it('persists a new customer in the singleton store', async () => {
    await TestBed.configureTestingModule({
      providers: [...dataStoreTestProviders, provideRouter(routes)],
    }).compileComponents();
    seedDataStore();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/person/0?viewstate=new', Persondetails);
    const store = TestBed.inject(DataStore);
    const nextId = store.nextCustomerId();

    component.kunde = {
      ID: nextId,
      Nachname: 'Schmidt',
      Vorname: 'Lea',
      Anrede: 'Frau',
      PLZ: '10115',
      Ort: 'Berlin',
      Email: 'lea@example.de',
      Telefon: '0301',
    };
    component.saveAndStay();

    expect(store.getCustomer(nextId)?.Nachname).toBe('Schmidt');
    expect(component.message).toBe('Datensatz hinzugefügt!');
  });
});
