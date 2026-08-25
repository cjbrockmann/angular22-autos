import { Routes } from '@angular/router';
import { Home } from './sites/home/home';
import { Haendler } from './sites/haendler/haendler';
import { Haendlerdetails } from './sites/haendler/haendlerdetails/haendlerdetails';
import { Person } from './sites/person/person';
import { Persondetails } from './sites/person/persondetails/persondetails';
import { Autos } from './sites/autos/autos';
import { Autodetails } from './sites/autos/autodetails/autodetails';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'haendler/:ID', component: Haendlerdetails },
  { path: 'haendler', component: Haendler },
  { path: 'person/:ID', component: Persondetails },
  { path: 'person', component: Person },
  { path: 'autos/:ID', component: Autodetails },
  { path: 'autos', component: Autos },
];
