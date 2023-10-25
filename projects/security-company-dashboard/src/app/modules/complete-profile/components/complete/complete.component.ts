import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { convertConfigurationsToArray, completeForm } from './form';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { CompanyProfileService } from './../../../jobs/services/company-profile.service';
import { FormProvider } from '../../../auth/models/form-provider';
import { Lookup, OptionSetService } from 'projects/tools/src/public-api';
import { LookupService } from './../../../../../../../tools/src/lib/services/lookups.service';
import { min } from 'rxjs';
@Component({
  selector: 'app-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss'],
  providers: [{ provide: FormProvider, useClass: CompleteComponent }],
})
export class CompleteComponent
  extends FormProvider
  implements OnInit, OnDestroy {
  stepIndex: number = 1;
  completeForm!: UntypedFormGroup;
  FormConfig = convertConfigurationsToArray(completeForm);
  optionSetItems!: any;
  optionSetItemsComissioner!: any;
  identity!: any;
  nationalities!: Lookup[];
  date: any
  constructor(
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private Auth: AuthService,
    private profileComplete: CompanyProfileService,
    private optionSet: OptionSetService,
    private lookup: LookupService
  ) {
    super();
    this.date = new Date()
    var day = String(this.date.getDate()).padStart(2, '0');
    var month = String(this.date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var year = this.date.getFullYear();

    this.date = year + '-' + month + '-' + day;
    this.identity = [
      { name: 'وطنية', nameEn: 'patriotism' },
      { name: 'إقامة', nameEn: 'Accommodation' },
    ];
    this.generateForm();
  }

  ngOnInit(): void {
    this.profileComplete.stepNumber.next(1);
    this.getStepNumber();
    this.getHolderResponsibilities();
    this.getNationalities();
    this.getcomissionerResponsibilities();
  }
  getForm(): UntypedFormGroup {
    return this.completeForm;
  }
  getHolderResponsibilities() {
    this.optionSet
      .getOptionSetByName('holderresponsability')
      .subscribe((res) => {
        this.optionSetItems = res.optionSetItems;
      });
  }
  getcomissionerResponsibilities() {
    this.optionSet
      .getOptionSetByName('Comissionerresponsability')
      .subscribe((res) => {
        this.optionSetItemsComissioner = res.optionSetItems;
      });
  }
  getNationalities() {
    this.lookup.getNationality().subscribe((res) => {
      this.nationalities = res;
    });
  }

  generateForm() {
    const numbers = /^[0-9]{10}$/;
    const email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    const fullNamePattern =
      /^([a-zA-Z]+\s?)+$|^([\u0600-\u06FF]+\s?)+$/;
    this.completeForm = this.fb.group({
      company_details: this.fb.group({
        securityCompanyId: this.Auth.snapshot.userInfo?.id,
        commercialRegisterNumber: [
          null,
          [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
        ],
        commercialRegisterStartDate: [null, [Validators.required]],
        commercialRegisterEndDate: [null, [Validators.required]],
        securityLicenseNumber: [
          null,
          [Validators.required, Validators.pattern(numbers)],
        ],
        securityLicenseStartDate: [null, [Validators.required]],
        securityLicenseEndDate: [null, [Validators.required]],
        postalCode: [null, [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
        mainBranshCity: [null, [Validators.required]],
        district: [null, [Validators.required]],
        street: [null, [Validators.required]],
        email: [null, [Validators.required, Validators.pattern(email)]],
      }),

      company_representative: this.fb.group({
        holderFullName: [
          null,
          [Validators.required, Validators.pattern(fullNamePattern)],
        ],
        holderEmail: [null, [Validators.required, Validators.pattern(email)]],
        holderIdentityType: [null, Validators.required],
        holderPhoneNumber: [null, Validators.required],
        holderNationality: [null, Validators.required],
        holderResponsablity: [null, Validators.required],
      }),
      commissioner_representative: this.fb.group({
        commissionerIdentity: [null, Validators.required],
        commissionerNationality: [null, Validators.required],
        commissionerFullName: [
          null,
          [Validators.required, Validators.pattern(fullNamePattern)],
        ],
        commissionerEmail: [null, [Validators.required, Validators.pattern(email)]],
        commissionerPhoneNumber: [null, Validators.required],
        commissionerResponsap: [null, Validators.required],
      }),
    });
  }

  getStepNumber() {
    this.profileComplete.stepNumber.subscribe((res) => {
      this.stepIndex = res;
    });
  }
  ngOnDestroy(): void {
    this.profileComplete.stepNumber.next(0);
  }
}
