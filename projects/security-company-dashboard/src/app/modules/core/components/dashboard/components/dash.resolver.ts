import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { Roles, convertDateToString } from 'projects/tools/src/public-api';
import { AttendanceReport } from '../../../../reports/models/attendance-report';
import { ReportsService } from '../../../../reports/services/reports.service';
import { Loader } from '../../../enums/loader.enum';
import { AuthService } from '../../../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DashResolver implements Resolve<AttendanceReport[]> {
  constructor(private reports: ReportsService, private auth: AuthService) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<AttendanceReport[]> {
    let startDate = convertDateToString(new Date());
    let role = this.auth.snapshot.userIdentity?.role;
    console.log(role);
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      return this.reports.getAttendanceReport(startDate, startDate, Loader.yes);
    }
    return this.reports.getAttendanceReportByBranch(startDate, startDate, Loader.yes);
  }
}
