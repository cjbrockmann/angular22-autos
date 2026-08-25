import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataStore } from '../../data-store';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly store = inject(DataStore);

  protected readonly carCount = computed(() => this.store.cars().length);
  protected readonly dealerCount = computed(() => this.store.dealers().length);
  protected readonly customerCount = computed(() => this.store.customers().length);
  protected readonly brands = this.store.brands;
  protected readonly dealerCities = this.store.dealerCities;
}
