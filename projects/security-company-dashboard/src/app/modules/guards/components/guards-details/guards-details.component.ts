import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CryptoService, ModalService } from 'projects/tools/src/public-api';
import { CompanySecurityGuard } from '../../../client/models/site-details';
import { Routing } from '../../../core/routes/app-routes';
import { GuardDetailsRoutesList } from '../../routes/guards-routes.enum';
import { CompanyGuardsService } from '../../services/company-guards.service';
import { AuthService } from '../../../auth/services/auth.service';
import { GuardsService } from '../../../core/services/guards.service';
import jwt_decode from "jwt-decode";


@Component({
  selector: 'app-guards-details',
  templateUrl: './guards-details.component.html',
  styleUrls: ['./guards-details.component.scss'],
})
export class GuardsDetailsComponent implements OnInit {
  guard!: any;
  links = [...GuardDetailsRoutesList];
  modalId = "resetID"
  backLink = `/${Routing.dashboard}/${Routing.guards.module}`;
  token: any = ""
  userInfo: any



  constructor(
    private route: ActivatedRoute,
    private crypto: CryptoService,
    public modalService: ModalService,
    private _companyGuard: CompanyGuardsService,
    private _AuthService: AuthService,
    private _GuardsService: GuardsService,
    private _Router: Router
  ) {
    this.token = localStorage.getItem("token")

  }

  ngOnInit(): void {

    if (this.token) {
      var decoded = jwt_decode(this.token);
      this.userInfo = decoded

    }

    this.route.params.subscribe((params) => {
      let encryptedGuard = params['guard'];
      this.guard = JSON.parse(this.crypto.decrypt(encryptedGuard));
      this._AuthService.getSecurityCompany().subscribe((res) => {
        // if(res.securityCompanyBranch.id != this.guard.securityCompanyBranchId){
        //   console.log("Yes");

        //   console.log(res.securityCompanyBranch.id);

        //   console.log(this.guard.securityCompanyBranchId);

        // }else{
        //   console.log("Noooooooooooooooooo");
        //   console.log(res.securityCompanyBranch.id);

        //   console.log(this.guard.securityCompanyBranchId);
        // }

        console.log(this.guard);

        this._GuardsService.getGuardData(this.guard.id).subscribe((res2) => {
          console.log(res);
          console.log(res2);

          if (res.securityCompanyBranch.id != res2.securityCompanyBranchId && this.userInfo.role == 'user') {
            this._Router.navigate(['/dashboard/guards/guards-list'])
          } else {
            console.log("Hooooooooooooooooooooooo");

          }
        })


      })

    });
  }


  resetID(id: number) {


    this._companyGuard.deleteID(id).subscribe((res) => {

      this.modalService.open(this.modalId);

    })
  }

  closeModel() {
    this.modalService.close(this.modalId);
  }
}
