
import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from 'projects/security-company-dashboard/src/environments/environment';
import { map } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  convertDateToString,
  LangService,
  language,
  PAGINATION_SIZES,
  Roles,
} from 'projects/tools/src/public-api';
import { ngxCsv } from 'ngx-csv';
import { AttendanceReport } from '../../../models/attendance-report';
import { ReportsService } from '../../../services/reports.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { PackagesService } from '../../../../packages/services/packages.service';
import { ClientsService } from '../../../../client/services/clients.service';
import { Loader } from '../../../../core/enums/loader.enum';
import { ClientSiteService } from '../../../../client/services/client-site.service';
@Component({
  selector: 'app-guard',
  templateUrl: './guard.component.html',
  styleUrls: ['./guard.component.scss'],
})
export class GuardComponent implements OnInit {
  private _hubConnection!: HubConnection;
  id!: number;
  delete!: boolean;
  data: any;
  filter: boolean = false;
  clientFilter: boolean = false;
  pageNumber = 1;
  pageSize = 5;
  total!: number;
  allData: any[] = []
  sizes = [...PAGINATION_SIZES];
  date = new FormControl();
  report!: any[];
  maxDate = new Date();
  myFile!: any;
  yesterday!: Date;
  searchKey = '';
  dowenload: any[] = [];
  private arrShowedInTableValue: any = [];
  totalWorkTime: any;
  clientSites: any = []
  branchId!: any;
  dateFilter: boolean = false;
  branchFilter: boolean = false;
  companyId!: any;
  securityCompanyClientId!: any;
  locationId!: any;
  start!: any;
  end!: any;
  branches: any = [];
  isMainBranch:boolean=false;
  constructor(
    private reports: ReportsService,
    private auth: AuthService,
    public lang: LangService,
    private route: ActivatedRoute,
    private localeService: BsLocaleService,
    private PackagesService: PackagesService,
    private client: ClientsService,
    private _ClientSiteService: ClientSiteService
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
          `${this.auth.snapshot.userInfo?.id}-attendance`
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
      ' كود الحارس',
      'الاسم',
      '	رقم الجوال',
      'التاريخ',
      'أسم الموقع',
      'تم التسجيل بواسطة',
      '	وقت الدخول',
      'الوقت الرسمي لبداية الدوام',
      '	وقت الخروج',
      '	الوقت الرسمي لإنتهاء الدوام',
      // 'في إستراحة',
      'سجل خروج',
      '	وقت العمل الفعلي',
      '	وقت الاستراحة',
      '	وقت العمل الإضافي',
      '	وقت العمل الرسمي',
      '	وقت الأستراحة الرسمي',
      'سبب تحضير المشرف'
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
    this.reports.GuardGuardsReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
      if (res) {
        this.allData = res.data
        for (let i = 0; i < this.allData.length; i++) {
          let LeaveTime = '';
          // let onBreak = '';
          let isComplete = '';
          let totalWorkTime = '';
          let totalMustWorkTime = '';
          let toTalBreakTime = '';
          let totalExtraTime = '';
          let toTalMustBreakTime = '';
          let attendanceNotes='';
          if (this.allData[i].leaveTime) {
            LeaveTime = this.allData[i].leaveTime;
          } else {
            LeaveTime = 'لم يتم تسجيل الخروج';
          }
          // if (this.report[i].isOnBreak) {
          //   onBreak = 'نعم';
          // } else {
          //   onBreak = 'لا';
          // }
          if (this.allData[i].isComplete) {
            isComplete = 'نعم';
          } else {
            isComplete = 'لا';
          }
          if (this.allData[i].totalBreakTime) {
            toTalBreakTime = this.allData[i].totalBreakTime;
          } else {
            toTalBreakTime = 'ليس في استراحة';
          }
          if (this.allData[i].totalWorkTime) {
            totalWorkTime = this.allData[i].totalWorkTime;
          } else {
            totalWorkTime = 'لا يوجد';
          }
          if (this.allData[i].totalExtraTime) {
            totalExtraTime = this.allData[i].totalExtraTime;
          } else {
            totalExtraTime = 'لم يتم العمل لوقت إضافي';
          }
          if (this.allData[i].totalMustBreakTime) {
            toTalMustBreakTime = this.allData[i].totalMustBreakTime;
          } else {
            toTalMustBreakTime = 'لا يوجد وقت استراحه';
          }
          if (this.allData[i].totalMustWorkTime) {
            totalMustWorkTime = this.allData[i].totalMustWorkTime;
          } else {
            totalMustWorkTime = 'لا يوجد';
          }
          if(this.allData[i].attendanceNotes && this.allData[i].attendanceNotes !== "null"){
            attendanceNotes = this.allData[i].attendanceNotes
          }else if(this.allData[i].attendanceNotes === "null"){
           attendanceNotes = 'لا يوجد'
          }else{
            attendanceNotes = 'لا يوجد'
          }
          let field = {
            GuardCode: this.allData[i].guardCode,
            Name:
              this.allData[i].name,
            phoneNumber:
              this.allData[i].phoneNumber,
            date: this.allData[i].date.split(' ')[0],
            siteLocationName: this.allData[i].siteLocationName,
            branchName:this.allData[i].branchName,
            attendanceFrom: this.allData[i].attendanceFrom,
            StartTime: this.allData[i].startTime,
            MustStart: this.allData[i].mustStart,
            LeaveTime: LeaveTime,
            MustEndIn: this.allData[i].mustEndIn,
            // breakComplete: onBreak,
            isComplete: isComplete,
            TotalWorkTime: totalWorkTime,
            TotalBreakTime: toTalBreakTime,
            TotalExtraTime: totalExtraTime,
            TotalMustWorkTime: totalMustWorkTime,
            TotalMustBreakTime: toTalMustBreakTime,
            attendanceNotes:attendanceNotes
          };

          this.dowenload.push(field);
        }
        // console.log(this.dowenload);

        this.downloadData(this.dowenload)
      }
    })
  }

  exportCSV() {
    this.getData();
    new ngxCsv(this.dowenload, 'My Report', this.options);
    this.dowenload = [];
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._hubConnection.stop();
  }

  // exportexcel(): void {
  //   let fileName = 'guards.xlsx';

  //   let element = document.getElementById('excel-table');
  //   const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  //   XLSX.writeFile(wb, fileName);
  // }
  downloadData(data: any[]) {
    // console.log(data);

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
    saveAs(blob, 'guardReport.xlsx');
  }

  search() {
    this.getAllReports()
  }

  calcTotalWorkTime(totalWorkTime: any) {
    let totalMilliseconds = 0;
    if (totalWorkTime) {
      const parts = totalWorkTime.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      totalMilliseconds += (hours * 3600000) + (minutes * 60000);
    }
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    this.totalWorkTime = this.convertToArabicNumbers(`${hours} ساعة, ${minutes} دقيقة`)
    return `${hours} ساعة, ${minutes} دقيقة`;
  }
  convertToArabicNumbers(text: any) {
    const englishNumbers = '0123456789';
    const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';
    // Create a mapping for English to Arabic numerals
    const numeralMap: any = {};
    for (let i = 0; i < englishNumbers.length; i++) {
      numeralMap[englishNumbers[i]] = arabicNumbers[i];
    }
    // Replace English numerals with Arabic numerals
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (numeralMap[char] !== undefined) {
        result += numeralMap[char];
      } else {
        result += char;
      }
    }
    return result;
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
    console.log(this.securityCompanyClientId);
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
    this.reports.GuardGuardsReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
      this.report = res.data
      this.total = res.totalCount;
      //this.totalWorkTime=res.extraData;
      this.calcTotalWorkTime(res.extraData)
    })
  }

  selectClient({ value }: any) {
    this.branchId = []
    this.locationId = []
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
}
