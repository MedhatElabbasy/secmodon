import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOtpInputComponent } from 'ng-otp-input';
import { environment } from 'projects/security-company-dashboard/src/environments/environment.staging';
import {
  CryptoService,
  ModalService,
  OtpModel,
  ValidateModel,
} from 'projects/tools/src/public-api';
import { Routing } from '../../../core/routes/app-routes';
import { NotifyService } from '../../../core/services/notify.service';
import { itemsName } from '../../../packages/enum/items';
import { NotificationType } from '../../../packages/enum/notificationTypes';
import { items } from '../../../packages/model/items';
import { PackagesService } from '../../../packages/services/packages.service';
import { AuthOperations } from '../../enums/auth-operations.enum';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
})
export class OtpComponent implements OnInit {
  @ViewChild(NgOtpInputComponent, { static: false })
  ngOtpInput!: NgOtpInputComponent;
  @ViewChild('form') form!: FormGroupDirective;
  myPackage: items = {
    numOfGuards: 0,
    attendance: 0,
    liveTracking: 0,
    reports: 0,
    branches: 0,
    numOfUsers: 0,
    ReceivingOffersFromClients: 0,
    numberOfJobsOffered: 0,
    numberOfEmploymentContracts: 0,
    technicalSupport: 0,
  };
  itemsName = itemsName;
  loginModel!: OtpModel;
  otpForm!: FormGroup;
  otpConfig = {
    allowNumbersOnly: true,
    length: 6,
  };
  message!: string;
  modalID = 'otp-modal';
  validationModal = 'validation-modal';
  isRegister!: boolean;

  get code(): FormControl | any {
    return this.otpForm.controls['code'];
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private crypto: CryptoService,
    private notify: NotifyService,
    private PackagesService: PackagesService,
    private modal: ModalService
  ) {
    this.otpForm = this.fb.group({
      code: [
        null,
        [Validators.required, Validators.maxLength(6), Validators.minLength(6)],
      ],
    });
  }

  ngOnInit(): void {
    this.getInitData();
  }

  getInitData() {
    this.route.params.subscribe((params) => {
      this.loginModel = JSON.parse(this.crypto.decrypt(params['phone']));
      this.isRegister = params['type'] == AuthOperations.register;
    });
  }

  onSubmit() {
    if (this.otpForm.invalid) return;

    let model: ValidateModel = {
      mobileNumber: this.loginModel.mobileNumber,
      register: this.isRegister,
      otp: this.otpForm.value.code,
    };

    this.auth.validate(model).subscribe(
      (res) => {
        let url = '';
        let role = this.auth.snapshot.userIdentity?.role!;

        if (this.route.snapshot.data['allowedRoles'].includes(role)) {
          if (this.isRegister) {
            url = `/${Routing.auth.module}/${Routing.auth.children.register}`;
          } else {
            if (res.isProfileComplete) {
              url = `/${Routing.dashboard}/${Routing.statics}`;
              this.auth.getSecurityCompany().subscribe((res) => {
          
                
                if (res.id) {
                  this.auth.checkEnroll(res.id).subscribe((res2) => {
                    if (res2.status == 204) {
                      this.auth.packages.next(false);
                      const link = `/${Routing.dashboard}/${Routing.packages.module}/${Routing.packages.children.packages}`;
                      this.router.navigate([link]);
                      return;
                    } else {
                      let data: any = res2.body;
                      let packageDetails =
                        data.companyPackage.package.packageDetails;
                    
                        
                      for (let i = 0; i < packageDetails.length; i++) {
                        let check = packageDetails[i];
                        if (check.packageItems.keysEnable == itemsName.numOfGuards) {
                          this.myPackage.numOfGuards = Number(check.limit);
                        } else if (check.packageItems.keysEnable == itemsName.attendance) {
                          this.myPackage.attendance = Number(check.limit);
                        } else if (check.packageItems.keysEnable == itemsName.liveTracking) {
                          this.myPackage.liveTracking = Number(check.limit);
                        } else if (check.packageItems.keysEnable == itemsName.reports) {
                          this.myPackage.reports = Number(check.limit);
                        } else if (check.packageItems.keysEnable == itemsName.branches) {
                          this.myPackage.branches = Number(check.limit);
                        } else if (check.packageItems.keysEnable == itemsName.numOfUsers) {
                          this.myPackage.numOfUsers = Number(check.limit);
                        } else if (
                          check.packageItems.keysEnable == itemsName.technicalSupport
                        ) {
                          this.myPackage.technicalSupport = Number(check.limit);
                        } else if (
                          check.packageItems.keysEnable ==
                          itemsName.ReceivingOffersFromClients
                        ) {
                          this.myPackage.ReceivingOffersFromClients = Number(
                            check.limit
                          );
                        } else if (
                          check.packageItems.keysEnable == itemsName.numberOfJobsOffered
                        ) {  
                          this.myPackage.numberOfJobsOffered = Number(
                            check.limit
                          );
                        } else if (
                          check.packageItems.keysEnable ==
                          itemsName.numberOfEmploymentContracts
                        ) {
                          this.myPackage.numberOfEmploymentContracts = Number(
                            check.limit
                          );
                        }
                      }
                      this.PackagesService.myPackage.next(this.myPackage);
                      let day = data.end.split('-')[1];
                      let month = data.end.split('-')[0];
                      let year = data.end.split('-')[2];
                      let date_1 = new Date(`${day}-${month}-${year}`);
                      let date_2 = new Date();
                      let difference = date_1.getTime() - date_2.getTime();
                      let TotalDays = Math.ceil(
                        difference / (1000 * 3600 * 24)
                      );
                      let days = TotalDays;
                      if (days <= 5) {
                        let model = {
                          titile: `الأشتراك سوف ينتهي يوم ${
                            date_1.toISOString().split('T')[0]
                          } `,
                          titileEn: `package will end in day ${
                            date_1.toISOString().split('T')[0]
                          }`,
                          description:
                            'يجب تجديد الباقة حتى يمكنك استكمال استخدام الخدمة',
                          descriptionEn:
                            'The package must be renewed in order to continue using the service ',
                          securityCompanyId: res.id,
                          isForTakidAdmin: true,
                          notificationType: NotificationType.expiredPackage,
                        };
                        this.notify.addNotification(model).subscribe();
                      }
                    }
                  });
                }
              });
            } else {
              url = `/${Routing.auth.module}/${Routing.auth.children.register}`;
            }
          }

          this.router.navigate([url]);
        } else {
          this.modal.open(this.validationModal);
        }
      },
      (err) => {
        this.message = err.message;
        this.modal.open(this.modalID);
      }
    );
  }

  resendOtp() {
    this.form.resetForm();
    this.ngOtpInput.setValue(null);
    this.loginModel.register = false;
    this.isRegister = false;
    this.auth.generateOTP(this.loginModel).subscribe(() => {});
  }

  backToApp() {
    this.auth.logout();
    window.location.replace(environment.appLink);
  }
}
