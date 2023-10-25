import { Package } from './../../model/package';
import { Component, OnInit, enableProdMode } from '@angular/core';
import { PackagesService } from './../../services/packages.service';
import {
  LangService,
  language,
  ModalService,
} from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { Routing } from '../../../core/routes/app-routes';
import { Router } from '@angular/router';
import { items } from '../../model/items';
import { itemsName } from '../../enum/items';
declare var $: any;
@Component({
  selector: 'app-package-subscribe',
  templateUrl: './package-subscribe.component.html',
  styleUrls: ['./package-subscribe.component.scss'],
})
export class PackageSubscribeComponent implements OnInit {
  packages!: Package[];
  isAr!: Boolean;
  successAlert = 'successAlert';
  display = 'display';
  display2 = 'display2';
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
  constructor(
    private auth: AuthService,
    private PackagesService: PackagesService,
    public lang: LangService,
    private modal: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkLang();
    this.getPackages();
    let securityCompanyId = this.auth.snapshot.userInfo?.id;
    if (securityCompanyId) {
      this.auth.checkEnroll(securityCompanyId).subscribe((res) => {
        if (res.status == 200) {
          this.modal.open(this.display);
        }
      });
    }
  }
  checkLang() {
    this.lang.language.subscribe((res) => {
      this.isAr = res == language.ar ? true : false;
    });
  }
  changeColor(event: any) {
    let id = event.target.id;
    if (id == 'monthly') {
      $(`#${id}`).removeClass('bgColor2').addClass('bgColor1');
      $('#yearly').removeClass('bgColor1').addClass('bgColor2');
    } else {
      $('#monthly').removeClass('bgColor1').addClass('bgColor2');
      $(`#${id}`).removeClass('bgColor2').addClass('bgColor1');
    }
  }
  getPackages() {
    this.PackagesService.getAll().subscribe((res) => {
      this.packages = res;
    });
  }
  addPackage(Package: Package) {
    let securityCompanyId = this.auth.snapshot.userInfo?.id;
    let packageId = Package.id;
    let model1 = {
      securityCompanyId,
      packageId,
    };
    if (model1.securityCompanyId) {
      this.PackagesService.getLastPackage(model1.securityCompanyId).subscribe(
        (res: any) => {
          if (res != null) {
            let lastPackage = res.package.packageTotalCost;
            let newPackage = Package.packageTotalCost;
            if (newPackage >= lastPackage) {
              this.PackagesService.AddCompanyPackage(model1).subscribe(
                (res) => {
                  let companyPackageId = res.id;
                  if (companyPackageId) {
                    let dateToday = new Date();
                    let start =
                      dateToday.getMonth() +
                      1 +
                      '-' +
                      dateToday.getDate() +
                      '-' +
                      dateToday.getFullYear();
                    let newDate = new Date(
                      dateToday.setMonth(dateToday.getMonth() + 1)
                    );
                    let end =
                      newDate.getMonth() +
                      1 +
                      '-' +
                      newDate.getDate() +
                      '-' +
                      newDate.getFullYear();
                    let model2 = {
                      companyPackageId,
                      start,
                      end,
                      securityCompanyId: model1.securityCompanyId,
                      packageId: model1.packageId,
                    };
                    this.PackagesService.enrollPackage(model2).subscribe(
                      (res2) => {
                        if (res2.id) {
                          window.open(
                            res2.url,
                            '_blank',
                            'noopener, noreferrer'
                          );
                          this.auth.packages.next(true);
                          let securityCompanyId =
                            this.auth.snapshot.userInfo?.id;
                          if (securityCompanyId) {
                            this.auth
                              .checkEnroll(securityCompanyId)
                              .subscribe((res3) => {
                                if (res3.status == 200) {
                                  let data: any = res3.body;
                                  let packageDetails =
                                    data.companyPackage.package.packageDetails;
                                  for (
                                    let i = 0;
                                    i < packageDetails.length;
                                    i++
                                  ) {
                                    let check = packageDetails[i].packageItems;

                                    if (
                                      check.keysEnable == itemsName.numOfGuards
                                    ) {
                                      this.myPackage.numOfGuards = Number(
                                        packageDetails[i].limit
                                      );
                                    } else if (
                                      check.keysEnable == itemsName.attendance
                                    ) {
                                      this.myPackage.attendance = Number(
                                        packageDetails[i].limit
                                      );
                                    } else if (
                                      check.keysEnable == itemsName.liveTracking
                                    ) {
                                      this.myPackage.liveTracking = Number(
                                        packageDetails[i].limit
                                      );
                                    } else if (
                                      check.keysEnable == itemsName.reports
                                    ) {
                                      this.myPackage.reports = Number(
                                        packageDetails[i].limit
                                      );
                                    } else if (
                                      check.keysEnable == itemsName.branches
                                    ) {
                                      this.myPackage.branches = Number(
                                        packageDetails[i].limit
                                      );
                                    } else if (
                                      check.keysEnable == itemsName.numOfUsers
                                    ) {
                                      this.myPackage.numOfUsers = Number(
                                        packageDetails[i].limit
                                      );
                                    } else if (
                                      check.keysEnable ==
                                      itemsName.technicalSupport
                                    ) {
                                      this.myPackage.technicalSupport = Number(
                                        packageDetails[i].limit
                                      );
                                    } else if (
                                      check.keysEnable ==
                                      itemsName.ReceivingOffersFromClients
                                    ) {
                                      this.myPackage.ReceivingOffersFromClients =
                                        Number(packageDetails[i].limit);
                                    } else if (
                                      check.keysEnable ==
                                      itemsName.numberOfJobsOffered
                                    ) {
                                      this.myPackage.numberOfJobsOffered =
                                        Number(packageDetails[i].limit);
                                    } else if (
                                      check.keysEnable ==
                                      itemsName.numberOfEmploymentContracts
                                    ) {
                                      this.myPackage.numberOfEmploymentContracts =
                                        Number(packageDetails[i].limit);
                                    }
                                  }
                                  this.PackagesService.myPackage.next(
                                    this.myPackage
                                  );
                                }
                              });
                          }
                          console.log(res2.url);

                          //  this.modal.open(this.successAlert);
                        }
                      }
                    );
                  }
                }
              );
            } else {
              this.modal.open(this.display2);
            }
          } else {
            this.PackagesService.AddCompanyPackage(model1).subscribe((res) => {
              let companyPackageId = res.id;
              if (companyPackageId) {
                let dateToday = new Date();
                let start =
                  dateToday.getMonth() +
                  1 +
                  '-' +
                  dateToday.getDate() +
                  '-' +
                  dateToday.getFullYear();
                let newDate = new Date(
                  dateToday.setMonth(dateToday.getMonth() + 1)
                );
                let end =
                  newDate.getMonth() +
                  1 +
                  '-' +
                  newDate.getDate() +
                  '-' +
                  newDate.getFullYear();
                let model2 = {
                  companyPackageId,
                  start,
                  end,
                  securityCompanyId: model1.securityCompanyId,
                  packageId: model1.packageId,
                };
                this.PackagesService.enrollPackage(model2).subscribe((res2) => {
                  if (res2.id) {
                    window.open(res2.url, '_blank', 'noopener, noreferrer');
                    this.auth.packages.next(true);
                    let securityCompanyId = this.auth.snapshot.userInfo?.id;
                    if (securityCompanyId) {
                      this.auth
                        .checkEnroll(securityCompanyId)
                        .subscribe((res3) => {
                          if (res3.status == 200) {
                            let data: any = res3.body;
                            let packageDetails =
                              data.companyPackage.package.packageDetails;
                            for (let i = 0; i < packageDetails.length; i++) {
                              let check = packageDetails[i].packageItems;
                              if (check.keysEnable == itemsName.numOfGuards) {
                                this.myPackage.numOfGuards = Number(
                                  packageDetails[i].limit
                                );
                              } else if (
                                check.keysEnable == itemsName.attendance
                              ) {
                                this.myPackage.attendance = Number(
                                  packageDetails[i].limit
                                );
                              } else if (
                                check.keysEnable == itemsName.liveTracking
                              ) {
                                this.myPackage.liveTracking = Number(
                                  packageDetails[i].limit
                                );
                              } else if (
                                check.keysEnable == itemsName.reports
                              ) {
                                this.myPackage.reports = Number(
                                  packageDetails[i].limit
                                );
                              } else if (
                                check.keysEnable == itemsName.branches
                              ) {
                                this.myPackage.branches = Number(
                                  packageDetails[i].limit
                                );
                              } else if (
                                check.keysEnable == itemsName.numOfUsers
                              ) {
                                this.myPackage.numOfUsers = Number(
                                  packageDetails[i].limit
                                );
                              } else if (
                                check.keysEnable == itemsName.technicalSupport
                              ) {
                                this.myPackage.technicalSupport = Number(
                                  packageDetails[i].limit
                                );
                              } else if (
                                check.keysEnable ==
                                itemsName.ReceivingOffersFromClients
                              ) {
                                this.myPackage.ReceivingOffersFromClients =
                                  Number(packageDetails[i].limit);
                              } else if (
                                check.keysEnable ==
                                itemsName.numberOfJobsOffered
                              ) {
                                this.myPackage.numberOfJobsOffered = Number(
                                  packageDetails[i].limit
                                );
                              } else if (
                                check.keysEnable ==
                                itemsName.numberOfEmploymentContracts
                              ) {
                                this.myPackage.numberOfEmploymentContracts =
                                  Number(packageDetails[i].limit);
                              }
                            }
                            this.PackagesService.myPackage.next(this.myPackage);
                          }
                        });
                    }
                    console.log(res2.url);

                    //this.modal.open(this.successAlert);
                  }
                });
              }
            });
          }
        }
      );
    }
  }
  closeModel() {
    let url = `/${Routing.dashboard}`;

    this.modal.close(this.successAlert);
    this.router.navigate([url]);
  }
}
