import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataStore } from '../../data-store';

@Component({
  selector: 'app-haendler',
  imports: [RouterLink],
  templateUrl: './haendler.html',
  styleUrl: './haendler.css',
})
export class Haendler {
  private readonly store = inject(DataStore);

  protected readonly selectedCity = signal('');
  protected readonly cities = this.store.dealerCities;
  protected readonly firstLabel = computed(() =>
    this.selectedCity() ? 'Alle anzeigen' : 'Nach Ort filtern',
  );
  protected readonly dealers = computed(() => {
    const city = this.selectedCity();
    const all = this.store.dealers();
    return city ? all.filter((dealer) => dealer.Ort === city) : all;
  });

  protected onCitySelect(value: string): void {
    this.selectedCity.set(value);
  }
}
