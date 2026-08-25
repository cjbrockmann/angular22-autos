import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import autosJson from '../../../public/data/autos.json';
import haendlerJson from '../../../public/data/haendler.json';
import kundenJson from '../../../public/data/kunden.json';
import { DataStore } from '../data-store';
import { CARS, HAENDLER, KUNDE } from '../models';

export const dataStoreTestProviders = [provideHttpClient()];

export function seedDataStore(): DataStore {
  const store = TestBed.inject(DataStore);
  store.seed(autosJson as CARS[], haendlerJson as HAENDLER[], kundenJson as KUNDE[]);
  return store;
}
