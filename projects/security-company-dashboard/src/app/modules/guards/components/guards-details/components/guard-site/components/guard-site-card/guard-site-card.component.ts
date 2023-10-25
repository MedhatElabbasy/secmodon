import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { SiteLocation } from 'projects/security-company-dashboard/src/app/modules/client/models/site-details';
import { CompanyGuardsService } from 'projects/security-company-dashboard/src/app/modules/guards/services/company-guards.service';
import { ActivatedRoute } from '@angular/router';
import { CryptoService, LangService } from 'projects/tools/src/public-api';
@Component({
  selector: 'app-guard-site-card',
  templateUrl: './guard-site-card.component.html',
  styleUrls: ['./guard-site-card.component.scss'],
})
export class GuardSiteCardComponent implements OnInit, OnChanges {
  @Input('site') site!: SiteLocation;
  name!: string
  shift!: any
  schedule!: any;
  locationGuard:any;
  constructor(private crypto: CryptoService, public lang: LangService, private _CompanyGuardsService: CompanyGuardsService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.parent?.params.subscribe((params) => {
      let encryptedGuard = params['guard'];
      let data = JSON.parse(this.crypto.decrypt(encryptedGuard));
      this._CompanyGuardsService.GetSchedulingByGuardId(data.id).subscribe((res: any) => {
        this.schedule = res
        console.log(res);
        console.log(res.scheduling.name);
        
        this.name = `${res.siteSupervisorShift.companySecurityGuard.securityGuard.firstName} ${res.siteSupervisorShift.companySecurityGuard.securityGuard.middleName} ${res.siteSupervisorShift.companySecurityGuard.securityGuard.lastName}`
        this.shift = res.scheduling.clientShiftSchedule.companyShift.shiftType
      })
      // this._CompanyGuardsService.getGuardSites(data.id).subscribe((res) => {
      //   this.locationGuard = res[0]
      //   console.log(this.locationGuard);
        
      // })


    });
  }

  ngOnChanges(changes: SimpleChanges): void {
      // console.log(this.site);
      
  }
}
