import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataStore } from '../../../data-store';
import { HAENDLER } from '../../../models';

type ViewState = 'details' | 'edit' | 'new';

@Component({
  selector: 'app-haendlerdetails',
  imports: [FormsModule, RouterLink],
  templateUrl: './haendlerdetails.html',
  styleUrl: './haendlerdetails.css',
})
export class Haendlerdetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(DataStore);

  dealer: HAENDLER | undefined;
  viewstate: ViewState = 'details';
  editmodus = false;
  message = '';
  errorMessage = '';

  private selectedId = 0;

  ngOnInit(): void {
    const selID = this.route.snapshot.paramMap.get('ID');
    if (selID && !Number.isNaN(Number(selID))) {
      this.selectedId = Number.parseInt(selID, 10);
    }

    const view = (this.route.snapshot.queryParamMap.get('viewstate') as ViewState) || 'details';
    this.selectAction(view);
  }

  selectAction(action: string): void {
    this.message = '';
    this.errorMessage = '';

    if (!action) {
      action = 'details';
    }

    if (action === 'details') {
      this.loadDealer();
      this.viewstate = 'details';
      this.editmodus = false;
    }

    if (action === 'edit') {
      if (!this.dealer) {
        this.loadDealer();
      }
      this.viewstate = 'edit';
      this.editmodus = true;
    }

    if (action === 'new') {
      this.viewstate = 'new';
      this.editmodus = true;
      this.dealer = {
        ID: this.store.nextDealerId(),
        Firmenname: '',
        PLZ: '',
        Ort: '',
        Email: '',
        Telefon: '',
      };
    }

    if (action === 'save') {
      this.save();
    }
  }

  saveAndStay(): void {
    this.selectAction('save');
    if (!this.errorMessage && this.dealer) {
      void this.router.navigate(['/haendler', this.dealer.ID], {
        queryParams: { viewstate: 'details' },
      });
    }
  }

  deleteAndLeave(): void {
    if (!this.dealer || this.viewstate === 'new') {
      return;
    }
    this.store.deleteDealer(this.dealer.ID);
    void this.router.navigate(['/haendler']);
  }

  private loadDealer(): void {
    const found = this.store.getDealer(this.selectedId);
    if (found) {
      this.dealer = { ...found };
      return;
    }
    this.dealer = {
      ID: 0,
      Firmenname: '',
      PLZ: '',
      Ort: '',
      Email: '',
      Telefon: '',
    };
  }

  private save(): void {
    if (!this.dealer) {
      return;
    }

    if (!this.dealer.Firmenname) {
      this.errorMessage = 'Bitte Daten vervollständigen!';
      return;
    }

    const result = this.store.saveDealer(this.dealer);
    this.viewstate = 'details';
    this.editmodus = false;
    this.message = result === 'added' ? 'Datensatz hinzugefügt!' : 'Datensatz gespeichert!';
  }
}
