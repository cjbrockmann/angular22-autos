import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataStore } from '../../data-store';

@Component({
  selector: 'app-autos',
  imports: [RouterLink],
  templateUrl: './autos.html',
  styleUrl: './autos.css',
})
export class Autos {
  private readonly store = inject(DataStore);

  protected readonly selectedBrand = signal('');
  protected readonly brands = this.store.brands;
  protected readonly firstLabel = computed(() =>
    this.selectedBrand() ? 'Alle anzeigen' : 'Nach Marke filtern',
  );
  protected readonly cars = computed(() => {
    const brand = this.selectedBrand();
    const all = this.store.cars();
    return brand ? all.filter((car) => car.Marke === brand) : all;
  });

  protected onBrandSelect(value: string): void {
    this.selectedBrand.set(value);
  }
}
