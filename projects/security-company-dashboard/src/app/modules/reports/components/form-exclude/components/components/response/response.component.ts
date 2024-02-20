import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../../../../../services/reports.service';
import { viLocale } from 'ngx-bootstrap/chronos';
import { Router } from '@angular/router';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss'],
})
export class ResponseComponent implements OnInit, OnDestroy {
  checkboxForm: FormGroup;
  submitted = false;
  options = ['مناسب', 'غير مناسب'];
  activeLink: string =
    '/dashboard/reports/form-exclude/exclude-new-request/accreditation';

  constructor(
    private fb: FormBuilder,
    private form3: ReportsService,
    private router: Router
  ) {
    this.checkboxForm = this.fb.group({
      inappropriateReason: ['', Validators.required],
      responserName: [null, Validators.required],
      responseSignature: [null, Validators.required],
      response: [null, Validators.required],
    });
  }

  get controls(): any {
    return this.checkboxForm.controls;
  }
  ngOnInit(): void {
    // this.form3.screenRoute.next('/dashboard/reports/form-exclude/exclude-new-request/response')
  }
  ngOnDestroy() {
    // this.form3.screenRoute.next('/dashboard/reports/form-exclude/exclude-new-request/transfer-reason')
  }
  onSubmit(): void {
    this.submitted = true;
    if (this.checkboxForm.valid) {
      const formData = this.checkboxForm.value;
      this.form3.setFormData(formData);
      this.router.navigate([this.activeLink]);
      // this.form3.screenRoute.next(this.activeLink)
    }
  }
}
