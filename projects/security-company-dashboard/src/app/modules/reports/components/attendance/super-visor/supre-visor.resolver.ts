import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ReportsService } from '../../../services/reports.service';

import { Loader } from '../../../../core/enums/loader.enum';
import { Roles, convertDateToString } from 'projects/tools/src/public-api';
import { AuthService } from '../../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SupreVisorResolver implements Resolve<any[]> {
  constructor(private reports: ReportsService, private auth: AuthService) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any[]> {
    // let startDate = convertDateToString(new Date());
    // this.reports
    //   .getAttendanceSuperVisorReport(startDate, startDate, Loader.yes)
    //   .subscribe((res) => {
    //     console.log(res);
    //   });
    // return this.reports.getSuperVisorsAttendance(
    //   Loader.yes
    // );
    let startDate = convertDateToString(new Date());
    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.reports
        .getAttendanceSuperVisorReport(startDate, startDate, Loader.yes)
        .subscribe((res) => {
          console.log(res);
        });
      return this.reports.getSuperVisorsAttendance(
        Loader.yes
      );
    }
    this.reports
      .getAttendanceSuperVisorReportAndBranch(startDate, startDate, Loader.yes)
      .subscribe((res) => {
        console.log(res);
      });
    return this.reports.getSuperVisorsAttendance(
      Loader.yes
    );
  }
}
