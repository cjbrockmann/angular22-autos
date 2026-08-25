import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataStore } from '../../data-store';
import { CARS } from '../../models';

type SortKey = 'ID' | 'Marke' | 'Modell';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-autos',
  imports: [RouterLink],
  templateUrl: './autos.html',
  styleUrl: './autos.css',
})
export class Autos {
  private readonly store = inject(DataStore);

  protected readonly selectedBrand = signal('');
  protected readonly sortKey = signal<SortKey>('ID');
  protected readonly sortDir = signal<SortDir>('asc');
  protected readonly brands = this.store.brands;
  protected readonly firstLabel = computed(() =>
    this.selectedBrand() ? 'Alle anzeigen' : 'Nach Marke filtern',
  );
  protected readonly cars = computed(() => {
    const brand = this.selectedBrand();
    const key = this.sortKey();
    const dir = this.sortDir();
    const filtered = brand
      ? this.store.cars().filter((car) => car.Marke === brand)
      : this.store.cars();

    return [...filtered].sort((a, b) => this.compareCars(a, b, key, dir));
  });

  protected onBrandSelect(value: string): void {
    this.selectedBrand.set(value);
  }

  protected sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      return;
    }
    this.sortKey.set(key);
    this.sortDir.set('asc');
  }

  protected sortIndicator(key: SortKey): string {
    if (this.sortKey() !== key) {
      return '';
    }
    return this.sortDir() === 'asc' ? ' ▲' : ' ▼';
  }

  protected ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) {
      return 'none';
    }
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  private compareCars(a: CARS, b: CARS, key: SortKey, dir: SortDir): number {
    const left = this.sortValue(a, key);
    const right = this.sortValue(b, key);
    const result =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'de');
    return dir === 'asc' ? result : -result;
  }

  private sortValue(car: CARS, key: SortKey): string | number {
    if (key === 'ID') {
      return car.ID;
    }
    if (key === 'Marke') {
      return car.Marke;
    }
    return car.Modell.replace(/<[^>]+>/g, '').trim();
  }
}
