import { Component, Input, OnInit } from '@angular/core';
import { FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CountryCode,
  LangService,
  language,
  LookupService,
  ModalService,
} from 'projects/tools/src/public-api';
import { FormProvider } from '../../../auth/models/form-provider';
import { CompanyProfileService } from '../../../jobs/services/company-profile.service';
import { JobService } from '../../../jobs/services/job.service';
import { Lookup } from '../../../lookups/model/lookup';
import { completeForm, numberOfSteps } from '../complete/form';
import { Routing } from './../../../core/routes/app-routes';

@Component({
  selector: 'app-commissioner-representative',
  templateUrl: './commissioner-representative.component.html',
  styleUrls: ['./commissioner-representative.component.scss'],
})
export class CommissionerRepresentativeComponent implements OnInit {
  @Input() optionSetItems!: any;
  @Input() identity!: any;
  @Input() nationalities!: Lookup[];
  codes!: any[];
  code = new FormControl(null, [Validators.required]);
  step!: any;
  length!: number;
  isAr!: boolean;
  modalId = 'done';
  routing = Routing;
  CommissionerRepresentativeForm!: UntypedFormGroup;
  constructor(
    private profileComplete: CompanyProfileService,
    private formProvider: FormProvider,
    private JobService: JobService,
    private lookup: LookupService,
    private router: Router,
    public lang: LangService,
    private modal: ModalService
  ) {
    this.checkLang();
    this.onCodeChange();
  }

  get MobileNumber(): any {
    return this.CommissionerRepresentativeForm.get('commissionerPhoneNumber');
  }
  onCodeChange() {
    this.code.valueChanges.subscribe((res) => {
      let code: CountryCode = this.codes.find(
        (e: CountryCode) => e.prefixCode == res
      );
      this.MobileNumber.clearValidators();
      this.MobileNumber.updateValueAndValidity();

      this.MobileNumber.addValidators([
        Validators.pattern(code.regex),
        Validators.required,
      ]);
      this.MobileNumber.updateValueAndValidity();
    });
  }

  getInitData() {
    this.lookup.getCountriesCodes().subscribe((res: any) => {
      this.codes = res;
      let defaultCountry = this.codes.find((element: CountryCode) => {
        return element.ioS2 === '+966';
      });
      this.code.setValue(defaultCountry.prefixCode);
    });
  }
  checkLang() {
    this.lang.language.subscribe((res) => {
      this.isAr = res == language.ar ? true : false;
    });
  }
  ngOnInit(): void {
    this.getInitData();
    this.step = completeForm.commissionerRepresentative;
    this.length = numberOfSteps();
    this.CommissionerRepresentativeForm = this.formProvider
      .getForm()
      .get(this.step.title) as UntypedFormGroup;
  }
  get controls(): any {
    return this.CommissionerRepresentativeForm.controls;
  }
  getData() {
    if (this.controls['commissionerIdentity'].value == 'وطنية') {
      let id;
      this.nationalities.find((ele) => {
        if (ele.name == 'السعودية') {
          this.controls['commissionerNationality'].setValue(ele.name)
        }
      })

    } else {

      this.nationalities = this.nationalities.filter(item => item.name != 'السعودية')
    }
  }
  onSubmit() {
    if (this.controls['commissionerIdentity'].value == 'وطنية') {
      this.nationalities.find((ele) => {
        if (ele.name == 'السعودية') {
          this.controls['commissionerNationality'].setValue(ele.name)
        }
      })
    }
    if (this.CommissionerRepresentativeForm.invalid) return;
    let model: any = this.CommissionerRepresentativeForm.value;
    let prefixCode = this.code.value;
    let number: string = model.commissionerPhoneNumber;

    let phoneCountry: CountryCode = this.codes.find(
      (e: CountryCode) => e.prefixCode == prefixCode
    );

    if (number.toString().startsWith('0')) {
      number = number.substring(1);
    }
    if (!model.commissionerPhoneNumber.toString().startsWith(phoneCountry.prefixCode)) {
      model.commissionerPhoneNumber = phoneCountry.prefixCode + number;
    }
    let companyDetails = this.formProvider
      .getForm()
      .get(completeForm.companyDetails.title) as UntypedFormGroup;
    let companyRepresentative = this.formProvider
      .getForm()
      .get(completeForm.companyRepresentative.title) as UntypedFormGroup;
    let data = {
      ...companyDetails.value,
      ...companyRepresentative.value,
      ...model
    };
    this.profileComplete.completeCompany(data).subscribe((res: any) => {
      if (res.id) {
        let jobData = this.JobService.job.getValue()
        jobData.securityCompanyId=companyDetails.value.securityCompanyId
        this.JobService.add(jobData).subscribe((res2) => {
          this.modal.open(this.modalId);
        })
      }
    });
  }
  goToJobs() {
    this.modal.close(this.modalId);
    this.router.navigate([
      `/${this.routing.dashboard}/${this.routing.jobs.module}/${this.routing.jobs.children.jobsGrid}`,
    ]);
  }
  previous() {
    this.profileComplete.stepNumber.next(2);
  }
}
