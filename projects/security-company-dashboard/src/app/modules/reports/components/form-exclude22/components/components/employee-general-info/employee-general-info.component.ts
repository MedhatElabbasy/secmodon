import { ReportsService } from './../../../../../services/reports.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { SelectItem } from 'primeng/api';
import { AuthService } from 'projects/security-company-dashboard/src/app/modules/auth/services/auth.service';
import { LangService, convertDateToString, language } from 'projects/tools/src/public-api';

@Component({
  selector: 'app-employee-general-info',
  templateUrl: './employee-general-info.component.html',
  styleUrls: ['./employee-general-info.component.scss'],
})
export class EmployeeGeneralInfoComponent implements OnInit {
  createDate = new FormControl(new Date());
  maxDate = new Date();
  jobTypeName!: any;
  guardId!: any;
  securitycompanyName!: any;
  checkboxForm: FormGroup;
  selectedGuard!: any;
  options = [
    'مراقب أمن',
    'مشرف عام',
    'مشرف فترة',
    'مساعد مشرف فترة',
    'منسق إدارى',
  ];
  activeLink: string =
    '/dashboard/reports/form-exclude/exclude-new-request/transfer-reason';
  Guards!: any;
  constructor(
    private fb: FormBuilder,
    private form1: ReportsService,
    private router: Router,
    private auth: AuthService,
    public lang: LangService,
    public _reports: ReportsService,
    private localeService: BsLocaleService
  ) {
    this.getguardInfo();
    this.initDatePiker();
    this.checkboxForm = this.fb.group({
      securityGuardId: [null, Validators.required],
      securityCompanyId: [null, Validators.required],
      createDate: [null, Validators.required]
      //securitycompanyName: [null, Validators.required],
      //jobTypeName: ['', Validators.required],
    });
  }

  get controls(): any {
    return this.checkboxForm.controls;
  }

  ngOnInit(): void {
    this._reports.screenRoute.next('/dashboard/reports/form-exclude/exclude-new-request/employee-general-info')
    this.createDate.setValue(null);
  }

  initDatePiker() {
    defineLocale('ar', arLocale);
    defineLocale('en', enGbLocale);
    this.lang.language.subscribe((res) => {
      res === language.ar
        ? this.localeService.use('ar')
        : this.localeService.use('en');
    });
  }

  getguardInfo() {
    this.form1.GetAllCompanySecurityGuardWithJop().subscribe((res) => {
      this.Guards = res;
      console.log(res);

    })
  }

  getguardDetails(event: any) {
    const selectedIndex: number = event.target.value;
    const selectedGuard: any = this.Guards[selectedIndex];
    this.jobTypeName = selectedGuard.jobTypeDTO.name;
    this.guardId = selectedGuard.id
    this.securitycompanyName = selectedGuard.securityCompanyName;
    console.log(selectedGuard);
    let securityCompanyId = this.auth.snapshot.userInfo?.id;
    this.checkboxForm.controls['securityGuardId'].setValue(selectedGuard.id);
    // this.checkboxForm.controls['securityOfficial'].setValue(selectedGuard.securityCompanyName);
    // this.checkboxForm.controls['jobTypeName'].setValue(selectedGuard.jobTypeDTO.name);
    this.checkboxForm.controls['securityCompanyId'].setValue(securityCompanyId);
  }

  onSubmit(): void {
    console.log(this.checkboxForm);
    let date = convertDateToString(this.createDate.value);
    this.checkboxForm.controls['createDate'].setValue(date)
    if (this.checkboxForm.valid) {
      const formData = this.checkboxForm.value;
      this.form1.setFormData(formData);
      console.log(formData);
      this.router.navigate([this.activeLink]);
      this._reports.screenRoute.next(this.activeLink)
    }
  }
}
