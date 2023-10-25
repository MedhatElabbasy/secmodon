import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanySecurityGuard } from 'projects/security-company-dashboard/src/app/modules/client/models/site-details';
import { GuardsService } from 'projects/security-company-dashboard/src/app/modules/core/services/guards.service';
import { CanvasService, CryptoService, LangService, LookupService } from 'projects/tools/src/public-api';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { CompanyGuardsService } from '../../../../services/company-guards.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { log } from 'console';
import { AuthService } from 'projects/client-app/src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-guard-general-details',
  templateUrl: './guard-general-details.component.html',
  styleUrls: ['./guard-general-details.component.scss'],
})
export class GuardGeneralDetailsComponent implements OnInit {
  guard!: any;
  link!: string;
  env = environment.api;
  canvasID = 'changeRole'
  changeRoleForm!: FormGroup;
  jobs!: any
  jobType!: number

  constructor(
    private route: ActivatedRoute,
    private crypto: CryptoService,
    public lang: LangService,
    public _GuardsService: GuardsService,
    private companyGuards: CompanyGuardsService,
    private _canvas: CanvasService,
    private fb: FormBuilder,
    public _lookups: LookupService,
    private auth: AuthService,
  ) {
    this.getAllRoles();
    this.generateRoleForm();

  }

  ngOnInit(): void {

    this.auth.getClientInfo()
    this.auth.userInfo.subscribe((res) => {
      console.log(res)
    });
    this.auth.getUser().subscribe((res) => {
      console.log(res);
      
    })
    this.guardInfo();


  }

  guardInfo() {
    this.route.parent?.params.subscribe((params) => {
      let encryptedGuard = params['guard'];
      let data = JSON.parse(this.crypto.decrypt(encryptedGuard));
      let id = data.securityGuard.appUserId;
      let guardId = this.companyGuards.id.getValue();
      console.log(guardId);
      console.log(id);
      console.log(data.id);
      this._GuardsService.getGuardData(data.id).subscribe((res) => {
        console.log(res);

      })

      this.link = `${environment.api}CompanySecurityGuard/DocumentProccess?SecurityGuradId=${guardId}`;
      this._GuardsService.getById(id).subscribe((res) => {
        this.guard = res;

      });


    });


  }

  get roleControls(): any {
    return this.changeRoleForm.controls;
  }


  generateRoleForm() {
    this.changeRoleForm = this.fb.group({
      Role: [false]
    });
  }

  getAllRoles() {
    this._lookups.getAllJobTypes().subscribe((res) => {

      this.jobs = res;
    })
  }

  changeRole() {
    this._canvas.open(this.canvasID)
  }

  onSubmit() {

    this.jobType = this.changeRoleForm.controls['Role'].value;
    this.companyGuards.changeJobType(this.jobType, this.guard.id).subscribe((res) => {

      this.guardInfo();
    })
    this._canvas.close(this.canvasID);
  }
}
