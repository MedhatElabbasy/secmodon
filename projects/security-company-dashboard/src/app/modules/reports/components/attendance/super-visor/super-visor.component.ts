
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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { AttendanceReport } from '../../../models/attendance-report';
import { ReportsService } from '../../../services/reports.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { PackagesService } from '../../../../packages/services/packages.service';
import { ClientsService } from '../../../../client/services/clients.service';
import { Loader } from '../../../../core/enums/loader.enum';
@Component({
  selector: 'app-super-visor',
  templateUrl: './super-visor.component.html',
  styleUrls: ['./super-visor.component.scss'],
})
export class SuperVisorComponent implements OnInit {
  private _hubConnection!: HubConnection;

  id!: number;
  delete!: boolean;
  data: any;
  filter: boolean = false;
  clientFilter: boolean = false;
  pageNumber = 1;
  pageSize = 5;
  totalCount!: number;
  sizes = [...PAGINATION_SIZES];
  date = new FormControl();
  report: any[] = [];
  allData: any[] = []
  maxDate = new Date();
  myFile!: any;
  yesterday!: Date;
  searchKey = '';
  dowenload: any[] = [];
  totalWorkTime!:any;
  dateFilter: boolean = false;
  companyId!: any;
  securityCompanyClientId!: any;
  clientSites: any = []
  locationId!: any;
  start!:any;
  end!:any;
  constructor(
    private reports: ReportsService,
    private auth: AuthService,
    public lang: LangService,
    private route: ActivatedRoute,
    private localeService: BsLocaleService,
    private PackagesService: PackagesService,
    private client: ClientsService
  ) {
    this.yesterday = new Date();
    this.yesterday.setDate(this.yesterday.getDate() - 1);
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
    if (filter == 'client') {
      this.clientFilter = true;
     // this.getClients();
    } else {
      this.dateFilter = true;
      this.clientFilter = false;
    }
  }


  selectClient({ value }: any) {
    console.log(value);
    this.locationId = []
    this.securityCompanyClientId = [value.id]
    this.pageNumber = 1
    this.pageSize = 5
    this.getAllReports();
   // this.getAllSites();
  }
  // getAttendanceBySiteId({ value }: any) {
  //   this.locationId = [value.id]
  //   this.pageNumber = 1
  //   this.pageSize = 5
  //   this.getAllReports();

  // }
  // getAllSites() {
  //   let AppUserId = this.auth.snapshot.userInfo?.appUser.id
  //   this.reports.GlobalApiFilterGetAllSiteLocationByUserAndSCForUserSecurity(this.securityCompanyClientId, AppUserId).subscribe((res) => {
  //     this.clientSites = res
  //   })
  // }


  deleteFilter() {
    this.filter = false;
    this.clientFilter = false;
    this.data = null;
    this.clientSites = []
    this.delete = true;
    this.pageNumber = 1;
    this.pageSize = 5
    this.getAllReports();
  }

  getAllReports() {
    let date: any;
    // let start;
    // let end;
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    let model
    if (this.filter == false) {
      date = convertDateToString(new Date());
      this.start = date;
      this.end = date;
      this.securityCompanyClientId = []
      this.locationId = []
    } else {
      date = this.date.value;
      this.start = convertDateToString(date[0]);
      this.end = convertDateToString(date[1]);
      if( this.clientFilter){
        this.getClients();
      }
    }

    model = {
      "securityCompanyId": this.companyId,
      "appUserId": AppUserId,
      "securityCompanyClientList": this.securityCompanyClientId,
      "securityCompanyBranchList": [
      ],
      "clientSitesList": this.locationId,
      "startDate": this.start,
      "endDate": this.end,
      "page": this.pageNumber,
      "pageSize": this.pageSize,
      "searchKeyWord": this.searchKey
    }
    this.reports.SupervisorAttendanceReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
      this.report = res.data
      this.totalCount = res.totalCount;
    })
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
      'كود مشرف الأمن',
      'الاسم',
      // '	رقم الجوال',
      '	وقت الدخول',
      '	وقت الخروج',
      '	وقت العمل الرسمي',
    ],
  };
  getData() {
    this.dowenload = []
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    let model = {
       "securityCompanyId": this.companyId,
       "appUserId": AppUserId,
       "securityCompanyClientList": this.securityCompanyClientId,
       "securityCompanyBranchList": [
       ],
       "clientSitesList": this.locationId,
       "startDate": this.start,
       "endDate": this.end,
       "page": 1,
       "pageSize": this.totalCount,
       "searchKeyWord": this.searchKey
     }
     this.reports.SupervisorAttendanceReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
       if(res){
       this.allData = res.data
    for (let i = 0; i < this.allData.length; i++) {
      let totalWorkTime = '';
      let endDateTime = '';
      if (this.allData[i].totalWorkTime) {
        totalWorkTime = this.allData[i].totalWorkTime;
      } else {
        totalWorkTime = 'لا يوجد';
      }
      if (this.allData[i].endDateTime) {
        endDateTime = this.allData[i].endDateTime;
      } else {
        endDateTime = 'لا يوجد';
      }
      let field = {
        GuardCode:
          this.allData[i].siteSupervisorShift.companySecurityGuard.securityGuard
            .id,
        Name:
          this.allData[i].siteSupervisorShift.companySecurityGuard.securityGuard
            .firstName +
          ' ' +
          this.allData[i].siteSupervisorShift.companySecurityGuard.securityGuard
            .middleName +
          ' ' +
          this.allData[i].siteSupervisorShift.companySecurityGuard.securityGuard
            .lastName,
        // phoneNumber:
        //   this.report[i].companySecurityGuard?.securityGuard?.appUser[
        //     'userName'
        //   ],
        startDateTime: this.allData[i].startDateTime,
        endDateTime: endDateTime,
        TotalWorkTime: totalWorkTime,
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
  //   let fileName = 'superVisors.xlsx';
  //   let element = document.getElementById('excel-table');
  //   const ws: any = XLSX.utils.table_to_sheet(element);

  //   // Convert phone number column to string
  //   const range = XLSX.utils.decode_range(ws['!ref']);
  //   const phoneNumberColumnIndex = 2; // Assuming the phone number column is the third column (index 2)
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
    saveAs(blob, 'superVisorReport.xlsx');
  }

 search() {
    this.pageNumber = 1
    this.pageSize = 5
    this.getAllReports()
  }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._hubConnection.stop();
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

}
