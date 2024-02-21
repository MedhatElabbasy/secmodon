import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../../../services/reports.service';
import { ModalService } from 'projects/tools/src/public-api';
import { Router } from '@angular/router';
import { Routing } from 'projects/security-company-dashboard/src/app/modules/core/routes/app-routes';
//import { Routing } from 'projects/client-app/src/app/modules/core/routes/app-routes';

@Component({
  selector: 'app-accreditation',
  templateUrl: './accreditation.component.html',
  styleUrls: ['./accreditation.component.scss'],
})
export class AccreditationComponent implements OnInit, OnDestroy {
  checkboxForm: FormGroup;
  submitted = false;
  options = ['موافقة', 'عدم موافقة'];
  combinedFormData!: any;
  finish = 'doneExclude';
  constructor(
    private fb: FormBuilder,
    private form4: ReportsService,
    private FormsData: ReportsService,
    public _model: ModalService,
    private _route: Router
  ) {
    this.checkboxForm = this.fb.group({
      accreditationOK: ['', Validators.required],
      branchManager: [null, Validators.required],
      branchManagerSignature: [null, Validators.required],
      dependenceDisapprovalReason: [null, Validators.required],
    });
  }

  get controls(): any {
    return this.checkboxForm.controls;
  }
  ngOnInit(): void {
    // this.form4.screenRoute.next('/dashboard/reports/form-exclude/exclude-new-request/accreditation')
  }
  ngOnDestroy() {
    // this.form4.screenRoute.next('/dashboard/reports/form-exclude/exclude-new-request/response')
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.checkboxForm.valid) {
      const formData = this.checkboxForm.value;
      this.form4.formData$.subscribe((formData) => {
        // Combine form data from all components
        this.combinedFormData = {
          ...this.combinedFormData,
          ...formData,
        };
      });
      console.log(this.combinedFormData);
      let model = {
        createDate: this.combinedFormData[0].createDate,
        securityGuardId: this.combinedFormData[0].securityGuardId,
        reasonStatusType: this.combinedFormData[1].reasonStatusType,
        reasonForTransfer: this.combinedFormData[1].reasonForTransfer,
        transferDetailsAttachment: [
          {
            photoId: this.combinedFormData[1].attachmentId,
          },
        ],
        securityOfficial: this.combinedFormData[1].securityOfficial,
        contractorProjectManager:
          this.combinedFormData[1].contractorProjectManager,
        securityOfficialSignature:
          this.combinedFormData[1].securityOfficialSignature,
        contractorProjectManagerSignature:
          this.combinedFormData[1].contractorProjectManagerSignature,
        response: this.combinedFormData[2].response,
        inappropriateReason: this.combinedFormData[2].inappropriateReason,
        responserName: this.combinedFormData[2].responserName,
        responseSignature: this.combinedFormData[2].responseSignature,
        accreditationOK: this.checkboxForm.controls['accreditationOK'].value,
        dependenceDisapprovalReason:
          this.checkboxForm.controls['dependenceDisapprovalReason'].value,
        branchManager: this.checkboxForm.controls['branchManager'].value,
        branchManagerSignature:
          this.checkboxForm.controls['branchManagerSignature'].value,
        securityCompanyId: this.combinedFormData[0].securityCompanyId,
      };

      this.form4.submitAllForms(model).subscribe((res) => {
        console.log(res);
        this._model.open(this.finish);
      });
    }
  }

  SubmitAndView() {
    this.submitted = true;
    if (this.checkboxForm.valid) {
      const formData = this.checkboxForm.value;
      this.form4.formData$.subscribe((formData) => {
        // Combine form data from all components
        this.combinedFormData = {
          ...this.combinedFormData,
          ...formData,
        };
      });
      console.log(this.combinedFormData);
      let model = {
        createDate: this.combinedFormData[0].createDate,
        securityGuardId: this.combinedFormData[0].securityGuardId,
        reasonStatusType: this.combinedFormData[1].reasonStatusType,
        reasonForTransfer: this.combinedFormData[1].reasonForTransfer,
        transferDetailsAttachment: [
          {
            photoId: this.combinedFormData[1].attachmentId,
          },
        ],
        securityOfficial: this.combinedFormData[1].securityOfficial,
        contractorProjectManager:
          this.combinedFormData[1].contractorProjectManager,
        securityOfficialSignature:
          this.combinedFormData[1].securityOfficialSignature,
        contractorProjectManagerSignature:
          this.combinedFormData[1].contractorProjectManagerSignature,
        response: this.combinedFormData[2].response,
        inappropriateReason: this.combinedFormData[2].inappropriateReason,
        responserName: this.combinedFormData[2].responserName,
        responseSignature: this.combinedFormData[2].responseSignature,
        accreditationOK: this.checkboxForm.controls['accreditationOK'].value,
        dependenceDisapprovalReason:
          this.checkboxForm.controls['dependenceDisapprovalReason'].value,
        branchManager: this.checkboxForm.controls['branchManager'].value,
        branchManagerSignature:
          this.checkboxForm.controls['branchManagerSignature'].value,
        securityCompanyId: this.combinedFormData[0].securityCompanyId,
      };

      this.form4.submitAllForms(model).subscribe((res: any) => {
        console.log(res);
        this._route.navigate([
          `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.formExclude}/${Routing.reports.children.viewExcludeRequest}/${res.id}`,
        ]);
      });
    }
  }

  continue() {
    this._model.close(this.finish);
    this._route.navigate([
      `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.formExclude}`,
    ]);
  }
}
