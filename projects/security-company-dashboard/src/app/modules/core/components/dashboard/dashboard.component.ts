import { PackagesService } from './../../../packages/services/packages.service';
import { Component, OnInit, ViewChild } from '@angular/core';
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
  ModalService,
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
import { MapInfoWindow } from '@angular/google-maps';
declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow | undefined;
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
  markers: { lat: any; lng: any; name: string ;siteLocationName:string,securityCompanyName:string ,
    guardCode:number , guardImage:string ,phoneNumber:number , nationalId:number,branchName:string,
     clientName:string , siteNumber:number , supervisorName:string ,shiftName:string , startTime:string}[] = [];
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
  infoContent!: string;
  guardDetailsId="DetailsIdddd";
  guardDetails!:any;
  allCheckIn: any[] = [];
  allCheckOut: any[] = [];
  allBreak: any[] = [];
  searchKey=''
  constructor(
    private auth: AuthService,
    private reports: ReportsService,
    public lang: LangService,
    private PackagesService: PackagesService,
    private localeService: BsLocaleService,
    private _model:ModalService
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
      console.log(this.checkedOut);
      this.allCheckOut = this.checkedOut
      this.break = this.report?.filter((e:any) => e.isOnBreak);
      this.allBreak = this.break
      this.checkedIn = this.report?.filter((e: any) => !e.isComplete);
      this.allCheckIn=this.checkedIn
      this.checkedIn.forEach((x:any) => {
       // console.log(x);
        if (x.locationTracking) {
          this.markers.push({
            name: x.name,
            siteLocationName:x.siteLocationName,
            phoneNumber:x.phoneNumber,
            guardCode:x.guardCode,
            guardImage:x.guardImage,
            nationalId:x.nationalId,
            clientName:x.clientName,
            branchName:x.branchName,
            supervisorName:x.supervisorName,
            siteNumber:x.siteNumber,
            shiftName:x.shiftName,
            startTime:x.startTime,
            securityCompanyName:x.securityCompanyName,
            lat: x.locationTracking.lat,
            lng: x.locationTracking.long,
          });
        }


      });
    })
  }
  openInfo(marker: any,content:string,guardCode:number ,guardImage:string,name:string , phoneNumber:number 
    , nationalId:number , securityCompanyName:string , branchName:string , clientName:string , 
    siteLocationName:string ,supervisorName:string , siteNumber:any , shiftName:string ,startTime:string ) {
    console.log(guardImage);
    const siteLocationContent =
    siteLocationName !== null ? `<h6 class="">${siteLocationName}</h6>` : '<h6>لا يوجد</h6>';
    const supervisorNameContent =
    supervisorName !== null ? `<h6 class="">${supervisorName}</h6>` : '<h6>لا يوجد</h6>';
    const shiftNameContent = shiftName !== null ? `<h6 class="">${shiftName}</h6>` : '<h6>لا يوجد</h6>';
    const siteNumberContent =  siteNumber !== "" ? `<h6 class="">${siteNumber}</h6>` : '<h6>لا يوجد</h6>';
    console.log("sitenumber"+ siteNumber);
    
    this.infoContent = `<div class="row"><div class="col-8"><div class="row">
    <div class="col-12"><h6 class="text-muted">أسم المراقب</h6><h6 class="">`+name+`</h6></div>
    <div class="col-12"><h6 class="text-muted">رقم التواصل</h6><h6 class="">`+phoneNumber+`</h6></div>
    <div class="col-6"><h6 class="text-muted">رقم الهوية الوطنية</h6><h6 class="">`+nationalId+`</h6></div>
    <div class="col-6"><h6 class="text-muted">الكود</h6><h6 class="">`+guardCode+`</h6></div>
    </div></div>
    <div class="col-4"><img src="`+guardImage+`" class="Imgfluid rounded infoCardImg"/></</div></div><hr>
    <div class="row"><div class="col-4"><h6 class="text-muted">أسم الشركة الأمنية</h6><h6 class="">`+securityCompanyName+`</h6></div>
    <div class="col-4"><h6 class="text-muted">الفرع</h6><h6 class="">`+clientName+`</h6></div>
    <div class="col-4"><h6 class="text-muted">العميل</h6><h6 class="">`+branchName+`</h6></div></div><hr>
    <div class="row"><div class="col-4"><h6 class="text-muted">أسم الموقع</h6>`+siteLocationContent+`</div>
    <div class="col-4"><h6 class="text-muted">رقم الموقع</h6>`+siteNumberContent+`</div>
    <div class="col-4"><h6 class="text-muted">المشرف</h6><h6 class="">`+supervisorNameContent+`</h6></div>
    <div class="col-4"><h6 class="text-muted">المناوبة</h6><h6 class="">`+shiftNameContent+`</h6></div>
    <div class="col-4"><h6 class="text-muted">وقت الدخول</h6><h6 class="">`+startTime.split(' ')[1]+`</h6></div></div>
    `
    console.log(this.infoContent);
    
    setTimeout(() => {
      this.infoWindow?.open(marker);
    }, 500);
  }


  open(Id:any){
    console.log(this.guardDetails.name);
    
    this._model.open(this.guardDetailsId)
  }

  close(){
    this._model.close(this.guardDetailsId);
    
  }

  details(data:AttendanceReport){
    if(data != null){
    this.guardDetails=data;
   //this.guardDetailsId=data.guardCode.toString();
   if( this.guardDetails!=null){
    console.log(this.guardDetails);
 
    this.open(this.guardDetailsId)

   }
  }
  }


  search(searchtype:string){
    if(searchtype == 'checkIn'){
      this.checkedIn = this.allCheckIn
      console.log(this.checkedIn);
      let myData: any[] = [];
      if (this.searchKey != '') {
        console.log(this.searchKey);
        
        this.checkedIn.filter((ele: any) => {
          let name = ele.name.toLowerCase() 
          let number = ele.phoneNumber
          if (
            name.includes(this.searchKey.replace(/\s/g, '').toLowerCase() ) || number?.includes(this.searchKey.replace(/\s/g, ''))
          ) {
            myData.push(ele);
          }
        });
        this.checkedIn = myData;
      } else {
        this.checkedIn = this.allCheckIn;
      }
    }else if(searchtype == 'checkOut'){
      this.checkedOut = this.allCheckOut
      console.log(this.checkedOut);
      let myData: any[] = [];
      if (this.searchKey != '') {
        console.log(this.searchKey);
        
        this.checkedOut.filter((ele: any) => {
         // console.log(ele.name);
          
          let name = ele.name.toLowerCase() 
          let number = ele.phoneNumber
          if (
            name.includes(this.searchKey.replace(/\s/g, '').toLowerCase()) || number?.includes(this.searchKey.replace(/\s/g, ''))
          ) {
            
            myData.push(ele);
          }
        });
        this.checkedOut = myData;
      } else {
        this.checkedOut = this.allCheckOut;
      }
    }else if(searchtype == 'checkBreak'){
      this.break = this.allBreak
      console.log(this.break);
      let myData: any[] = [];
      if (this.searchKey != '') {
        console.log(this.searchKey);
        
        this.break.filter((ele: any) => {
          console.log(ele.name);
          
          let name = ele.name.toLowerCase() 
          let number = ele.phoneNumber
          if (
            name.includes(this.searchKey.replace(/\s/g, '').toLowerCase() ) || number?.includes(this.searchKey.replace(/\s/g, ''))
          ) {
            console.log(name.includes(this.searchKey.replace(/\s/g, '')));
            
            myData.push(ele);
          }
        });
        this.break = myData;
      } else {
        this.break = this.allBreak ;
      }
    }
    }
}



//change 1083 by client id
