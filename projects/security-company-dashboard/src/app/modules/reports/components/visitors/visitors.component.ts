import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { LangService, PAGINATION_SIZES, Roles, convertDateToString, language } from 'projects/tools/src/public-api';
import { ReportsService } from '../../services/reports.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ClientsService } from '../../../client/services/clients.service';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { map } from 'rxjs';
import { ngxCsv } from 'ngx-csv';
import * as XLSX from 'xlsx';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-visitors',
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.scss'],
})
export class VisitorsComponent implements OnInit {
  private _hubConnection!: HubConnection;
  allData!: any[];
  id!: number;
  delete!: boolean;
  data: any;
  filter: boolean = false;
  clientData!: any[];
  clientFilter: boolean = false;
  branchFilter: boolean = false;
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  date = new FormControl(new Date());
  visitorsReport!: any[];
  maxDate = new Date();
  searchKey = '';
  dowenload: any[] = [];
  clientSites: any = []
  dateFilter: boolean = false;
  companyId!: any;
  securityCompanyClientId!: any;
  locationId!: any;
  start!: any;
  end!: any;
  branches: any = []
  branchId!: any;
  isMainBranch: boolean = false;
  constructor(
    private reports: ReportsService,
    private auth: AuthService,
    public lang: LangService,
    private route: ActivatedRoute,
    private localeService: BsLocaleService,
    private client: ClientsService
  ) {
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
    this.getAllReports();
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
          `${this.auth.snapshot.userInfo?.id}-visitors`
        );

        this._hubConnection.on('ReceiveMessage', () => {
          this.getAllReports();
        });
      })
      .catch((err) =>
        console.log('error while establishing signalr connection')
      );
  }


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

  // getClients() {
  //   this.client.getClientsBySecurityCompany(1, 20000).subscribe((res) => {
  //     this.data = res.data;
  //   });
  // }
  // getClients() {
  //   let role = this.auth.snapshot.userIdentity?.role;
  //   let isMainBranch =
  //     this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch;
  //   if (role == Roles.SecuritCompany || isMainBranch) {
  //     this.client.getClientsBySecurityCompany(1, 20000).subscribe((res) => {
  //       this.data = res.data;
  //     });
  //   } else {
  //     this.client.getClientsByBranchId(1, 20000).subscribe((res) => {
  //       this.data = res.data;
  //     });
  //   }
  // }
  // getReports() {
  //   let date = convertDateToString(this.date.value);
  //   if (this.delete) {
  //     date = convertDateToString(new Date());
  //   }
  //   if (!this.clientFilter) {
  //     this.getVisitors(date, Loader.no);
  //   } else {
  //     this.getVistorByClient();
  //   }
  // }
  // getVistorByClient() {
  //   let myData: VisitorsReport[] = [];
  //   this.visitorsReport = this.allData
  //   this.visitorsReport.filter((ele: any) => {
  //     if (
  //       ele.siteSupervisorShift.clientSite.securityCompanyClientId == this.id
  //     ) {
  //       myData.push(ele);
  //     }
  //   });
  //   this.visitorsReport = myData;
  //   this.visitorsReport.forEach((element) => {
  //     element.name = element.companySecurityGuard.securityGuard.firstName +
  //       " " +
  //       element.companySecurityGuard.securityGuard?.middleName +
  //       " " +
  //       element.companySecurityGuard.securityGuard.lastName
  //     element.superVisor = element.siteSupervisorShift?.companySecurityGuard
  //       .securityGuard.firstName +
  //       " " +
  //       element.siteSupervisorShift?.companySecurityGuard
  //         .securityGuard?.middleName +
  //       " " +
  //       element.siteSupervisorShift?.companySecurityGuard
  //         .securityGuard.lastName
  //   })
  //   this.clientData = myData
  //   this.search()
  // }


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
    this.reports.VisitorReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
      if (res) {
        this.allData = res.data;
        for (let i = 0; i < this.allData.length; i++) {
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
            visitorName: this.allData[i].visitorName,
            phoneNumber: this.allData[i].vistorPhoneNumber,
            siteLocation: this.allData[i].siteLocation.name,
            visitorType: this.allData[i].visitorType.nameAr,
            hostName: this.allData[i].hostName,
            vistorReason: this.allData[i].vistorReason,
            date: this.allData[i].created.split(" ")[0],
            guard:
              this.allData[i].companySecurityGuard.securityGuard.firstName +
              ' ' +
              this.allData[i].companySecurityGuard.securityGuard.lastName,
            shift:
              this.allData[i].siteSupervisorShift.companySecurityGuard
                .securityGuard.firstName +
              ' ' +
              this.allData[i].siteSupervisorShift.companySecurityGuard
                .securityGuard.lastName,
            enterTime: this.allData[i].enterTime,
            leaveTime: this.allData[i].leaveTime,
            note: this.allData[i].notes,
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
    this.reports.VisitorReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
      this.visitorsReport = res.data
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
  getBySiteId({ value }: any) {
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
