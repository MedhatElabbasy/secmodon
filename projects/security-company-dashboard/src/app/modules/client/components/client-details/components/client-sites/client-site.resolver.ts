import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { GuardsService } from 'projects/security-company-dashboard/src/app/modules/core/services/guards.service';
import { SchedulesService } from 'projects/security-company-dashboard/src/app/modules/schedules/services/schedules.service';
import { combineLatest, map, Observable, of } from 'rxjs';
import { ClientSiteService } from '../../../../services/client-site.service';
import { AuthService } from 'projects/security-company-dashboard/src/app/modules/auth/services/auth.service';
import { Roles } from 'projects/tools/src/public-api';

@Injectable({
  providedIn: 'root',
})
export class ClientSiteResolver implements Resolve<any> {
  constructor(
    private schedules: SchedulesService,
    private guards: GuardsService,
    private sites: ClientSiteService,
    private auth: AuthService
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    let isAdmin = this.auth.snapshot.userIdentity?.roles.includes(
      Roles.VirtualAdmin
    );
    let sites$
    let clientId = route.parent?.params['id'];
    let branchID : string | any= this.auth.snapshot.userInfo?.securityCompanyBranch.id
    let shifts$ = this.schedules.getAllShifts(clientId);
    let supervisors$ = this.guards.getAllAvailableSupervisorsByBranch();
    if (isAdmin) {
     sites$ = this.sites.getAllByClientId(clientId);
  } else {
     sites$ = this.sites.GetAllSiteLocationsByClientIdSecurityCompanyBranch(clientId,branchID);
  }

    return combineLatest([shifts$, supervisors$, sites$]).pipe(
      map((res) => ({ shifts: res[0], supervisors: res[1], sites: res[2] }))
    );
  }
}
