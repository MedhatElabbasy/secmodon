import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CanvasService, CryptoService, LangService, LookupService, ModalService } from 'projects/tools/src/public-api';
import { CompanyGuardsService } from '../../services/company-guards.service';
import { GuardsService } from '../../../core/services/guards.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientSiteService } from '../../../client/services/client-site.service';
import jwt_decode from "jwt-decode";
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-guard-branch',
  templateUrl: './guard-branch.component.html',
  styleUrls: ['./guard-branch.component.scss']
})
export class GuardBranchComponent implements OnInit {

  guard: any;
  guardId: any;
  canvasID = 'changeBranch'
  addBranchForm!: FormGroup;
  securityCompanyBranches: any;
  securityCompanyBranchesDropDown: any;
  userData: any;
  token: any = ""
  userInfo: any

  constructor(
    private route: ActivatedRoute,
    private crypto: CryptoService,
    public modalService: ModalService,
    private _CompanyGuardsService: CompanyGuardsService,
    public _GuardsService: GuardsService,
    public lang: LangService,
    private _CanvasService: CanvasService,
    private _ClientSiteService: ClientSiteService,
    private fb: FormBuilder,
    private _Router: Router,
    private _AuthService: AuthService

  ) {
    this.token = localStorage.getItem("token")

  }


  ngOnInit(): void {
    this.generateBranchForm()
    this.guardInfo()
    this.getAllBranches()



    if (this.token) {
      var decoded = jwt_decode(this.token);
      this.userInfo = decoded

    }


  }



  guardInfo() {
    this.route.parent?.params.subscribe((params) => {
      let encryptedGuard = params['guard'];
      let data = JSON.parse(this.crypto.decrypt(encryptedGuard));
      let id = data.securityGuard.appUserId;
      let guardId = this._CompanyGuardsService.id.getValue();
      this._GuardsService.getGuardData(data.id).subscribe((res) => {
        console.log(res);
        this.guard = res
        this.userData = res
      })
      this.guardId = data.id

      this.addBranchForm.setValue({
        id: data.id,
        branchId: ""
      })



    });


  }


  addBranch() {
    this.securityCompanyBranchesDropDown = this.securityCompanyBranches
    this._CanvasService.open(this.canvasID)
  }


  changeBranch() {
    console.log(this.userData.securityCompanyBranchId);

    this.securityCompanyBranchesDropDown = this.securityCompanyBranches.filter((branch: any) => branch.id != this.userData.securityCompanyBranchId)
    console.log(this.securityCompanyBranches);
    console.log(this.securityCompanyBranchesDropDown);
    this._CanvasService.open(this.canvasID)
  }

  deleteBranch() {
    this._AuthService.getSecurityCompany().subscribe((res) => {
      this._GuardsService.getGuardData(this.userData.id).subscribe((res2) => {
        if (res2.securityCompanyBranchId == res.securityCompanyBranch.id) {
          this._CompanyGuardsService.deleteFromBranch(this.guardId).subscribe((res) => {
            this._Router.navigate(['/dashboard/guards/guards-list'])
          })
        } else {
          this._Router.navigate(['/dashboard/guards/guards-list'])
        }
      })
    })
  }

  getAllBranches() {
    this._ClientSiteService.allBranches().subscribe((res) => {
      console.log(res);
      this.securityCompanyBranches = res
    })
  }


  get roleControls(): any {
    return this.addBranchForm.controls;
  }


  generateBranchForm() {
    this.addBranchForm = this.fb.group({
      branchId: ['', Validators.required],
      id: ['', Validators.required],
    });
  }



  onSubmit() {

    console.log(this.addBranchForm.value);

    // this.jobType = this.changeRoleForm.controls['Role'].value;
    // this.companyGuards.changeJobType(this.jobType, this.guard.id).subscribe((res) => {

    //   this.guardInfo();
    // })

    this._CompanyGuardsService.assignGuardToBranch(this.addBranchForm.value).subscribe((res) => {
      console.log(res);
      this.guardInfo()
    })
    this._CanvasService.close(this.canvasID);
  }

}
