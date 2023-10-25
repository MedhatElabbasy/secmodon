import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { AuthResponse } from 'projects/tools/src/public-api';
import {
  BehaviorSubject,
  exhaustMap,
  map,
  Observable,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import * as lt from 'long-timeout';
import {
  CryptoService,
  IUser,
  OtpModel,
  OtpResponse,
  Roles,
  SecurityCompany,
  StorageKeys,
  UserIdentity,
  ValidateModel,
} from 'projects/tools/src/public-api';
import { Router } from '@angular/router';
import { Routing } from '../../core/routes/app-routes';

import { NotifyService } from '../../core/services/notify.service';
import { NotificationType } from '../../packages/enum/notificationTypes';
import { items } from './../../packages/model/items';
import { itemsName } from '../../packages/enum/items';
import { PackagesService } from './../../packages/services/packages.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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
  private helper = new JwtHelperService();
  private readonly url = environment.api;
  private tokenExpirationTimer!: any;
  private allowed: string[] = [Roles.SecuritCompany, Roles.SecurityCompanyUser];
  userIdentity = new BehaviorSubject<UserIdentity | null>(null);
  userInfo = new BehaviorSubject<SecurityCompany | null>(null);
  packages = new BehaviorSubject<boolean>(true);
  complete = new BehaviorSubject<boolean>(true);
  snapshot!: {
    userIdentity: UserIdentity | null;
    userInfo: SecurityCompany | null;
  };

  constructor(
    private http: HttpClient,
    private crypto: CryptoService,
    private notify: NotifyService,
    private PackagesService: PackagesService,
    private router: Router
  ) {
    this.snapshot = {
      userIdentity: null,
      userInfo: null,
    };
  }

  registerCompany(model: any) {
    return this.http.post(this.url + `api/SecurityCompany/Create`, model);
  }

  generateOTP(model: OtpModel): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(this.url + `auth/otp/generate`, model);
  }

  validate(model: ValidateModel): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.url + 'auth/otp/validate', model)
      .pipe(
        tap((response) => {
          console.log(response);

          this.handleAuthResponse(response);
        })
      );
  }

  handleAuthResponse(response: AuthResponse): void {
    const identity = new UserIdentity(
      response.id_token,
      response.userId,
      response.isProfileComplete
    );

    this.crypto.setEncryptedStorage(StorageKeys.uid, identity);
    this.updateIdentity(identity);
    this.getSecurityCompany();
    this.autoLogout(identity.token);
  }

  autoLogin() {
    let savedIdentity: IUser = this.crypto.getEncryptedStorage(StorageKeys.uid);
    if (savedIdentity) {
      const identity = new UserIdentity(
        savedIdentity._token,
        savedIdentity.userId,
        savedIdentity.isProfileComplete
      );
      if (identity.role) {
        if (!this.allowed.includes(identity.role)) {
          this.logout();
          this.router.navigate(['/' + Routing.unauthorized]);
        } else {
          this.updateIdentity(identity);
          this.getSecurityCompany().subscribe((res) => {



            if (res.id) {

              if (res.licenseImageId) {
                this.complete.next(true)

                this.checkEnroll(res.id).subscribe((res2) => {
                  if (res2.status == 204) {
                    this.packages.next(false);
                    const link = `/${Routing.dashboard}/${Routing.packages.module}/${Routing.packages.children.packages}`;
                    this.router.navigate([link]);
                    this.autoLogout(identity.token);
                  } else {
                    let data: any = res2.body;
                    let packageDetails = data.package.packageDetails;
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
                      } else if (check.packageItems.keysEnable == itemsName.technicalSupport) {
                        this.myPackage.technicalSupport = Number(check.limit);
                      } else if (
                        check.packageItems.keysEnable == itemsName.ReceivingOffersFromClients
                      ) {
                        this.myPackage.ReceivingOffersFromClients = Number(
                          check.limit
                        );
                      } else if (
                        check.packageItems.keysEnable == itemsName.numberOfJobsOffered
                      ) {
                        this.myPackage.numberOfJobsOffered = Number(check.limit);
                      } else if (
                        check.packageItems.keysEnable == itemsName.numberOfEmploymentContracts
                      ) {
                        this.myPackage.numberOfEmploymentContracts = Number(
                          check.packageItems.limit
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
                    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
                    let days = TotalDays;
                    if (days <= 5) {
                      let model = {
                        titile: `الأشتراك سوف ينتهي يوم ${date_1.toISOString().split('T')[0]
                          } `,
                        titileEn: `package will end in day ${date_1.toISOString().split('T')[0]
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
              } else {
                this.complete.next(false)
                const link = `/${Routing.addNewData}`;
                this.router.navigate([link]);
              }
            }
          });
        }
      } else {
        return;
      }
    } else {
      return;
    }
  }
  checkEnroll(id: number) {
    return this.http.get(
      this.url +
      `api/CompanyPackageEnrollment/GetCompanyValidEnrollment?id=${id}`,
      { observe: 'response' }
    );
  }
  logout(): void {
    if (this.tokenExpirationTimer) {
      lt.clearTimeout(this.tokenExpirationTimer);
    }

    this.crypto.deleteEncryptedStorageByKey(StorageKeys.uid);
    this.userIdentity.next(null);
    this.userInfo.next(null);
    this.snapshot.userInfo = null;
    this.snapshot.userIdentity = null;
    this.router.navigate(['/']);
  }

  autoLogout(token: string | null): void {
    if (!token) {
      this.logout();
      return;
    }

    if (this.helper.isTokenExpired(token)) {
      this.logout();
      return;
    } else {
      let expiry: any = this.helper.getTokenExpirationDate(token)?.valueOf();
      let today = new Date().valueOf();
      let timeout = expiry - today;

      this.tokenExpirationTimer = lt.setTimeout(() => {
        this.logout();
      }, timeout);
    }
  }

  getSecurityCompany() {
    return this.http
      .get<SecurityCompany>(this.url + `api/SecurityCompany/get`)
      .pipe(
        tap((response) => {
          this.updateUserInfo(response);
        })
      );
  }

  updateIdentity(identity: UserIdentity): void {
    if (identity) {
      this.userIdentity.next(identity);
      this.snapshot.userIdentity = identity;
      console.log(this.userIdentity.value);

    }
  }

  updateUserInfo(info: SecurityCompany): void {
    if (info) {
      let user = this.snapshot.userIdentity!;
      let role = this.snapshot.userIdentity?.role;
      if (role == Roles.SecuritCompany) {
        user.addRole(Roles.VirtualAdmin);
      }

      if (role == Roles.SecurityCompanyUser) {
        if (info.securityCompanyBranch.isMainBranch) {
          user.addRole(Roles.VirtualAdmin);
        }
      }

      this.crypto.setEncryptedStorage(StorageKeys.uid, user);

      this.snapshot.userIdentity = user;

      this.userInfo.next(info);
      this.snapshot.userInfo = info;
    }
  }
  rejectedCompany(id: number) {
    return this.http.get(
      this.url + `api/SecurityCompany/GetAllReject?id=${id}`
    );
  }
}
