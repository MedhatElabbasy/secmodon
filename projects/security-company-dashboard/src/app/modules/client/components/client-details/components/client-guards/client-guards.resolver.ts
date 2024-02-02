import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ClientSite } from '../../../../models/client-site';
import { ClientSiteService } from '../../../../services/client-site.service';
import { AuthService } from 'projects/security-company-dashboard/src/app/modules/auth/services/auth.service';
import { Roles } from 'projects/tools/src/public-api';

@Injectable({
  providedIn: 'root',
})
export class ClientGuardsResolver implements Resolve<ClientSite[]> {
  constructor(private sites: ClientSiteService,
    private auth: AuthService) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ClientSite[]> {
     let clientId = route.parent?.params['id'];
     let isAdmin = this.auth.snapshot.userIdentity?.roles.includes(
      Roles.VirtualAdmin
    );
    let branchID : string | any= this.auth.snapshot.userInfo?.securityCompanyBranch.id
    // return this.sites.getAllByClientId(clientId);
    let sites$: Observable<ClientSite[]>;
    if (isAdmin) {
      sites$ = this.sites.getAllByClientId(clientId)
   } else {
      sites$ = this.sites.GetAllSiteLocationsByClientIdSecurityCompanyBranch(clientId,branchID)as Observable<ClientSite[]>;
   }

   return sites$
  }
}
