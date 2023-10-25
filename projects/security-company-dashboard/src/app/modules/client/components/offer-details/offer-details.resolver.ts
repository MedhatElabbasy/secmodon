import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { OfferDetailsService } from '../../services/offer-details.service';

@Injectable({
  providedIn: 'root'
})
export class OfferDetailsResolver implements Resolve<any> {
  constructor(private offerService: OfferDetailsService) {


  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let id: string = route.paramMap.get('id') || ' '
    let data = this.offerService.getOffer(id)
    return data
  }
}
