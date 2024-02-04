import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ReportsService } from '../../../../../services/reports.service';
import { Router } from '@angular/router';
import { AcceptedFile, AttachmentService } from 'projects/tools/src/public-api';
import { DomSanitizer } from '@angular/platform-browser';
import { log } from 'console';
import { LogLevel } from '@microsoft/signalr';

@Component({
  selector: 'app-transfer-reason',
  templateUrl: './transfer-reason.component.html',
  styleUrls: ['./transfer-reason.component.scss'],
})
export class TransferReasonComponent implements OnInit ,OnDestroy{
  checkboxForm: FormGroup;
  options = [{ name: 'غياب', id: 1 }, { name: 'حالة مخلة بالأنظمة', id: 2 }, { name: 'عدم تنفيذ التعليمات', id: 3 }, { name: 'أخرى', id: 4 }];
  activeLink: string =
    '/dashboard/reports/form-exclude/exclude-new-request/response';

  profileImage!: string | null;

  constructor(
    private fb: FormBuilder,
    private form2: ReportsService,
    private router: Router,
    public _reports: ReportsService,
    private domSanitizer: DomSanitizer,
    private attachment: AttachmentService
  ) {
    this.checkboxForm = this.fb.group({
      reasonStatusType: ['', Validators.required],
      securityOfficial: [null, Validators.required],
      securityOfficialSignature: [null, Validators.required],
      contractorProjectManager: [null, Validators.required],
      contractorProjectManagerSignature: [null, Validators.required],
      reasonForTransfer: [null, Validators.required],
      attachmentId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this._reports.screenRoute.next('/dashboard/reports/form-exclude/exclude-new-request/transfer-reason')
  }
  ngOnDestroy() {
    this._reports.screenRoute.next('/dashboard/reports/form-exclude/exclude-new-request/employee-general-info')

  }
  get photosControls(): any {
    return this.checkboxForm.controls;
  }
  onImageUpload(event: any) {
    let arr = event?.target?.files[0]?.name.split('.');
    const extension = arr[arr.length - 1].toLowerCase();

    if (!AcceptedFile.includes(extension)) {
      (this.photosControls['attachmentId'] as FormControl).setErrors({
        notValid: true,
      });
      this.profileImage = null;
      return;
    } else {
      let url = URL.createObjectURL(event.target.files[0]);

      (this.photosControls['attachmentId'] as FormControl).setErrors({
        notValid: null,
      });

      this.attachment
        .uploadFile(event.target.files[0].name, event.target.files[0])
        .subscribe((res) => {
          this.profileImage = url;
          this.photosControls['attachmentId'].setValue(res);
        });
    }
  }

  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }
  onSubmit(): void {
    if (this.checkboxForm.valid) {
      const formData = this.checkboxForm.value;
      this.form2.setFormData(formData);
      console.log(formData);
      this.router.navigate([this.activeLink]);
      this._reports.screenRoute.next(this.activeLink)
    }
  }
}
