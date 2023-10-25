import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { convertDateToString } from 'projects/tools/src/public-api';
import { Loader } from '../../../core/enums/loader.enum';
import { Incident } from '../../models/incident';
import { ReportsService } from '../../services/reports.service';
import { Roles } from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AccidentsResolver implements Resolve<Incident[]> {
  constructor(private reports: ReportsService, private auth: AuthService) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any[]> {
    let startDate = convertDateToString(new Date());
    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      return this.reports.getAllAccidentByCompany(
        startDate,
        startDate,
        Loader.yes
      );
    }
    return this.reports.getAllAccidentByBranch(
      startDate,
      startDate,
      Loader.yes
    );

  }
}
