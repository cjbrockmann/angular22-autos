import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataStore } from '../../../data-store';
import { KUNDE } from '../../../models';

type ViewState = 'details' | 'edit' | 'new';

@Component({
  selector: 'app-persondetails',
  imports: [FormsModule, RouterLink],
  templateUrl: './persondetails.html',
  styleUrl: './persondetails.css',
})
export class Persondetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(DataStore);

  kunde: KUNDE | undefined;
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
      this.loadCustomer();
      this.viewstate = 'details';
      this.editmodus = false;
    }

    if (action === 'edit') {
      if (!this.kunde) {
        this.loadCustomer();
      }
      this.viewstate = 'edit';
      this.editmodus = true;
    }

    if (action === 'new') {
      this.viewstate = 'new';
      this.editmodus = true;
      this.kunde = {
        ID: this.store.nextCustomerId(),
        Nachname: '',
        Vorname: '',
        Anrede: '',
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
    if (!this.errorMessage && this.kunde) {
      void this.router.navigate(['/person', this.kunde.ID], {
        queryParams: { viewstate: 'details' },
      });
    }
  }

  deleteAndLeave(): void {
    if (!this.kunde || this.viewstate === 'new') {
      return;
    }
    this.store.deleteCustomer(this.kunde.ID);
    void this.router.navigate(['/person']);
  }

  private loadCustomer(): void {
    const found = this.store.getCustomer(this.selectedId);
    if (found) {
      this.kunde = { Vorname: '', Telefon: '', ...found };
      return;
    }
    this.kunde = {
      ID: 0,
      Nachname: '',
      Vorname: '',
      Anrede: '',
      PLZ: '',
      Ort: '',
      Email: '',
      Telefon: '',
    };
  }

  private save(): void {
    if (!this.kunde) {
      return;
    }

    if (!this.kunde.Nachname) {
      this.errorMessage = 'Bitte Daten vervollständigen!';
      return;
    }

    const result = this.store.saveCustomer(this.kunde);
    this.viewstate = 'details';
    this.editmodus = false;
    this.message = result === 'added' ? 'Datensatz hinzugefügt!' : 'Datensatz gespeichert!';
  }
}
