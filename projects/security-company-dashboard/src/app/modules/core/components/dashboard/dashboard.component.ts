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
  siteId!: string;
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
  report!: AttendanceReport[];
  date = convertDateToString(new Date());
  yesterday!: Date;
  checkedIn: AttendanceReport[] = [];
  checkedOut: AttendanceReport[] = [];
  break: AttendanceReport[] = [];
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
  constructor(
    private auth: AuthService,
    private reports: ReportsService,
    private route: ActivatedRoute,
    private guard: CompanyGuardsService,
    private client: ClientsService,
    private site: ClientSiteService,
    public lang: LangService,
    private PackagesService: PackagesService,
    private localeService: BsLocaleService
  ) {

    this.connect();
    // guard.getAllGuardsOnCompany().subscribe((x) => {
    //   x.forEach((element) => {
    //     this.guardsids.push(element.id);
    //   });
    // });
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
    this.getStatisticAllCLient(this.firstDate, this.lastDate);
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
          this.reports
            .getData(this.id, val.start, val.end, Loader.yes)
            .subscribe((response) => {
              this.reports.statisticData.next(response);
            });
        } else {
          console.log("bbbbbbb");

          this.reports
            .getDataByBranch(this.id, val.start, val.end, Loader.yes)
            .subscribe((response) => {
              this.reports.statisticData.next(response);
            });
        }
        this.getStatistic(val.start, val.end, this.id);
      });
  }
  getStatistic(date1: string, date2: string, clientId: number) {

    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.reports
        .getAttendanceStatisitcReportByClient(date1, date2, this.id, Loader.no)
        .subscribe((res) => {
          if (res) {
            this.statistic = res;
            this.totalWorkHoure = this.statistic.totalWorkHoure;
            this.totalBrackHoure = this.statistic.totalBrackHoure;
            this.totalExstraTime = this.statistic.totalExstraTime;
            let h =
              Number(this.totalWorkHoure.toString().split(':')[0]) +
              Number(this.totalExstraTime.toString().split(':')[0]);
            let m =
              Number(this.totalWorkHoure.toString().split(':')[1]) +
              Number(this.totalExstraTime.toString().split(':')[1]);
            if (m > 59) {
              h += Math.floor(m / 60);
              m %= 60;
            }
            this.totalHoure = Math.round(h) + ':' + Math.round(m);
            let total1 = `${this.totalWorkHoure.toString().split(':')[0]}:${this.totalWorkHoure.toString().split(':')[1]}`
            this.totalWorkHoure = total1

            let total2 = `${this.totalExstraTime.toString().split(':')[0]}:${this.totalExstraTime.toString().split(':')[1]}`
            this.totalExstraTime = total2
            let total3 = `${this.totalBrackHoure.toString().split(':')[0]}:${this.totalBrackHoure.toString().split(':')[1]}`
            this.totalBrackHoure = total3

          }
        });
    }
    else {
      this.reports
        .getAttendanceStatisitcReportByClientAndBranch(date1, date2, this.id, Loader.no)
        .subscribe((res) => {
          if (res) {
            this.statistic = res;
            this.totalWorkHoure = this.statistic.totalWorkHoure;
            this.totalBrackHoure = this.statistic.totalBrackHoure;
            this.totalExstraTime = this.statistic.totalExstraTime;
            let h =
              Number(this.totalWorkHoure.toString().split(':')[0]) +
              Number(this.totalExstraTime.toString().split(':')[0]);
            let m =
              Number(this.totalWorkHoure.toString().split(':')[1]) +
              Number(this.totalExstraTime.toString().split(':')[1]);
            if (m > 59) {
              h += Math.floor(m / 60);
              m %= 60;
            }
            this.totalHoure = Math.round(h) + ':' + Math.round(m);
            let total1 = `${this.totalWorkHoure.toString().split(':')[0]}:${this.totalWorkHoure.toString().split(':')[1]}`
            this.totalWorkHoure = total1

            let total2 = `${this.totalExstraTime.toString().split(':')[0]}:${this.totalExstraTime.toString().split(':')[1]}`
            this.totalExstraTime = total2
            let total3 = `${this.totalBrackHoure.toString().split(':')[0]}:${this.totalBrackHoure.toString().split(':')[1]}`
            this.totalBrackHoure = total3

          }
        });
    }


  }
  getStatisticAllCLient(date1: string, date2: string) {

    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.reports
        .getAttendanceStatisitcReport(date1, date2, Loader.no)
        .subscribe((res) => {
          if (res) {
            this.statistic = res;
            this.totalWorkHoure = this.statistic.totalWorkHoure;
            this.totalBrackHoure = this.statistic.totalBrackHoure;
            this.totalExstraTime = this.statistic.totalExstraTime;
            let h =
              Number(this.totalWorkHoure.toString().split(':')[0]) +
              Number(this.totalExstraTime.toString().split(':')[0]);
            let m =
              Number(this.totalWorkHoure.toString().split(':')[1]) +
              Number(this.totalExstraTime.toString().split(':')[1]);
            if (m > 59) {
              h += Math.floor(m / 60);
              m %= 60;
            }
            this.totalHoure = Math.round(h) + ':' + Math.round(m);
            let total1 = `${this.totalWorkHoure.toString().split(':')[0]}:${this.totalWorkHoure.toString().split(':')[1]}`
            this.totalWorkHoure = total1

            let total2 = `${this.totalExstraTime.toString().split(':')[0]}:${this.totalExstraTime.toString().split(':')[1]}`
            this.totalExstraTime = total2
            let total3 = `${this.totalBrackHoure.toString().split(':')[0]}:${this.totalBrackHoure.toString().split(':')[1]}`
            this.totalBrackHoure = total3

          }
        });
    } else {
      this.reports
        .getAttendanceStatisitcReportByBranch(date1, date2, Loader.no)
        .subscribe((res) => {
          if (res) {
            this.statistic = res;
            this.totalWorkHoure = this.statistic.totalWorkHoure;
            this.totalBrackHoure = this.statistic.totalBrackHoure;
            this.totalExstraTime = this.statistic.totalExstraTime;
            let h =
              Number(this.totalWorkHoure.toString().split(':')[0]) +
              Number(this.totalExstraTime.toString().split(':')[0]);
            let m =
              Number(this.totalWorkHoure.toString().split(':')[1]) +
              Number(this.totalExstraTime.toString().split(':')[1]);
            if (m > 59) {
              h += Math.floor(m / 60);
              m %= 60;
            }
            this.totalHoure = Math.round(h) + ':' + Math.round(m);
            let total1 = `${this.totalWorkHoure.toString().split(':')[0]}:${this.totalWorkHoure.toString().split(':')[1]}`
            this.totalWorkHoure = total1

            let total2 = `${this.totalExstraTime.toString().split(':')[0]}:${this.totalExstraTime.toString().split(':')[1]}`
            this.totalExstraTime = total2
            let total3 = `${this.totalBrackHoure.toString().split(':')[0]}:${this.totalBrackHoure.toString().split(':')[1]}`
            this.totalBrackHoure = total3

          }
        });
    }

  }
  getMarker() {
    if (this.flag) {
      this.route.data.subscribe((res) => {
        let data = res['report'];
        this.report = data;
        this.checkedOut = data.filter((e: AttendanceReport) => e.isComplete);
        this.break = data.filter((e: AttendanceReport) => e.isOnBreak);
        this.checkedIn = data.filter((e: AttendanceReport) => !e.isComplete);
        this.checkedIn.forEach((x) => {
          if (x?.locationTracking.length == 0) {
            // console.log('true');
            this.markers.push({
              name:
                x?.companySecurityGuard.securityGuard?.firstName +
                ' ' +
                x?.companySecurityGuard.securityGuard?.lastName,
              lat: x?.lat,
              lng: x?.long,
            });
          } else {
            this.markers.push({
              name:
                x?.companySecurityGuard.securityGuard?.firstName +
                ' ' +
                x?.companySecurityGuard.securityGuard?.lastName,
              lat: x?.locationTracking[x.locationTracking.length - 1]?.lat,
              lng: x?.locationTracking[x.locationTracking.length - 1]?.long,
            });
          }
        });
      });
    } else {
      if (!this.siteId) {
        this.reports
          .getAttendanceReportByClient(this.date, this.date, this.id, Loader.no)
          .subscribe((res) => {
            this.report = res;
            this.checkedOut = res.filter((e) => e.isComplete);
            this.break = res.filter((e) => e.isOnBreak);
            this.checkedIn = res.filter((e) => !e.isComplete);
            this.checkedIn.forEach((x) => {
              if (x?.locationTracking.length == 0) {
                this.markers.push({
                  name:
                    x?.companySecurityGuard.securityGuard?.firstName +
                    ' ' +
                    x?.companySecurityGuard.securityGuard?.lastName,
                  lat: x?.lat,
                  lng: x?.long,
                });
              } else {
                this.markers.push({
                  name:
                    x?.companySecurityGuard.securityGuard?.firstName +
                    ' ' +
                    x?.companySecurityGuard.securityGuard?.lastName,
                  lat: x?.locationTracking[x.locationTracking.length - 1]?.lat,
                  lng: x?.locationTracking[x.locationTracking.length - 1]?.long,
                });
              }
            });
          });
      } else {
        let reportBySite: any[] = [];
        console.log(this.report);
        
        this.report.forEach((element) => {
          if (element.siteLocation.clientSiteId == this.siteId) {
            reportBySite.push(element);
          }
        });
        this.checkedOut = reportBySite.filter((e) => e.isComplete);
        this.break = reportBySite.filter((e) => e.isOnBreak);
        this.checkedIn = reportBySite.filter((e) => !e.isComplete);
        this.checkedIn.forEach((x) => {
          this.markers.push({
            name:
              x?.companySecurityGuard.securityGuard?.firstName +
              ' ' +
              x?.companySecurityGuard.securityGuard?.lastName,
            lat: x.locationTracking[x.locationTracking.length - 1]?.lat,
            lng: x.locationTracking[x.locationTracking.length - 1]?.long,
          });
        });
      }
    }
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
              if (this.flag) {
                this.getAttendance(this.date, this.date, Loader.no);
              } else {
                this.getAttendanceByClient(
                  this.date,
                  this.date,
                  Loader.no,
                  this.id
                );
              }
            });
          });
      })
      .catch((err) =>
        console.log('error while establishing signalr connection: ' + err)
      );
  }

  getAttendance(startDate: string, endDate: string, loader: Loader) {
    let role = this.auth.snapshot.userIdentity?.role;
    console.log(role);
    
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.reports
        .getAttendanceReport(startDate, endDate, Loader.no)
        .subscribe((res) => {
          this.report = res;
          this.checkedOut = res.filter((e) => e.isComplete);
          this.break = res.filter((e) => e.isOnBreak);
          this.checkedIn = res.filter((e) => !e.isComplete);
        });
    }
    else {
      this.reports
        .getAttendanceReportByBranch(startDate, endDate, Loader.no)
        .subscribe((res) => {
          this.report = res;
          this.checkedOut = res.filter((e) => e.isComplete);
          this.break = res.filter((e) => e.isOnBreak);
          this.checkedIn = res.filter((e) => !e.isComplete);
        });
    }
  }

  getAttendanceByClient(
    startDate: string,
    endDate: string,
    loader: Loader,
    clientId: number
  ) {
    this.reports
      .getAttendanceReportByClient(startDate, endDate, clientId, Loader.no)
      .subscribe((res) => {
        this.report = res;
        this.checkedOut = res.filter((e) => e.isComplete);
        this.break = res.filter((e) => e.isOnBreak);
        this.checkedIn = res.filter((e) => !e.isComplete);
      });
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._hubConnection.stop();
  }
  getDataFilter(type: string) {
    if (type == 'client') {
      this.siteFilter = false;
      this.siteId = '';
      this.sites = null;
      this.getClients();
    } else {
      this.data = [];
      this.siteFilter = true;
      this.getClients();
    }
  }
  getClients() {

    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.client.getClientsBySecurityCompany(1, 20000).subscribe((res) => {
        this.data = res.data;
      });
    } else {
      this.client.getClientsByBranchId(1, 20000).subscribe((res) => {
        this.data = res.data;
      });
    }


  }
  display(event: any) {
    this.id = event.value;
    this.reports.clientId.next(this.id);
    this.flag = false;
    this.markers = [];
    this.getMarker();
    this.getStatistic(this.firstDate, this.lastDate, this.id);
    if (this.siteFilter) {
      let StringId = '';
      this.data.forEach((element: any) => {
        if (element.clientCompany.id == this.id) {
          StringId = element.id;
        }
        return;
      });
      this.site.getAllByClientId(StringId).subscribe((res) => {
        this.sites = res;
      });
    }
  }
  display2(event: any) {
    this.siteId = event.value;
    this.markers = [];
    this.getMarker();
  }
  deleteFilter() {
    this.flag = true;
    this.sites = null;
    this.data = null;
    this.id = 0;
    this.reports.clientId.next(0);
    this.siteFilter = false;
    this.siteId = '';
    this.getMarker();
  }
}
