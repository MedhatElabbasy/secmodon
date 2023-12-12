import { Component, OnInit } from '@angular/core';
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
  pageSize = 10;
  total!: number;
  allData: AttendanceReport[] = []
  sizes = [...PAGINATION_SIZES];
  date = new FormControl();
  report!: AttendanceReport[];
  maxDate = new Date();
  myFile!: any;
  yesterday!: Date;
  searchKey = '';
  dowenload: any[] = [];
  private arrShowedInTableValue: any = [];
  totalWorkTime: any;
  clientSites: any = []
  securityCompanyClientId: string = ""

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
    this.initDatePiker();
    this.connectHub();
  }

  ngOnInit(): void {
    this.onDateChange();
    this.route.data.subscribe((res) => {
      this.report = res['report'];
      this.report.forEach((element) => {
        element.name = element.companySecurityGuard.securityGuard.firstName +
          " " +
          element.companySecurityGuard.securityGuard.middleName +
          " " +
          element.companySecurityGuard.securityGuard.lastName
      })
      this.allData = this.report
      this.updatearrShowedInTable(this.allData)
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
          `${this.auth.snapshot.userInfo?.id}-attendance`
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
      this.getAttendance(start, end, Loader.no);
    } else {
      this.getAttendanceByClient(start, end, Loader.no);
    }
  }

  getAttendance(startDate: string, endDate: string, loader: Loader) {
    let role = this.auth.snapshot.userIdentity?.role;

    let isMainBranch =
      this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch;
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.reports
        .getAttendanceReport(startDate, endDate, Loader.yes)
        .subscribe((res) => {
          this.report = res;
          this.allData = res
          this.search()
          this.report.forEach((element) => {
            element.name = element.companySecurityGuard.securityGuard.firstName +
              " " +
              element.companySecurityGuard.securityGuard.middleName +
              " " +
              element.companySecurityGuard.securityGuard.lastName
          })

          this.updatearrShowedInTable(this.report)
        });
    } else {
      this.reports
        .getAttendanceReportByBranch(startDate, endDate, Loader.yes)
        .subscribe((res) => {
          this.report = res;
          this.report.forEach((element) => {
            element.name = element.companySecurityGuard.securityGuard.firstName +
              " " +
              element.companySecurityGuard.securityGuard.middleName +
              " " +
              element.companySecurityGuard.securityGuard.lastName
          })

          this.updatearrShowedInTable(this.report)
        });
    }


  }

  getAttendanceByClient(startDate: string, endDate: string, loader: Loader) {
    this.reports
      .getAttendanceReportByClient(startDate, endDate, this.id, Loader.yes)
      .subscribe((res) => {
        this.report = res;
        this.report.forEach((element) => {
          element.name = element.companySecurityGuard.securityGuard.firstName +
            " " +
            element.companySecurityGuard.securityGuard.middleName +
            " " +
            element.companySecurityGuard.securityGuard.lastName
        })

        this.updatearrShowedInTable(this.report)

      });
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
        this.getAttendance(val.start, val.end, Loader.yes);
        if (this.clientFilter) {
          this.getClients();
        }
      });
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
  getDataFilter(filter: string) {
    this.filter = true;
    this.clientFilter = false;
    this.data = null;
    if (filter == 'client') {
      this.clientFilter = true;
    }
  }
  display({ value }: any) {
    console.log(value);
    this.securityCompanyClientId = value.id
    this._ClientSiteService.getAllBySecurityCompanyClientId(value.id).subscribe((res) => {
      console.log(res);
      this.clientSites = res
    })

    this.id = value.clientCompany.id;
    console.log(this.id);
    this.delete = false;
    this.getReports();

  }

  getAttendanceBySiteId({ value }: any) {
    console.log(value);
    console.log(this.date);
    let date: any;
    let start;
    let end;
    date = this.date.value;
    start = convertDateToString(date[0]);
    end = convertDateToString(date[1]);
    this.getAllAttandanceByLocationId(start, end, value.id, this.securityCompanyClientId)
  }

  deleteFilter() {
    this.filter = false;
    this.clientFilter = false;
    this.data = null;
    this.clientSites = []
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
      ' كود الحارس',
      'الاسم',
      '	رقم الجوال',
      'التاريخ',
      'تم التسجيل بواسطة',
      '	وقت الدخول',
      'الوقت الرسمي لبداية الدوام',
      '	وقت الخروج',
      '	الوقت الرسمي لإنتهاء الدوام',
      'في إستراحة',
      'سجل خروج',
      '	وقت العمل الفعلي',
      '	وقت الاستراحة',
      '	وقت العمل الإضافي',
      '	وقت العمل الرسمي',
      '	وقت الأستراحة الرسمي',
    ],
  };
  getData() {
    this.dowenload = []
    for (let i = 0; i < this.report.length; i++) {
      let LeaveTime = '';
      let onBreak = '';
      let isComplete = '';
      let totalWorkTime = '';
      let totalMustWorkTime = '';
      let toTalBreakTime = '';
      let totalExtraTime = '';
      let toTalMustBreakTime = '';
      if (this.report[i].endTime) {
        LeaveTime = this.report[i].endTime;
      } else {
        LeaveTime = 'لم يتم تسجيل الخروج';
      }
      if (this.report[i].isOnBreak) {
        onBreak = 'نعم';
      } else {
        onBreak = 'لا';
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
      // if (this.report[i].totalExtraTime) {
      totalExtraTime = this.report[i].totalExtraTime;
      // } else {
      //   totalExtraTime = 'لم يتم العمل لوقت إضافي';
      // }
      if (this.report[i].toTalMustBreakTime) {
        toTalMustBreakTime = this.report[i].toTalMustBreakTime;
      } else {
        toTalMustBreakTime = 'لا يوجد وقت استراحه';
      }
      if (this.report[i].totalMustWorkTime) {
        totalMustWorkTime = this.report[i].totalMustWorkTime;
      } else {
        totalMustWorkTime = 'لا يوجد';
      }
      let field = {
        GuardCode: this.report[i].companySecurityGuard.securityGuard.id,
        Name:
          this.report[i].companySecurityGuard.securityGuard.firstName +
          ' ' +
          this.report[i].companySecurityGuard.securityGuard.middleName +
          ' ' +
          this.report[i].companySecurityGuard.securityGuard.lastName,
        phoneNumber:
          this.report[i].companySecurityGuard?.securityGuard?.appUser[
          'userName'
          ],
        date: this.report[i].mustStartDateTime.split(' ')[0],
        attendanceFrom: this.report[i].attendanceFrom,
        StartTime: this.report[i].startTime,
        MustStart: this.report[i].mustStartDateTime,
        LeaveTime: LeaveTime,
        MustEndIn: this.report[i].mustEndDateTime,
        breakComplete: onBreak,
        isComplete: isComplete,
        TotalWorkTime: totalWorkTime,
        TotalBreakTime: toTalBreakTime,
        TotalExtraTime: totalExtraTime,
        TotalMustWorkTime: totalMustWorkTime,
        TotalMustBreakTime: toTalMustBreakTime
      };

      this.dowenload.push(field);
    }
    // console.log(this.dowenload);

    this.downloadData(this.dowenload)


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
    // console.log(this.allData);
    this.report = this.allData
    let myData: AttendanceReport[] = [];
    if (this.searchKey != '') {
      this.report.filter((ele: any) => {
        let name = ele.companySecurityGuard.securityGuard.firstName +
          ele.companySecurityGuard.securityGuard.middleName +
          ele.companySecurityGuard.securityGuard.lastName
        let phone = ele.companySecurityGuard.securityGuard?.appUser?.userName
        let id = ele.companySecurityGuard.securityGuard.id.toString()

        if (
          name.includes(this.searchKey.replace(/\s/g, '')) || phone.includes(this.searchKey.replace(/\s/g, '')) || id.includes(this.searchKey.replace(/\s/g, ''))
        ) {
          myData.push(ele);
        }
      });
      this.report = myData;
    } else {


      this.report = this.allData;
    }

    this.updatearrShowedInTable(this.report)

    // console.log(this.report);
  }



  private _arrShowedInTable: any = [];

  set arrShowedInTable(value: any) {
    if (this._arrShowedInTable !== value) {
      // Prop value has changed, perform actions here
    }
    this._arrShowedInTable = value;
    console.log(this._arrShowedInTable);
    console.log(this.calcTotalWorkTime(this._arrShowedInTable));


  }

  get arrShowedInTable(): any {
    return this._arrShowedInTable;
  }

  // You can also change the value of arrShowedInTable through a method, which will trigger the setter.
  updatearrShowedInTable(newValue: any) {
    this.arrShowedInTable = newValue;
  }

  calcTotalWorkTime(arrShowedInTable: any) {
    let totalMilliseconds = 0;

    for (const timeString of arrShowedInTable) {
      if (timeString.totalWorkTime) {
        const parts = timeString.totalWorkTime.split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        // const timeSeconds = parts[2].split('.');
        // const seconds = parseInt(timeSeconds[0], 10);
        // const fractions = parseInt(timeSeconds[1], 10);

        totalMilliseconds += (hours * 3600000) + (minutes * 60000);
      }

    }

    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    // const seconds = Math.floor((totalMilliseconds % 60000) / 1000);

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

  getAllAttandanceByLocationId(startDate: string, endDate: string, locationId: string, securityCompanyClientId: string) {
    this.reports.getAllAttandanceByLocationId(startDate, endDate, locationId, securityCompanyClientId).subscribe((res) => {
      console.log(res);
      this.report = res
      this.report.forEach((element) => {
        element.name = element.companySecurityGuard.securityGuard.firstName +
          " " +
          element.companySecurityGuard.securityGuard.middleName +
          " " +
          element.companySecurityGuard.securityGuard.lastName
      })

      this.updatearrShowedInTable(this.report)
    })
  }

}
