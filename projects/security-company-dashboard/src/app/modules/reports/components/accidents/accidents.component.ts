import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from 'projects/security-company-dashboard/src/environments/environment.staging';
import { map, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  convertDateToString,
  LangService,
  language,
  PAGINATION_SIZES,
  Roles,
} from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { Loader } from '../../../core/enums/loader.enum';
import { Incident } from '../../models/incident';
import { ReportsService } from '../../services/reports.service';
import { ClientsService } from '../../../client/services/clients.service';
import { ngxCsv } from 'ngx-csv';

@Component({
  selector: 'app-accidents',
  templateUrl: './accidents.component.html',
  styleUrls: ['./accidents.component.scss'],
})
export class AccidentsComponent implements OnInit {
  private _hubConnection!: HubConnection;
  id!: string;
  dowenload: any[] = [];
  delete!: boolean;
  data: any;
  allData!: Incident[];
  filter: boolean = false;
  clientFilter: boolean = false;
  branchFilter: boolean = false;
  myFile!: any;
  pageNumber = 1;
  pageSize = 5;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  date = new FormControl({ 0: new Date(), 1: new Date() });
  report!: any[];
  maxDate = new Date();
  yesterday!: Date;
  display: boolean = false;
  selectedGallery!: any[];
  searchKey = '';
  clientData!: any[];
  clientSites: any = []
  branches: any = []
  dateFilter: boolean = false;
  companyId!: any;
  securityCompanyClientId!: any;
  locationId!: any;
  start!: any;
  end!: any;
  branchId!: any;
  isMainBranch:boolean=false;
  constructor(
    private reports: ReportsService,
    private auth: AuthService,
    public lang: LangService,
    private route: ActivatedRoute,
    private localeService: BsLocaleService,
    private client: ClientsService
  ) {
    this.yesterday = new Date();
    this.yesterday.setDate(this.yesterday.getDate() - 1);
    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.isMainBranch = true;
      console.log(isMainBranch);
    } else {
      this.isMainBranch = false;
      console.log(isMainBranch);
    }
    this.initDatePiker();
    this.connectHub();
  }

  ngOnInit(): void {
    this.companyId = this.auth.snapshot.userInfo?.id;
    this.getAllReports()
    this.onDateChange();
  }



  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
    this.getAllReports();
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
    this.getAllReports();
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

  connectHub() {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(environment.hub)
      .build();

    this._hubConnection
      .start()
      .then(() => {
        this._hubConnection.invoke(
          'AddToGroup',
          `${this.auth.snapshot.userInfo?.id}-incident`
        );

        this._hubConnection.on('ReceiveMessage', (x, y) => {
          this.getAllReports();
        });
      })
      .catch((err) =>
        console.log('error while establishing signalr connection')
      );
  }



  onDateChange() {
    this.date.valueChanges
      .pipe(
        map((val: any) => ({
          start: convertDateToString(val[0]),
          end: convertDateToString(val[1]),
        }))
      )
      .subscribe((val) => {
        this.pageNumber = 1
        this.pageSize = 5
        // if (this.clientFilter) {
        //    this.getClients();
        // }
        this.getAllReports()
      });
  }

  openGallery(gallery: any) {
    let allImages:any=[]
    gallery.forEach((ele:any) => {
      allImages.push(ele.attachment.fullLink)
    });
    this.selectedGallery = allImages;
    this.display = true;
    console.log(this.selectedGallery);

  }

  // getClients() {
  //   this.client.getClientsBySecurityCompany(1, 20000).subscribe((res) => {
  //     this.data = res.data;
  //   });
  // }


  getClients() {
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    this.reports.GlobalApiFilterGetAllSecurityCompanyClientForUserSecurity(AppUserId).subscribe((res) => {
      this.data = res;
    })
  }

  getDataFilter(filter: string) {
    this.filter = true;
    if (filter == 'branch') {
      this.clientFilter = false;
      this.branchFilter = true
    } else if (filter == 'client') {
      this.clientFilter = true;
      this.branchFilter = false
    } else {
      this.dateFilter = true;
      this.clientFilter = false;
      this.branchFilter = false
    }
  }

  deleteFilter() {
    this.filter = false;
    this.clientFilter = false;
    this.branchFilter = false;
    this.data = null;
    this.clientSites = [];
    this.branches = []
    this.branchId = []
    this.locationId = []
    this.securityCompanyClientId = []
    this.pageNumber = 1
    this.pageSize = 5
    this.delete = true;
    this.getAllReports();
  }
  getBranches() {
    this.reports.GlobalApiFilter_GetAllSecurityBranch(this.companyId).subscribe((res) => {
      this.branches = res;
    });
  }
  getByBranchId({ value }: any) {
    this.branchId = [value.id]
    this.pageNumber = 1
    this.pageSize = 5
    this.getAllReports();
  }



  options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    showTitle: false,
    title: 'My Report',
    useBom: true,
    noDownload: false,
    headers: [
      'نوع الحادث',
      'السبب',
      '	رقم الجوال',
      'بتاريخ',
      'الوصف',
      'الموقع',
      'الإجراء المضاد',
      'الحارس المسؤول	',
      'مشرف الأمن',
      'المناوبة',
    ],
  };
  getData() {
    this.dowenload = [];
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    let model = {
      "securityCompanyId": this.companyId,
      "appUserId": AppUserId,
      "securityCompanyClientList": this.securityCompanyClientId,
      "securityCompanyBranchList": this.branchId,
      "clientSitesList": this.locationId,
      "startDate": this.start,
      "endDate": this.end,
      "page": 1,
      "pageSize": this.total,
      "searchKeyWord": this.searchKey
    }
    this.reports.IncidentsReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
      if (res) {
        this.allData = res.data
        for (let i = 0; i < this.allData.length; i++) {
          let incidentType = '';
          let reason = '';
          let isComplete = '';
          let totalWorkTime = '';
          let totalMustWorkTime = '';
          let toTalBreakTime = '';
          let totalExtraTime = '';
          if (this.allData[i].incidentType) {
            incidentType = this.allData[i].incidentType?.nameAr;
          } else {
            incidentType = 'لا يوجد';
          }
          if (this.allData[i].reason) {
            reason = this.allData[i].reason
          } else {
            reason = 'لا يوجد سبب';
          }
          // if (this.allData[i].isComplete) {
          //   isComplete = 'نعم';
          // } else {
          //   isComplete = 'لا';
          // }
          // if (this.allData[i].toTalBreakTime) {
          //   toTalBreakTime = this.allData[i].toTalBreakTime;
          // } else {
          //   toTalBreakTime = 'ليس في استراحة';
          // }
          // if (this.allData[i].totalWorkTime) {
          //   totalWorkTime = this.report[i].totalWorkTime;
          // } else {
          //   totalWorkTime = 'لا يوجد';
          // }
          // if (this.allData[i].totalExtraTime) {
          //   totalExtraTime = this.allData[i].totalExtraTime;
          // } else {
          //   totalExtraTime = 'لم يتم العمل لوقت إضافي';
          // }
          // if (this.allData[i].totalMustWorkTime) {
          //   totalMustWorkTime = this.allData[i].totalMustWorkTime;
          // } else {
          //   totalMustWorkTime = 'لا يوجد';
          // }
          let field = {
            incidentType: this.allData[i].incidentType?.nameAr
              ? this.allData[i].incidentType?.nameAr
              : 'لا يوجد',
            reason: this.allData[i].reason ? this.allData[i].reason : 'لا يوجد',
            phoneNumber:
              this.allData[i].companySecurityGuard.securityGuard?.appUser?.userName,
            createdDateTime: this.allData[i].created,
            description: this.allData[i].description
              ? this.allData[i].description
              : 'لا يوجد',
            siteLocation: this.allData[i].siteLocation
              ? this.allData[i].siteLocation?.name
              : 'لا يوجد',
            actionToken: this.allData[i].actionToken
              ? this.allData[i].actionToken
              : 'لا يوجد',
            securityGuard: this.allData[i]?.companySecurityGuard?.securityGuard
              ?.firstName
              ? this.allData[i]?.companySecurityGuard?.securityGuard?.firstName +
              ' ' +
              this.allData[i]?.companySecurityGuard?.securityGuard?.lastName
              : 'لا يوجد',
            siteSupervisorShift: this.allData[i].siteSupervisorShift
              ?.companySecurityGuard?.securityGuard?.firstName
              ? this.allData[i].siteSupervisorShift?.companySecurityGuard
                ?.securityGuard?.firstName +
              ' ' +
              this.allData[i].siteSupervisorShift?.companySecurityGuard
                ?.securityGuard?.lastName
              : 'لا يوجد',
            siteShift: (this.allData[i].siteSupervisorShift?.clientShiftSchedule?.companyShift
              .shiftType) ?
              this.allData[i].siteSupervisorShift?.clientShiftSchedule?.companyShift
                .shiftType?.name : 'لا يوجد',
            GuardCode: this.allData[i].companySecurityGuard.securityGuard.id,
            Name:
              this.allData[i].companySecurityGuard.securityGuard.firstName +
              ' ' +
              this.allData[i].companySecurityGuard.securityGuard.lastName,
            // StartTime: this.allData[i].startTime,
            // MustStart: this.allData[i].mustStartDateTime,
            // MustEndIn: this.allData[i].mustEndDateTime,
            // breakComplete: reason,
            // isComplete: isComplete,
            // TotalWorkTime: totalWorkTime,
            // TotalBreakTime: toTalBreakTime,
            // TotalExtraTime: totalExtraTime,
            // TotalMustWorkTime: totalMustWorkTime,
            //TotalMustBreakTime: this.allData[i].toTalMustBreakTime,
          };
          this.dowenload.push(field);
        }
        this.downloadData(this.dowenload)
      }
    })
  }

  exportCSV() {
    this.getData();
    new ngxCsv(this.dowenload, 'My Report', this.options);
    this.dowenload = [];
  }
  // exportexcel(): void {
  //   let fileName = 'accidents.xlsx';
  //   let element = document.getElementById('excel-table');
  //   const ws: any = XLSX.utils.table_to_sheet(element);
  //   const range = XLSX.utils.decode_range(ws['!ref']);
  //   const phoneNumberColumnIndex = 2;
  //   const showColumnIndex = 9;
  //   for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
  //     const cellAddress1 = XLSX.utils.encode_cell({ r: rowNum, c: phoneNumberColumnIndex });
  //     const cellAddress2 = XLSX.utils.encode_cell({ r: rowNum, c: showColumnIndex });
  //     const cell1 = ws[cellAddress1];
  //     const cell2 = ws[cellAddress2];
  //     if (cell2) {
  //       cell2.s = { hidden: true };
  //     }
  //     console.log(cell2);

  //     if (cell1 && cell1.t === 'n') {
  //       cell1.t = 's'; // Change the cell1 type to string
  //       cell1.v = String(cell1.v); // Convert the value to a string
  //     }
  //   }
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  //   XLSX.writeFile(wb, fileName);
  // }
  downloadData(data: any[]) {
    // Create a workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Convert the workbook to an XLSX file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob from the buffer
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Save the file using FileSaver.js
    saveAs(blob, 'acidantReport.xlsx');
  }



  search() {
    this.pageNumber = 1
    this.pageSize = 5
    this.getAllReports()
  }

  getAllReports() {
    let date: any;

    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    let model
    if (this.filter == false) {
      date = convertDateToString(new Date());
      this.start = date;
      this.end = date;
      this.securityCompanyClientId = []
      this.locationId = []
      this.branchId = []
    } else {
      date = this.date.value;
      this.start = convertDateToString(date[0]);
      this.end = convertDateToString(date[1]);
      if (this.clientFilter || this.branchFilter) {
        this.getClients();
      }
    }

    model = {
      "securityCompanyId": this.companyId,
      "appUserId": AppUserId,
      "securityCompanyClientList": this.securityCompanyClientId,
      "securityCompanyBranchList": this.branchId,
      "clientSitesList": this.locationId,
      "startDate": this.start,
      "endDate": this.end,
      "page": this.pageNumber,
      "pageSize": this.pageSize,
      "searchKeyWord": this.searchKey
    }
    this.reports.IncidentsReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
      this.report = res.data
      this.total = res.totalCount;
    })
  }

  selectClient({ value }: any) {
    console.log(value);
    this.locationId = []
    this.branchId = []
    this.securityCompanyClientId = [value.id]
    this.pageNumber = 1
    this.pageSize = 5
    if (this.clientFilter) {
      this.getAllSites();
    }
    if (this.branchFilter) {
      this.getBranches();
    }
    this.getAllReports();
  }

  getAttendanceBySiteId({ value }: any) {
    this.locationId = [value.id]
    this.pageNumber = 1
    this.pageSize = 5
    this.getAllReports();

  }
  getAllSites() {
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    this.reports.GlobalApiFilterGetAllSiteLocationByUserAndSCForUserSecurity(this.securityCompanyClientId, AppUserId).subscribe((res) => {
      this.clientSites = res
    })
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._hubConnection.stop();
  }

}
