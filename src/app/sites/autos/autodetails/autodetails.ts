import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataStore } from '../../../data-store';
import { CARS, HAENDLER, KUNDE } from '../../../models';

type ViewState = 'details' | 'edit' | 'new';

@Component({
  selector: 'app-autodetails',
  imports: [FormsModule, RouterLink],
  templateUrl: './autodetails.html',
  styleUrl: './autodetails.css',
})
export class Autodetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(DataStore);

  auto: CARS | undefined;
  viewstate: ViewState = 'details';
  editmodus = false;
  message = '';
  errorMessage = '';
  haendler: HAENDLER[] = [];
  kunden: KUNDE[] = [];

  private selectedId = 0;

  ngOnInit(): void {
    const selID = this.route.snapshot.paramMap.get('ID');
    if (selID && !Number.isNaN(Number(selID))) {
      this.selectedId = Number.parseInt(selID, 10);
    }

    const view = (this.route.snapshot.queryParamMap.get('viewstate') as ViewState) || 'details';
    this.haendler = this.store.dealers();
    this.kunden = this.store.customers();
    this.selectAction(view);
  }

  displayName(value: string | undefined): string {
    return value ?? '';
  }

  selectAction(action: string): void {
    this.message = '';
    this.errorMessage = '';

    if (!action) {
      action = 'details';
    }

    if (action === 'details') {
      this.loadCar();
      this.viewstate = 'details';
      this.editmodus = false;
    }

    if (action === 'edit') {
      if (!this.auto) {
        this.loadCar();
      }
      this.viewstate = 'edit';
      this.editmodus = true;
    }

    if (action === 'new') {
      this.viewstate = 'new';
      this.editmodus = true;
      this.auto = {
        ID: this.store.nextCarId(),
        Marke: '',
        Modell: '',
        Fahrgestellnummer: '',
        KundenID: null,
        HaendlerID: null,
        Erstzulassung: '',
        ErstKennzeichen: '',
      };
    }

    if (action === 'save') {
      this.save();
    }
  }

  saveAndStay(): void {
    this.selectAction('save');
    if (!this.errorMessage && this.auto) {
      void this.router.navigate(['/autos', this.auto.ID], {
        queryParams: { viewstate: 'details' },
      });
    }
  }

  private loadCar(): void {
    const found = this.store.getCar(this.selectedId);
    if (found) {
      this.auto = { ...found };
      this.assignDealer();
      this.assignCustomer();
      return;
    }
    this.auto = {
      ID: 0,
      Marke: '',
      Modell: '',
      Fahrgestellnummer: '',
      KundenID: null,
      HaendlerID: null,
      Erstzulassung: '',
      ErstKennzeichen: '',
    };
  }

  private assignDealer(): void {
    if (!this.auto) {
      return;
    }
    this.auto.Haendler = this.store.dealerName(this.auto.HaendlerID);
  }

  private assignCustomer(): void {
    if (!this.auto) {
      return;
    }
    this.auto.Kunde = this.store.customerName(this.auto.KundenID);
  }

  private save(): void {
    if (!this.auto) {
      return;
    }

    if (!this.auto.Marke) {
      this.errorMessage = 'Bitte Daten vervollständigen!';
      return;
    }

    this.assignDealer();
    this.assignCustomer();
    const result = this.store.saveCar(this.auto);
    this.viewstate = 'details';
    this.editmodus = false;
    this.message = result === 'added' ? 'Datensatz hinzugefügt!' : 'Datensatz gespeichert!';
  }
}
