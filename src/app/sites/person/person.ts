import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataStore } from '../../data-store';

@Component({
  selector: 'app-person',
  imports: [RouterLink],
  templateUrl: './person.html',
  styleUrl: './person.css',
})
export class Person {
  private readonly store = inject(DataStore);

  protected readonly selectedCity = signal('');
  protected readonly cities = this.store.customerCities;
  protected readonly firstLabel = computed(() =>
    this.selectedCity() ? 'Alle anzeigen' : 'Nach Ort filtern',
  );
  protected readonly customers = computed(() => {
    const city = this.selectedCity();
    const all = this.store.customers();
    return city ? all.filter((customer) => customer.Ort === city) : all;
  });

  protected displayName(value: string | undefined): string {
    return value ?? '';
  }

  protected onCitySelect(value: string): void {
    this.selectedCity.set(value);
  }
}
