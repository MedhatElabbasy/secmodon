import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ContractsService } from '../../services/contracts.service';
import { data } from './model/data';

@Injectable({
  providedIn: 'root'
})
export class AdditionalDataResolver implements Resolve<data[]> {
  constructor(private contracts: ContractsService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<data[]> {
    return this.contracts.getAllData();
  }
}
