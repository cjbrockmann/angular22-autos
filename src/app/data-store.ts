import { Injectable, computed, signal } from '@angular/core';
import autosJson from './data/autos.json';
import haendlerJson from './data/haendler.json';
import kundenJson from './data/kunden.json';
import { CARS, HAENDLER, KUNDE } from './models';

/**
 * Zentraler In-Memory-Speicher (Singleton via providedIn: 'root').
 * Entspricht dem GlobalConstants-Muster der Angular-12-App:
 * JSON-Daten werden einmal geladen und hier verändert.
 */
@Injectable({ providedIn: 'root' })
export class DataStore {
  readonly cars = signal<CARS[]>(structuredClone(autosJson) as CARS[]);
  readonly dealers = signal<HAENDLER[]>(structuredClone(haendlerJson) as HAENDLER[]);
  readonly customers = signal<KUNDE[]>(structuredClone(kundenJson) as KUNDE[]);

  readonly brands = computed(() =>
    [...new Set(this.cars().map((car) => car.Marke))].sort((a, b) => a.localeCompare(b)),
  );

  nextCarId(): number {
    return this.cars().length + 1;
  }

  getCar(id: number): CARS | undefined {
    return this.cars().find((car) => car.ID === id);
  }

  saveCar(car: CARS): 'added' | 'updated' {
    const exists = this.cars().some((item) => item.ID === car.ID);
    if (!exists) {
      this.cars.update((list) => [...list, car]);
      return 'added';
    }

    this.cars.update((list) =>
      [...list.filter((item) => item.ID !== car.ID), car].sort((a, b) => a.ID - b.ID),
    );
    return 'updated';
  }

  dealerName(id: number | null): string {
    if (id == null) {
      return '';
    }
    return this.dealers().find((dealer) => dealer.ID === id)?.Firmenname ?? '';
  }

  customerName(id: number | null): string {
    if (id == null) {
      return '';
    }
    const customer = this.customers().find((item) => item.ID === id);
    if (!customer) {
      return '';
    }
    return `${customer.Vorname ?? ''} ${customer.Nachname ?? ''}`.trim();
  }
}
