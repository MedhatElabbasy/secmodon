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
  myFile!: any;
  pageNumber = 1;
  pageSize = 10;
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
    this.initDatePiker();
    this.connectHub();
  }

  ngOnInit(): void {
    this.onDateChange();
    this.route.data.subscribe((res) => {
      this.report = res['report'];
      this.report.forEach((element) => {
        element.guard = element?.companySecurityGuard.securityGuard.firstName +
          " " +
          element?.companySecurityGuard?.securityGuard?.middleName +
          " " +
          element?.companySecurityGuard?.securityGuard?.lastName;

        element.superVisor = element.siteSupervisorShift?.companySecurityGuard
          ?.securityGuard?.firstName +
          " " +
          element.siteSupervisorShift?.companySecurityGuard
            ?.securityGuard?.middleName +
          " " +
          element.siteSupervisorShift?.companySecurityGuard
            ?.securityGuard?.lastName
      })
      this.allData = res['report']
    });
  }

  getIncident(startDate: string, endDate: string, loader: Loader) {
    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.reports
        .getAllAccidentByCompany(startDate, endDate, Loader.yes)
        .subscribe((res) => {
          this.report = res;
          this.report.forEach((element) => {
            element.guard = element?.companySecurityGuard.securityGuard.firstName +
              " " +
              element?.companySecurityGuard?.securityGuard?.middleName +
              " " +
              element?.companySecurityGuard?.securityGuard?.lastName;

            element.superVisor = element.siteSupervisorShift?.companySecurityGuard
              ?.securityGuard?.firstName +
              " " +
              element.siteSupervisorShift?.companySecurityGuard
                ?.securityGuard?.middleName +
              " " +
              element.siteSupervisorShift?.companySecurityGuard
                ?.securityGuard?.lastName
          })
          this.allData = res
          this.search()

        });
    }
    else {
      this.reports
        .getAllAccidentByBranch(startDate, endDate, Loader.yes)
        .subscribe((res) => {
          this.report = res;
          this.report.forEach((element) => {
            element.guard = element?.companySecurityGuard.securityGuard.firstName +
              " " +
              element?.companySecurityGuard?.securityGuard?.middleName +
              " " +
              element?.companySecurityGuard?.securityGuard?.lastName;

            element.superVisor = element.siteSupervisorShift?.companySecurityGuard
              ?.securityGuard?.firstName +
              " " +
              element.siteSupervisorShift?.companySecurityGuard
                ?.securityGuard?.middleName +
              " " +
              element.siteSupervisorShift?.companySecurityGuard
                ?.securityGuard?.lastName
          })
          this.allData = res
          this.search()

        });
    }
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
          `${this.auth.snapshot.userInfo?.id}-incident`
        );

        this._hubConnection.on('ReceiveMessage', (x, y) => {
          this.getReports();
        });
      })
      .catch((err) =>
        console.log('error while establishing signalr connection')
      );
  }

  getReports() {
    let date: any;
    let start;
    let end;
    date = this.date.value;
    start = convertDateToString(date[0]);
    end = convertDateToString(date[1]);
    if (this.delete) {
      date = convertDateToString(new Date());
      start = date;
      end = date;
    }
    if (!this.clientFilter) {
      this.getIncident(start, end, Loader.no);
    } else {
      this.getByClient();
    }
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
        this.getIncident(val.start, val.end, Loader.yes);
        if (this.clientFilter) {
          this.getClients();
        }
      });
  }

  openGallery(gallery: any[]) {
    this.selectedGallery = gallery;
    console.log(gallery);
    
    this.display = true;
  }

  // getClients() {
  //   this.client.getClientsBySecurityCompany(1, 20000).subscribe((res) => {
  //     this.data = res.data;
  //   });
  // }

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

  getByClient() {
    this.report = this.allData
    let myData: Incident[] = [];
    this.report.filter((ele: any) => {
      if (
        ele.siteSupervisorShift.clientShiftSchedule.securityCompanyClientId ==
        this.id
      ) {
        myData.push(ele);
      }
    });
    this.report = myData;
    this.report.forEach((element) => {
      element.guard = element?.companySecurityGuard.securityGuard.firstName +
        " " +
        element?.companySecurityGuard?.securityGuard?.middleName +
        " " +
        element?.companySecurityGuard?.securityGuard?.lastName;

      element.superVisor = element.siteSupervisorShift?.companySecurityGuard
        ?.securityGuard?.firstName +
        " " +
        element.siteSupervisorShift?.companySecurityGuard
          ?.securityGuard?.middleName +
        " " +
        element.siteSupervisorShift?.companySecurityGuard
          ?.securityGuard?.lastName
    })
    this.clientData = myData
    this.search()
  }
  deleteFilter() {
    this.filter = false;
    this.clientFilter = false;
    this.data = null;
    this.delete = true;
    this.getReports();
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
    this.dowenload = []
    for (let i = 0; i < this.report.length; i++) {
      let incidentType = '';
      let reason = '';
      let isComplete = '';
      let totalWorkTime = '';
      let totalMustWorkTime = '';
      let toTalBreakTime = '';
      let totalExtraTime = '';
      if (this.report[i].incidentType) {
        incidentType = this.report[i].incidentType?.nameAr;
      } else {
        incidentType = 'لا يوجد';
      }
      if (this.report[i].reason) {
        reason = this.report[i].reason
      } else {
        reason = 'لا يوجد سبب';
      }
      if (this.report[i].isComplete) {
        isComplete = 'نعم';
      } else {
        isComplete = 'لا';
      }
      if (this.report[i].toTalBreakTime) {
        toTalBreakTime = this.report[i].toTalBreakTime;
      } else {
        toTalBreakTime = 'ليس في استراحة';
      }
      if (this.report[i].totalWorkTime) {
        totalWorkTime = this.report[i].totalWorkTime;
      } else {
        totalWorkTime = 'لا يوجد';
      }
      if (this.report[i].totalExtraTime) {
        totalExtraTime = this.report[i].totalExtraTime;
      } else {
        totalExtraTime = 'لم يتم العمل لوقت إضافي';
      }
      if (this.report[i].totalMustWorkTime) {
        totalMustWorkTime = this.report[i].totalMustWorkTime;
      } else {
        totalMustWorkTime = 'لا يوجد';
      }
      let field = {
        incidentType: this.report[i].incidentType?.nameAr
          ? this.report[i].incidentType?.nameAr
          : 'لا يوجد',
        reason: this.report[i].reason ? this.report[i].reason : 'لا يوجد',
        phoneNumber:
          this.report[i].companySecurityGuard.securityGuard?.appUser?.userName,
        createdDateTime: this.report[i].created,
        description: this.report[i].description
          ? this.report[i].description
          : 'لا يوجد',
        siteLocation: this.report[i].siteLocation
          ? this.report[i].siteLocation?.name
          : 'لا يوجد',
        actionToken: this.report[i].actionToken
          ? this.report[i].actionToken
          : 'لا يوجد',
        securityGuard: this.report[i]?.companySecurityGuard?.securityGuard
          ?.firstName
          ? this.report[i]?.companySecurityGuard?.securityGuard?.firstName +
          ' ' +
          this.report[i]?.companySecurityGuard?.securityGuard?.lastName
          : 'لا يوجد',
        siteSupervisorShift: this.report[i].siteSupervisorShift
          ?.companySecurityGuard?.securityGuard?.firstName
          ? this.report[i].siteSupervisorShift?.companySecurityGuard
            ?.securityGuard?.firstName +
          ' ' +
          this.report[i].siteSupervisorShift?.companySecurityGuard
            ?.securityGuard?.lastName
          : 'لا يوجد',
        siteShift: (this.report[i].siteSupervisorShift?.clientShiftSchedule?.companyShift
          .shiftType) ?
          this.report[i].siteSupervisorShift?.clientShiftSchedule?.companyShift
            .shiftType?.name : 'لا يوجد',
        GuardCode: this.report[i].companySecurityGuard.securityGuard.id,
        Name:
          this.report[i].companySecurityGuard.securityGuard.firstName +
          ' ' +
          this.report[i].companySecurityGuard.securityGuard.lastName,
        StartTime: this.report[i].startTime,
        MustStart: this.report[i].mustStartDateTime,
        MustEndIn: this.report[i].mustEndDateTime,
        breakComplete: reason,
        isComplete: isComplete,
        TotalWorkTime: totalWorkTime,
        TotalBreakTime: toTalBreakTime,
        TotalExtraTime: totalExtraTime,
        TotalMustWorkTime: totalMustWorkTime,
        TotalMustBreakTime: this.report[i].toTalMustBreakTime,
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
    if (this.clientFilter) {
      this.report = this.clientData
    } else {
      this.report = this.allData

    }
    let myData: any[] = [];
    if (this.searchKey != '') {

      this.report.filter((ele: any) => {
        let name = ele?.companySecurityGuard?.securityGuard?.firstName +
          ele?.companySecurityGuard?.securityGuard?.middleName +
          ele?.companySecurityGuard?.securityGuard?.lastName
        let phone = ele.companySecurityGuard.securityGuard?.appUser?.userName
        let type
        if (this.lang.currentLang == 'ar') {
          type = ele.incidentType?.nameAr
        }
        else {
          type = ele.incidentType?.nameEn
        }
        type?.replace(/\s/g, '')
        if (
          type?.includes(this.searchKey.replace(/\s/g, '')) || name.includes(this.searchKey.replace(/\s/g, '')) || phone.includes(this.searchKey.replace(/\s/g, ''))
        ) {
          myData.push(ele);
        }
      });
      this.report = myData;
    } else {
      if (this.clientFilter) {

        if (this.clientData) {
          this.report = this.clientData
        } else {
          this.report = this.allData
        }
      } else {
        this.report = this.allData

      }

    }
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._hubConnection.stop();
  }
}
