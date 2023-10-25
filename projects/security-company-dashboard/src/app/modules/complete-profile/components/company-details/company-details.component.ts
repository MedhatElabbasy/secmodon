import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormProvider } from '../../../auth/models/form-provider';
import { CompanyProfileService } from '../../../jobs/services/company-profile.service';
import { completeForm, numberOfSteps } from '../complete/form';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss'],
})
export class CompanyDetailsComponent implements OnInit {
  step!: any;
  length!: number;
  companyForm!: UntypedFormGroup;
  date: any;

  constructor(
    private profileComplete: CompanyProfileService,
    private formProvider: FormProvider
  ) {
    this.date = new Date()
  }

  ngOnInit(): void {
    this.step = completeForm.companyDetails;
    this.length = numberOfSteps();
    this.companyForm = this.formProvider
      .getForm()
      .get(this.step.title) as UntypedFormGroup;
  }



  get controls(): any {
    return this.companyForm.controls;
  }
  onSubmit() {
    if (this.companyForm.invalid) return;
    this.profileComplete.stepNumber.next(2);
  }
}
