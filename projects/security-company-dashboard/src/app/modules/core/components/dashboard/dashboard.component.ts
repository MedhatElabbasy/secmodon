import { PackagesService } from './../../../packages/services/packages.service';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import {
  HttpClient,
  HubConnection,
  HubConnectionBuilder,
} from '@microsoft/signalr';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import {
  convertDateToString,
  LangService,
  language,
  mapTheme,
  PAGINATION_SIZES,
  Roles,
} from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { AttendanceReport } from '../../../reports/models/attendance-report';
import { ReportsService } from '../../../reports/services/reports.service';
import { Loader } from '../../enums/loader.enum';
import { CompanyGuardsService } from '../../../guards/services/company-guards.service';
import { ClientsService } from './../../../client/services/clients.service';
import { ClientSiteService } from '../../../client/services/client-site.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { map } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  filterDate = new FormControl();
  maxDate = new Date();
  message!: string;
  statisticData!: any;
  flag: boolean = true;
  sites: any;
  id!: number;
  siteId!: any;
  siteFilter: boolean = false;
  totalHoure!: string;
  totalWorkHoure!: any;
  totalBrackHoure!: any;
  totalExstraTime!: any;
  mainLocation = new google.maps.LatLng({
    lat: 23.8859,
    lng: 45.0792,
  });
  data: any;
  style = mapTheme;
  statistic!: any;
  private _hubConnection!: HubConnection;
  report!: any[];
  date = convertDateToString(new Date());
  yesterday!: Date;
  checkedIn: any[] = [];
  checkedOut: any[] = [];
  break: any[] = [];
  markers: { lat: any; lng: any; name: string }[] = [];
  guardsids: any[] = [];
  dateToday = new Date();
  lastDate =
    this.dateToday.getMonth() +
    1 +
    '-' +
    this.dateToday.getDate() +
    '-' +
    this.dateToday.getFullYear();
  newDate = new Date(this.dateToday.setMonth(this.dateToday.getMonth() - 1));
  firstDate =
    this.newDate.getMonth() +
    1 +
    '-' +
    this.newDate.getDate() +
    '-' +
    this.newDate.getFullYear();
  hide!: boolean;
  companyId!: any;
  securityCompanyClientId!: any;
  locationId!: any;
  branches!:any;
  branchId!:any;
  branchFilter:boolean=false;
  isMainBranch:boolean=false;
  constructor(
    private auth: AuthService,
    private reports: ReportsService,
    public lang: LangService,
    private PackagesService: PackagesService,
    private localeService: BsLocaleService
  ) {
    this.companyId = this.auth.snapshot.userInfo?.id;

    this.connect();
    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.isMainBranch = true;
      console.log(isMainBranch);
    } else {
      this.isMainBranch = false;
      console.log(isMainBranch);
    }
  }

  ngOnInit(): void {
    let liveTrackingDisplay =
      this.PackagesService.myPackage.getValue().liveTracking;
    if (!liveTrackingDisplay) {
      this.hide = false;
    } else {
      this.hide = true;
    }
    this.onDateChange();
    this.getMarker();
   // this.getStatisticAllCLient(this.firstDate, this.lastDate);
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
  onDateChange() {
    this.filterDate.valueChanges
      .pipe(
        map((val: any) => ({
          start: convertDateToString(val[0]),
          end: convertDateToString(val[1]),
        }))
      )
      .subscribe((val) => {
        let role = this.auth.snapshot.userIdentity?.role;
        let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
        if (role == Roles.SecuritCompany || isMainBranch) {
          this.isMainBranch = true;
          console.log(isMainBranch);

          // this.reports
          //   .getData(1083, val.start, val.end, Loader.yes)
          //   .subscribe((response) => {
          //     this.reports.statisticData.next(response);
          //   });
        } else {
          this.isMainBranch = false;
          console.log(isMainBranch);
          // this.reports
          //   .getDataByBranch(1083, val.start, val.end, Loader.yes)
          //   .subscribe((response) => {
          //     this.reports.statisticData.next(response);
          //   });
        }
       // this.getStatistic(val.start, val.end, 1083);
      });
  }
  // getStatistic(date1: string, date2: string, clientId: number) {

  //   let role = this.auth.snapshot.userIdentity?.role;
  //   let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
  //   if (role == Roles.SecuritCompany || isMainBranch) {
  //     this.reports
  //       .getAttendanceStatisitcReportByClient(date1, date2, 1083, Loader.no)
  //       .subscribe((res) => {
  //         if (res) {
  //           this.statistic = res;
  //           this.totalWorkHoure = this.statistic.totalWorkHoure;
  //           this.totalBrackHoure = this.statistic.totalBrackHoure;
  //           this.totalExstraTime = this.statistic.totalExstraTime;
  //           let h =
  //             Number(this.totalWorkHoure.toString().split(':')[0]) +
  //             Number(this.totalExstraTime.toString().split(':')[0]);
  //           let m =
  //             Number(this.totalWorkHoure.toString().split(':')[1]) +
  //             Number(this.totalExstraTime.toString().split(':')[1]);
  //           if (m > 59) {
  //             h += Math.floor(m / 60);
  //             m %= 60;
  //           }
  //           this.totalHoure = Math.round(h) + ':' + Math.round(m);
  //           let total1 = `${this.totalWorkHoure.toString().split(':')[0]}:${this.totalWorkHoure.toString().split(':')[1]}`
  //           this.totalWorkHoure = total1

  //           let total2 = `${this.totalExstraTime.toString().split(':')[0]}:${this.totalExstraTime.toString().split(':')[1]}`
  //           this.totalExstraTime = total2
  //           let total3 = `${this.totalBrackHoure.toString().split(':')[0]}:${this.totalBrackHoure.toString().split(':')[1]}`
  //           this.totalBrackHoure = total3

  //         }
  //       });
  //   }
  //   else {
  //     this.reports
  //       .getAttendanceStatisitcReportByClientAndBranch(date1, date2, 1083, Loader.no)
  //       .subscribe((res) => {
  //         if (res) {
  //           this.statistic = res;
  //           this.totalWorkHoure = this.statistic.totalWorkHoure;
  //           this.totalBrackHoure = this.statistic.totalBrackHoure;
  //           this.totalExstraTime = this.statistic.totalExstraTime;
  //           let h =
  //             Number(this.totalWorkHoure.toString().split(':')[0]) +
  //             Number(this.totalExstraTime.toString().split(':')[0]);
  //           let m =
  //             Number(this.totalWorkHoure.toString().split(':')[1]) +
  //             Number(this.totalExstraTime.toString().split(':')[1]);
  //           if (m > 59) {
  //             h += Math.floor(m / 60);
  //             m %= 60;
  //           }
  //           this.totalHoure = Math.round(h) + ':' + Math.round(m);
  //           let total1 = `${this.totalWorkHoure.toString().split(':')[0]}:${this.totalWorkHoure.toString().split(':')[1]}`
  //           this.totalWorkHoure = total1

  //           let total2 = `${this.totalExstraTime.toString().split(':')[0]}:${this.totalExstraTime.toString().split(':')[1]}`
  //           this.totalExstraTime = total2
  //           let total3 = `${this.totalBrackHoure.toString().split(':')[0]}:${this.totalBrackHoure.toString().split(':')[1]}`
  //           this.totalBrackHoure = total3

  //         }
  //       });
  //   }


  // }
  // getStatisticAllCLient(date1: string, date2: string) {

  //   let role = this.auth.snapshot.userIdentity?.role;
  //   let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
  //   if (role == Roles.SecuritCompany || isMainBranch) {
  //     this.reports
  //       .getAttendanceStatisitcReport(date1, date2, Loader.no)
  //       .subscribe((res) => {
  //         if (res) {
  //           this.statistic = res;
  //           this.totalWorkHoure = this.statistic.totalWorkHoure;
  //           this.totalBrackHoure = this.statistic.totalBrackHoure;
  //           this.totalExstraTime = this.statistic.totalExstraTime;
  //           let h =
  //             Number(this.totalWorkHoure.toString().split(':')[0]) +
  //             Number(this.totalExstraTime.toString().split(':')[0]);
  //           let m =
  //             Number(this.totalWorkHoure.toString().split(':')[1]) +
  //             Number(this.totalExstraTime.toString().split(':')[1]);
  //           if (m > 59) {
  //             h += Math.floor(m / 60);
  //             m %= 60;
  //           }
  //           this.totalHoure = Math.round(h) + ':' + Math.round(m);
  //           let total1 = `${this.totalWorkHoure.toString().split(':')[0]}:${this.totalWorkHoure.toString().split(':')[1]}`
  //           this.totalWorkHoure = total1

  //           let total2 = `${this.totalExstraTime.toString().split(':')[0]}:${this.totalExstraTime.toString().split(':')[1]}`
  //           this.totalExstraTime = total2
  //           let total3 = `${this.totalBrackHoure.toString().split(':')[0]}:${this.totalBrackHoure.toString().split(':')[1]}`
  //           this.totalBrackHoure = total3

  //         }
  //       });
  //   } else {
  //     this.reports
  //       .getAttendanceStatisitcReportByBranch(date1, date2, Loader.no)
  //       .subscribe((res) => {
  //         if (res) {
  //           this.statistic = res;
  //           this.totalWorkHoure = this.statistic.totalWorkHoure;
  //           this.totalBrackHoure = this.statistic.totalBrackHoure;
  //           this.totalExstraTime = this.statistic.totalExstraTime;
  //           let h =
  //             Number(this.totalWorkHoure.toString().split(':')[0]) +
  //             Number(this.totalExstraTime.toString().split(':')[0]);
  //           let m =
  //             Number(this.totalWorkHoure.toString().split(':')[1]) +
  //             Number(this.totalExstraTime.toString().split(':')[1]);
  //           if (m > 59) {
  //             h += Math.floor(m / 60);
  //             m %= 60;
  //           }
  //           this.totalHoure = Math.round(h) + ':' + Math.round(m);
  //           let total1 = `${this.totalWorkHoure.toString().split(':')[0]}:${this.totalWorkHoure.toString().split(':')[1]}`
  //           this.totalWorkHoure = total1

  //           let total2 = `${this.totalExstraTime.toString().split(':')[0]}:${this.totalExstraTime.toString().split(':')[1]}`
  //           this.totalExstraTime = total2
  //           let total3 = `${this.totalBrackHoure.toString().split(':')[0]}:${this.totalBrackHoure.toString().split(':')[1]}`
  //           this.totalBrackHoure = total3

  //         }
  //       });
  //   }

  // }
  getMarker() {

    this.getAllReports()

  }
  private connect(): void {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(environment.hub)
      .build();

    this._hubConnection
      .start()
      .then(() => {
        this._hubConnection
          .invoke('AddToGroup', `${this.auth.snapshot.userInfo?.id}-attendance`)
          .then(() => {
            this._hubConnection.on('ReceiveMessage', () => {
              this.getAllReports()
            });
          });
      })
      .catch((err) =>
        console.log('error while establishing signalr connection: ' + err)
      );
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._hubConnection.stop();
  }
  getDataFilter(type: string) {
    if(type == 'branch'){
      this.branchFilter=true;
      this.branches=null;
      this.branchId=[];
      this.siteFilter = false;
      this.markers = [];
      this.sites=null;
      this.getClients();
        }else
        if (type == 'client') {
          this.siteFilter = false;
          this.siteId = [];
          this.sites = null;
          this.getClients();
        } else {
          this.data = [];
          this.siteFilter = true;
          this.getClients();
        }
  }
  getClients() {
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    this.reports.GlobalApiFilterGetAllSecurityCompanyClientForUserSecurity(AppUserId).subscribe((res) => {
      this.data = res;
      console.log(this.data);

    })
  }
  display(event: any) {
    this.securityCompanyClientId = [event.value];
    this.reports.clientId.next(1083);
    this.flag = false;
    this.branchId = [];
    this.branches=null;
    this.siteId=[];
    this.markers = [];
   // this.getMarker();
    //.getStatistic(this.firstDate, this.lastDate, 1083);
    if(this.siteFilter==true){
      console.log('sitefilter');
      this.getMarker();
      let AppUserId = this.auth.snapshot.userInfo?.appUser.id
      this.reports.GlobalApiFilterGetAllSiteLocationByUserAndSCForUserSecurity(this.securityCompanyClientId, AppUserId).subscribe((res) => {
        this.sites = res
      })
    }else if(this.branchFilter==true){
      console.log('branchfilter');
      this.getMarker();
      this.getBranches();
    }else{
      this.getMarker();
    }
  }
  display2(event: any) {
    this.siteId = [event.value];
    this.markers = [];
    this.getMarker();

  }

  getByBranchId({ value }: any) {
    this.branchId = [value.id]
    this.markers = [];
    this.getMarker();
  }

  deleteFilter() {
    this.flag = true;
    this.sites = null;
    this.data = null;
    this.branches = null;
    this.branchId=[];
    this.id = 0;
    this.securityCompanyClientId=[]
    this.reports.clientId.next(0);
    this.siteFilter = false;
    this.siteId = [];
    this.getMarker();
  }

  getBranches() {
    this.reports.GlobalApiFilter_GetAllSecurityBranch(this.companyId).subscribe((res) => {
      this.branches = res;
    });
  }


  getAllReports() {
    this.report=[];
    this.markers=[];
    this.checkedIn=[];
    this.checkedOut=[];
    this.markers=[];
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    let model
    model = {
      "securityCompanyId": this.companyId,
      "appUserId": AppUserId,
      "securityCompanyClientList":this.securityCompanyClientId,
      "securityCompanyBranchList": this.branchId,
      "clientSitesList":this.siteId,
      "startDate": this.date,
      "endDate": this.date,
      "page": 1,
      "pageSize": 1000000,
      "searchKeyWord": ""
    }
    // if (this.securityCompanyClientId) {
    //   model.securityCompanyClientList = [this.securityCompanyClientId] as never[]
    // }
    // if (this.siteId) {
    //   model.clientSitesList = [this.siteId] as never[]
    // }
    this.reports.GuardGuardsReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
      this.report = res.data
      this.checkedOut = this.report?.filter((e: any) => e.isComplete);
      this.break = this.report?.filter((e:any) => e.isOnBreak);
      this.checkedIn = this.report?.filter((e: any) => !e.isComplete);
      this.checkedIn.forEach((x) => {
        if (x.locationTracking) {
          this.markers.push({
            name: x.name,
            lat: x.locationTracking.lat,
            lng: x.locationTracking.long,
          });
        }


      });
    })
  }
}
//change 1083 by client id
