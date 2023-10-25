import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import {
  AcceptedFile,
  AcceptedImage,
  AttachmentService,
  convertDateToString,
  LangService,
  language,
  ModalService,
} from 'projects/tools/src/public-api';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ImageService } from '../../../auth/services/image.service';
import { GuardsService } from '../../services/guards.service';
import { Routing } from '../../routes/app-routes';

@Component({
  selector: 'app-add-new-data',
  templateUrl: './add-new-data.component.html',
  styleUrls: ['./add-new-data.component.scss']
})
export class AddNewDataComponent implements OnInit {
  constructor(
    public lang: LangService,
    private auth: AuthService,
    private router: Router,
    private attachment: AttachmentService,
    private _ImageService: ImageService,
    private fb: FormBuilder,
    private localeService: BsLocaleService,
    private _GuardsService: GuardsService,
    private model: ModalService
  ) { }
  addNewData!: FormGroup
  maxDate!: Date
  minDate!: Date
  date!: Date
  image!: string | null
  successAlert = 'successAlert'
  ngOnInit(): void {
    this.date = new Date()
    this.generateForm()
  }
  generateForm() {
    this.addNewData = this.fb.group({
      commercialRegisterNumber: [null, [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      licenseNumber: [
        null,
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      licenseEndDate: [null, [Validators.required]],
      licenseImageId: [null, Validators.required],
    })
  }
  get controls(): any {
    return this.addNewData.controls;
  }
  initDatePiker() {
    this.maxDate = new Date();
    this.minDate = new Date(1960, 0, 1);
    defineLocale('ar', arLocale);
    defineLocale('en', enGbLocale);
    this.lang.language.subscribe((res) => {
      res === language.ar
        ? this.localeService.use('ar')
        : this.localeService.use('en');
    });
  }
  onImageUpload(event: any) {
    let arr = event.target.files[0].name.split('.');
    const extension = arr[arr.length - 1].toLowerCase();
    if (!AcceptedImage.includes(extension)) {
      (this.controls['licenseImageId'] as FormControl).setErrors({
        notValid: true,
      });
      this.image = null;
      return;
    } else {
      let url = URL.createObjectURL(event.target.files[0]);
      (this.controls['licenseImageId'] as FormControl).setErrors({
        notValid: null,
      });

      this.attachment
        .uploadFile(event.target.files[0].name, event.target.files[0])
        .subscribe((res) => {
          this.image = url;


          this._ImageService.licenseImage.next(this.image);
          this.controls['licenseImageId'].setValue(res);
        });
    }
  }
  onSubmit(data: FormGroup) {
    let allData = this.auth.userInfo.getValue()
    if (data.invalid) return;
    if (allData?.id) {
      this._GuardsService.SecurityCompanyLicenseUpdates(data.value, allData?.id).subscribe((res: any) => {
        if (res?.id) {
          this.model.open(this.successAlert)
        }
      })
    }
  }
  continue() {
    this.model.close(this.successAlert)
    this.router.navigate([`/${Routing.dashboard}`])
  }
}