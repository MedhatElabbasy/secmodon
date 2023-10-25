import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { map, Observable } from 'rxjs';
import * as XLSX from 'xlsx';

import {
  convertDateToString,
  LangService,
  language,
  PAGINATION_SIZES,
  Roles,
} from 'projects/tools/src/public-api';
import { AuthService } from '../../../auth/services/auth.service';
import { Loader } from '../../../core/enums/loader.enum';
import { VisitorsReport } from '../../models/visitors-report';
import { ReportsService } from '../../services/reports.service';
import { ClientsService } from '../../../client/services/clients.service';
import { ngxCsv } from 'ngx-csv';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-visitors',
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.scss'],
})
export class VisitorsComponent implements OnInit {
  private _hubConnection!: HubConnection;
  allData!: VisitorsReport[];
  id!: number;
  delete!: boolean;
  data: any;
  filter: boolean = false;
  clientData!: any[];
  clientFilter: boolean = false;
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  date = new FormControl(new Date());
  visitorsReport!: any[];
  maxDate = new Date();
  searchKey = '';
  dowenload: any[] = [];

  constructor(
    private reports: ReportsService,
    private auth: AuthService,
    public lang: LangService,
    private route: ActivatedRoute,
    private localeService: BsLocaleService,
    private client: ClientsService
  ) {
    this.initDatePiker();
    this.connectHub();
  }

  ngOnInit(): void {
    this.onDateChange();
    this.route.data.subscribe((res) => {
      this.visitorsReport = res['report'];
      this.visitorsReport.forEach((element) => {
        element.name = element.companySecurityGuard.securityGuard.firstName +
          " " +
          element.companySecurityGuard.securityGuard?.middleName +
          " " +
          element.companySecurityGuard.securityGuard.lastName
        element.superVisor = element.siteSupervisorShift?.companySecurityGuard
          .securityGuard.firstName +
          " " +
          element.siteSupervisorShift?.companySecurityGuard
            .securityGuard?.middleName +
          " " +
          element.siteSupervisorShift?.companySecurityGuard
            .securityGuard.lastName
      })
      this.allData = res['report'];
    });
  }

  getVisitors(date: string, loader: Loader) {
    let isMain = this.auth.snapshot.userIdentity?.roles.includes(
      Roles.VirtualAdmin
    );
    let report$: Observable<VisitorsReport[]>;
    if (isMain) {
      report$ = this.reports.attendanceReportForCompany(date, loader);
    } else {
      report$ = this.reports.attendanceReportForBranch(date, loader);
    }

    report$.subscribe((res) => {
      this.visitorsReport = res;
      this.visitorsReport.forEach((element) => {
        element.name = element.companySecurityGuard.securityGuard.firstName +
          " " +
          element.companySecurityGuard.securityGuard?.middleName +
          " " +
          element.companySecurityGuard.securityGuard.lastName
        element.superVisor = element.siteSupervisorShift?.companySecurityGuard
          .securityGuard.firstName +
          " " +
          element.siteSupervisorShift?.companySecurityGuard
            .securityGuard?.middleName +
          " " +
          element.siteSupervisorShift?.companySecurityGuard
            .securityGuard.lastName
      })
      this.allData = res
      this.search()
    });
  }

  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
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
          `${this.auth.snapshot.userInfo?.id}-visitors`
        );

        this._hubConnection.on('ReceiveMessage', () => {
          this.getReports();
        });
      })
      .catch((err) =>
        console.log('error while establishing signalr connection')
      );
  }
  // getClients() {
  //   this.client.getClientsBySecurityCompany(1, 20000).subscribe((res) => {
  //     this.data = res.data;
  //   });
  // }
  getClients() {
    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch =
      this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch;
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
  getReports() {
    let date = convertDateToString(this.date.value);
    if (this.delete) {
      date = convertDateToString(new Date());
    }
    if (!this.clientFilter) {
      this.getVisitors(date, Loader.no);
    } else {
      this.getVistorByClient();
    }
  }
  getVistorByClient() {
    let myData: VisitorsReport[] = [];
    this.visitorsReport = this.allData
    this.visitorsReport.filter((ele: any) => {
      if (
        ele.siteSupervisorShift.clientSite.securityCompanyClientId == this.id
      ) {
        myData.push(ele);
      }
    });
    this.visitorsReport = myData;
    this.visitorsReport.forEach((element) => {
      element.name = element.companySecurityGuard.securityGuard.firstName +
        " " +
        element.companySecurityGuard.securityGuard?.middleName +
        " " +
        element.companySecurityGuard.securityGuard.lastName
      element.superVisor = element.siteSupervisorShift?.companySecurityGuard
        .securityGuard.firstName +
        " " +
        element.siteSupervisorShift?.companySecurityGuard
          .securityGuard?.middleName +
        " " +
        element.siteSupervisorShift?.companySecurityGuard
          .securityGuard.lastName
    })
    this.clientData = myData
    this.search()
  }
  getDataFilter(filter: string) {
    this.filter = true;
    this.clientFilter = false;
    this.data = null;
    if (filter == 'client') {
      this.clientFilter = true;
    }
  }
  displayFilter(event: any) {
    this.id = event.value;
    this.delete = false;
    this.getReports();
  }
  deleteFilter() {
    this.filter = false;
    this.clientFilter = false;
    this.data = null;
    this.delete = true;
    this.getReports();
  }
  onDateChange() {
    this.date.valueChanges
      .pipe(map((val) => convertDateToString(val)))
      .subscribe((val) => {
        this.getVisitors(val, Loader.yes);
        if (this.clientFilter) {
          this.getClients();
        }
      });
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
      'اسم الزائر',
      'رقم الجوال',
      'اسم الموقع',
      'نوع الزيارة',
      'اسم المضيف',
      'سبب الزيارة',
      'بتاريخ',
      'الحارس المسؤول',
      'مشرف الأمن',
      'وقت الدخول	وقت المغادرة',
      'مشرف الأمن',
      'ملاحظات',
    ],
  };

  getData() {
    this.dowenload=[]
    for (let i = 0; i < this.visitorsReport.length; i++) {
      // let incidentType = '';
      // let reason = '';
      // let isComplete = '';
      // let totalWorkTime = '';
      // let totalMustWorkTime = '';
      // let toTalBreakTime = '';
      // let totalExtraTime = '';
      // if (this.visitorsReport[i].incidentType) {
      //   incidentType = this.visitorsReport[i].incidentType?.nameAr;
      // } else {
      //   incidentType = 'لا يوجد';
      // }
      // if (this.visitorsReport[i].reason) {
      //   reason = this.visitorsReport[i].reason
      // } else {
      //   reason = 'لا يوجد سبب';
      // }
      // if (this.visitorsReport[i].isComplete) {
      //   isComplete = 'نعم';
      // } else {
      //   isComplete = 'لا';
      // }
      // if (this.visitorsReport[i].toTalBreakTime) {
      //   toTalBreakTime = this.visitorsReport[i].toTalBreakTime;
      // } else {
      //   toTalBreakTime = 'ليس في استراحة';
      // }
      // if (this.visitorsReport[i].totalWorkTime) {
      //   totalWorkTime = this.visitorsReport[i].totalWorkTime;
      // } else {
      //   totalWorkTime = 'لا يوجد';
      // }
      // if (this.visitorsReport[i].totalExtraTime) {
      //   totalExtraTime = this.visitorsReport[i].totalExtraTime;
      // } else {
      //   totalExtraTime = 'لم يتم العمل لوقت إضافي';
      // }
      // if (this.visitorsReport[i].totalMustWorkTime) {
      //   totalMustWorkTime = this.visitorsReport[i].totalMustWorkTime;
      // } else {
      //   totalMustWorkTime = 'لا يوجد';
      // }
      let field = {
        visitorName: this.visitorsReport[i].visitorName,
        phoneNumber: this.visitorsReport[i].vistorPhoneNumber,
        siteLocation: this.visitorsReport[i].siteLocation.name,
        visitorType: this.visitorsReport[i].visitorType.nameAr,
        hostName: this.visitorsReport[i].hostName,
        vistorReason: this.visitorsReport[i].vistorReason,
        createdSinceTime: this.visitorsReport[i].createdSinceTime,
        guard:
          this.visitorsReport[i].companySecurityGuard.securityGuard.firstName +
          ' ' +
          this.visitorsReport[i].companySecurityGuard.securityGuard.lastName,
        shift:
          this.visitorsReport[i].siteSupervisorShift.companySecurityGuard
            .securityGuard.firstName +
          ' ' +
          this.visitorsReport[i].siteSupervisorShift.companySecurityGuard
            .securityGuard.lastName,
        enterTime: this.visitorsReport[i].enterTime,
        leaveTime: this.visitorsReport[i].leaveTime,
        note: this.visitorsReport[i].notes,
      };
      this.dowenload.push(field);
    }
    this.downloadData(this.dowenload)
  }
  exportCSV() {
    this.getData();
    new ngxCsv(this.dowenload, 'My Report', this.options);
    this.dowenload = [];
  }
  // exportexcel(): void {
  //   let fileName = 'visitors.xlsx';
  //   let element = document.getElementById('excel-table');
  //   const ws: any = XLSX.utils.table_to_sheet(element);

  //   // Convert phone number column to string
  //   const range = XLSX.utils.decode_range(ws['!ref']);
  //   const phoneNumberColumnIndex = 1; // Assuming the phone number column is the third column (index 2)
  //   for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
  //     const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: phoneNumberColumnIndex });
  //     const cell = ws[cellAddress];
  //     if (cell && cell.t === 'n') {
  //       cell.t = 's'; // Change the cell type to string
  //       cell.v = String(cell.v); // Convert the value to a string
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
    saveAs(blob, 'vistorReport.xlsx');
  }
  search() {
    if (this.clientFilter) {
      this.visitorsReport = this.clientData
    } else {
      this.visitorsReport = this.allData

    }
    let myData: any[] = [];
    if (this.searchKey != '') {

      this.visitorsReport.filter((ele: any) => {
        let name = ele.visitorName
        let phone = ele.vistorPhoneNumber
        let host = ele.hostName
        let type
        if (this.lang.currentLang == 'ar') {
          type = ele.visitorType.nameAr
        }
        else {
          type = ele.visitorType.nameEn
        }
        type?.replace(/\s/g, '')
        if (
          host?.includes(this.searchKey.replace(/\s/g, '')) || type?.includes(this.searchKey.replace(/\s/g, '')) || name?.includes(this.searchKey.replace(/\s/g, '')) || phone?.includes(this.searchKey.replace(/\s/g, ''))
        ) {
          myData.push(ele);
        }
      });
      this.visitorsReport = myData;
    } else {
      if (this.clientFilter) {

        if (this.clientData) {
          this.visitorsReport = this.clientData
        } else {
          this.visitorsReport = this.allData
        }
      } else {
        this.visitorsReport = this.allData

      }
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._hubConnection.stop();
  }
}
