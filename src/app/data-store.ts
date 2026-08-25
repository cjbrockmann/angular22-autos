import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CARS, HAENDLER, KUNDE } from './models';

/**
 * Zentraler In-Memory-Speicher (Singleton via providedIn: 'root').
 * Seed-Daten kommen einmal per HTTP aus /data/*.json und bleiben danach nur hier.
 */
@Injectable({ providedIn: 'root' })
export class DataStore {
  private readonly http = inject(HttpClient);
  private loaded = false;
  private loadPromise: Promise<void> | undefined;

  readonly cars = signal<CARS[]>([]);
  readonly dealers = signal<HAENDLER[]>([]);
  readonly customers = signal<KUNDE[]>([]);

  readonly brands = computed(() =>
    [...new Set(this.cars().map((car) => car.Marke))].sort((a, b) => a.localeCompare(b)),
  );

  readonly dealerCities = computed(() =>
    [...new Set(this.dealers().map((dealer) => dealer.Ort))].sort((a, b) => a.localeCompare(b)),
  );

  readonly customerCities = computed(() =>
    [...new Set(this.customers().map((customer) => customer.Ort))].sort((a, b) =>
      a.localeCompare(b),
    ),
  );

  seed(cars: CARS[], dealers: HAENDLER[], customers: KUNDE[]): void {
    this.cars.set(structuredClone(cars));
    this.dealers.set(structuredClone(dealers));
    this.customers.set(structuredClone(customers));
    this.loaded = true;
  }

  load(): Promise<void> {
    if (this.loaded) {
      return Promise.resolve();
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = firstValueFrom(
      forkJoin({
        cars: this.http.get<CARS[]>('/data/autos.json'),
        dealers: this.http.get<HAENDLER[]>('/data/haendler.json'),
        customers: this.http.get<KUNDE[]>('/data/kunden.json'),
      }),
    ).then((data) => {
      this.seed(data.cars, data.dealers, data.customers);
    });

    return this.loadPromise;
  }

  nextCarId(): number {
    return this.nextId(this.cars());
  }

  getCar(id: number): CARS | undefined {
    return this.cars().find((car) => car.ID === id);
  }

  saveCar(car: CARS): 'added' | 'updated' {
    return this.saveItem(this.cars, car);
  }

  deleteCar(id: number): void {
    this.cars.update((list) => list.filter((car) => car.ID !== id));
  }

  nextDealerId(): number {
    return this.nextId(this.dealers());
  }

  getDealer(id: number): HAENDLER | undefined {
    return this.dealers().find((dealer) => dealer.ID === id);
  }

  saveDealer(dealer: HAENDLER): 'added' | 'updated' {
    return this.saveItem(this.dealers, dealer);
  }

  deleteDealer(id: number): void {
    this.dealers.update((list) => list.filter((dealer) => dealer.ID !== id));
  }

  nextCustomerId(): number {
    return this.nextId(this.customers());
  }

  getCustomer(id: number): KUNDE | undefined {
    return this.customers().find((customer) => customer.ID === id);
  }

  saveCustomer(customer: KUNDE): 'added' | 'updated' {
    return this.saveItem(this.customers, customer);
  }

  deleteCustomer(id: number): void {
    this.customers.update((list) => list.filter((customer) => customer.ID !== id));
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

  private nextId(items: { ID: number }[]): number {
    return items.reduce((max, item) => Math.max(max, item.ID), 0) + 1;
  }

  private saveItem<T extends { ID: number }>(list: WritableSignal<T[]>, item: T): 'added' | 'updated' {
    const exists = list().some((entry) => entry.ID === item.ID);
    if (!exists) {
      list.update((items) => [...items, item]);
      return 'added';
    }

    list.update((items) =>
      [...items.filter((entry) => entry.ID !== item.ID), item].sort((a, b) => a.ID - b.ID),
    );
    return 'updated';
  }
}
