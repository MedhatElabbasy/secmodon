import { Component, Input, OnInit } from '@angular/core';
import { FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {
  CountryCode,
  LangService,
  language,
} from 'projects/tools/src/public-api';
import { FormProvider } from '../../../auth/models/form-provider';
import { CompanyProfileService } from '../../../jobs/services/company-profile.service';
import { completeForm, numberOfSteps } from '../complete/form';
import { Lookup } from '../../../lookups/model/lookup';
import { LookupService } from './../../../../../../../tools/src/lib/services/lookups.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-company-representative',
  templateUrl: './company-representative.component.html',
  styleUrls: ['./company-representative.component.scss'],
})
export class CompanyRepresentativeComponent implements OnInit {
  @Input() optionSetItems!: any;
  @Input() identity!: any;
  @Input() nationalities!: Lookup[];
  codes!: any[];
  code = new FormControl(null, [Validators.required]);
  step!: any;
  length!: number;
  isAr!: boolean;

  companyRepresesentativeForm!: UntypedFormGroup;
  constructor(
    private profileComplete: CompanyProfileService,
    private formProvider: FormProvider,
    private lookup: LookupService,
    private route: ActivatedRoute,
    public lang: LangService
  ) {
    this.checkLang();
    this.onCodeChange();
  }

  get MobileNumber(): any {
    return this.companyRepresesentativeForm.get('holderPhoneNumber');
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
    this.step = completeForm.companyRepresentative;
    this.length = numberOfSteps();
    this.companyRepresesentativeForm = this.formProvider
      .getForm()
      .get(this.step.title) as UntypedFormGroup;
  }
  get controls(): any {
    return this.companyRepresesentativeForm.controls;
  }
  getData() {
    if (this.controls['holderIdentityType'].value == 'وطنية') {
      let id;
      this.nationalities.find((ele) => {
        if (ele.name == 'السعودية') {
          this.controls['holderNationality'].setValue(ele.name)
        }
      })
    } else {
      this.nationalities = this.nationalities.filter(item => item.name != 'السعودية')
    }
  }
  onSubmit() {
    if (this.controls['holderIdentityType'].value == 'وطنية') {
      this.nationalities.find((ele) => {
        if (ele.name == 'السعودية') {
          this.controls['holderNationality'].setValue(ele.name)
        }
      })
    }
    if (this.companyRepresesentativeForm.invalid) return;
    let model: any = this.companyRepresesentativeForm.value;
    let prefixCode = this.code.value;
    let number: string = model.holderPhoneNumber;

    let phoneCountry: CountryCode = this.codes.find(
      (e: CountryCode) => e.prefixCode == prefixCode
    );
    if (number.toString().startsWith('0')) {
      number = number.substring(1);
    }
    if (!model.holderPhoneNumber.toString().startsWith(phoneCountry.prefixCode)) {
      model.holderPhoneNumber = phoneCountry.prefixCode + number;
      this.controls['holderPhoneNumber'].value = model.holderPhoneNumber
    }
    this.profileComplete.stepNumber.next(3);
  }
  previous() {
    this.profileComplete.stepNumber.next(1);
  }
}
