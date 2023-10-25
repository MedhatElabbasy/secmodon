import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router, UrlTree } from '@angular/router';

import { Routing } from '../../core/routes/app-routes';
import { AuthService } from '../services/auth.service';
import { map, Observable, take } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UpdateDataGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): any {
    this.auth.userInfo.subscribe((res: any) => {
      if (res && !res.licenseImageId) {
        const link = `/${Routing.addNewData}`;
        return this.router.navigate([link]);
      }
      return true;
    })

  }

}
