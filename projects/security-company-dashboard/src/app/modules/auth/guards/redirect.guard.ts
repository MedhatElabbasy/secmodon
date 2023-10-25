import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { Routing } from '../../core/routes/app-routes';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }
  data!: any
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): any {
    //   this.auth.userInfo.subscribe((res: any) => {
    //     if (res && res.licenseImageId) {
    //       const link = `/${Routing.dashboard}`;
    //       return this.router.navigate([link]);
    //     }
    // 

    //     return true;
    //   })
  }

}
