import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Routing } from '../../core/routes/app-routes';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PackagesGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.auth.packages.getValue()) {
      const link = `/${Routing.dashboard}/${Routing.packages.module}/${Routing.packages.children.packages}`;
      return this.router.navigate([link]);
    }
    return true;
  }
}
