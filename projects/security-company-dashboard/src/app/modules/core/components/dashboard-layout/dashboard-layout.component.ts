import { PackagesService } from './../../../packages/services/packages.service';
import { Directionality } from '@angular/cdk/bidi';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  LangService,
  language,
  ModalService,
  Roles,
  SecurityCompany,
} from 'projects/tools/src/public-api';
import { ACCOUNT_LIST } from '../../../account-management/routes/account-routes.enum';
import { AuthService } from '../../../auth/services/auth.service';
import { SIDEBAR_LIST } from '../../data/sidebar-menu';
import { MenuItem } from '../../models/menu-item';
import { Routing } from '../../routes/app-routes';
import { CompanyProfileService } from '../../../jobs/services/company-profile.service';
import { NotifyService } from '../../services/notify.service';
import { notify } from '../../models/notify';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class DashboardLayoutComponent implements OnInit {
  numberOfSuperVisors!: number;
  modalId3 = 'modalId3';
  sum = 10;
  throttle = 1000;
  scrollDistance = 1;
  scrollUpDistance = 100;
  direction = '';
  modalOpen = false;
  temp!: notify[];
  start: number = 1;
  AllNotify: any[] = [];
  total: number = 0;
  date: any;
  packages!: boolean;
  img: any;
  menu: MenuItem[] = [...SIDEBAR_LIST];
  step!: number;
  accountList: { name: string; link: string; icon: string }[] = [
    ...ACCOUNT_LIST,
  ];
  userInfo!: SecurityCompany;
  routing = Routing;
  isOpen: boolean = false;
  technicalSupport!: number;
  /** Whether the widget is in RTL mode or not. */
  private isRtl!: boolean;

  /** Subscription to the Directionality change EventEmitter. */
  private _dirChangeSubscription = Subscription.EMPTY;

  constructor(
    public lang: LangService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private profileComplete: CompanyProfileService,
    private PackagesService: PackagesService,
    private modal: ModalService,
    private notify: NotifyService
  ) {
    this.getInitData();
  }

  ngOnInit(): void {
    this.auth.packages.subscribe((res) => {
      this.packages = res;
    });
    this.profileComplete.stepNumber.subscribe((res) => {
      this.step = res;
    });
  }

  getInitData() {
    this.userInfo = this.route.snapshot.data['company'];
    console.log(this.userInfo);
    
    if (this.userInfo) {
      if (!this.userInfo.isActive) {
        if (this.userInfo?.isRejected) {
          this.router.navigate(['/' + Routing.rejected]);
        } else if (this.userInfo.isApproved) {
          this.router.navigate(['/' + Routing.approved]);
        } else {
          this.router.navigate(['/' + Routing.pending]);
        }
      }
    }

    if (this.auth.snapshot.userIdentity?.role == Roles.SecurityCompanyUser) {
      if (
        !this.userInfo.appUser.isActive ||
        !this.userInfo.securityCompanyBranch.stauts
      ) {
        this.router.navigate(['/' + Routing.notActive]);
      }
    }
  }

  onLanguageChange() {
    this.lang.toggleLanguage();
  }

  logout() {
    this.auth.logout();
  }
  displayNotify() {
    if (this.auth.snapshot.userIdentity?.role == Roles.SecuritCompany) {
      this.companyNotify();
    } else {
      this.companyBranchNotify();
    }
  }
  companyNotify() {
    let id!: number;
    if (this.auth.snapshot.userInfo?.id) {
      id = this.auth.snapshot.userInfo.id;
    }
    this.notify
      .companyNotification(id, this.start, 10)
      .subscribe((response: any) => {
        if (response) {
          this.hideloader();
        }
        this.temp = response.data; //1
        this.total = response.totalCount;
  
        this.addphotos(this.start, this.sum); // 2
      });
  }

  companyBranchNotify() {
    let id!: string;
    if (this.auth.snapshot.userInfo?.securityCompanyBranch.id) {
      id = this.auth.snapshot.userInfo.securityCompanyBranch.id;
    }
    this.notify
      .companyBranchNotification(id, this.start, 10)
      .subscribe((response: any) => {
        if (response) {
          this.hideloader();
        }
        this.temp = response.data; //1
        this.total = response.totalCount;
        this.addphotos(this.start, this.sum); // 2
      });
  }

  addphotos(index: number, sum: number) {
    for (let i = 0; i < sum; i++) {
      if (this.temp[i] != null) {
        this.AllNotify.push(this.temp[i]);
      }
    }
  }

  onScrollDown() {
    this.start = this.start + 1;
    if (this.auth.snapshot.userIdentity?.role == Roles.SecuritCompany) {
      this.companyNotify();
    } else {
      this.companyBranchNotify();
    }
    this.direction = 'down';
  }

  hideloader() {
    document.getElementById('loading')!.style.display = 'none';
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._dirChangeSubscription.unsubscribe();
  }
  support() {
    this.technicalSupport =
      this.PackagesService.myPackage.getValue().technicalSupport;
    this.modal.open(this.modalId3);
  }
}
