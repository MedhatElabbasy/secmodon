import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { PackagesService } from '../services/packages.service';
import { Package } from './../model/package';

@Injectable({
  providedIn: 'root'
})
export class PackagesResolver implements Resolve<Package[]> {
  constructor(private PackagesService: PackagesService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Package[]> {
    let packages;
    packages = this.PackagesService.getAll();

    return packages;
  }
}


