import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app/app.routes';
import { DataStore } from '../app/data-store';
import { Autos } from '../app/sites/autos/autos';
import { Autodetails } from '../app/sites/autos/autodetails/autodetails';
import { Home } from '../app/sites/home/home';

describe('Home', () => {
  it('links to the vehicle overview', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.textContent).toContain('Fahrzeug-Übersicht');
    expect(link.getAttribute('href')).toBe('/autos');
  });
});

describe('Autos', () => {
  it('renders seeded cars in the table', async () => {
    await TestBed.configureTestingModule({
      imports: [Autos],
      providers: [provideRouter([])],
    }).compileComponents();

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
});

describe('Autodetails', () => {
  it('shows customer and dealer names for an existing car', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/autos/1?viewstate=details', Autodetails);

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Focus II');
    expect(text).toContain('Hans');
    expect(text).toContain('Ford');
  });

  it('keeps the user in edit mode when required fields are missing', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/autos/0?viewstate=new', Autodetails);

    component.saveAndStay();
    harness.detectChanges();

    expect(component.errorMessage).toBe('Bitte Daten vervollständigen!');
    expect(component.editmodus).toBe(true);
  });

  it('persists a new car in the singleton store', async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();

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
});
