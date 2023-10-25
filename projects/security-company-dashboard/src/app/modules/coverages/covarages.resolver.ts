import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Observable, combineLatest, map, of } from 'rxjs';
import { CoveragesService } from './services/coverages.service';
import { Roles } from 'projects/tools/src/public-api';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CovaragesResolver implements Resolve<any> {
  constructor(private _CoveragesService: CoveragesService,private auth:AuthService) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    let coverage$;
    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      coverage$ = this._CoveragesService.getAllCoverages(1, 10);
    } else {
      coverage$ = this._CoveragesService.getAllCoveragesBybranch(1, 10);
    }



    return coverage$;
  }
}
