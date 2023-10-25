import { data } from './../../../../../contracts/components/additional-data/model/data';
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
// @ts-ignore
import html2pdf from 'html2pdf.js';

import {
  convertDateToString,
  LangService,
  language,
  PAGINATION_SIZES,
  Roles,
} from 'projects/tools/src/public-api';
import { AuthService } from '../../../../../auth/services/auth.service';
import { Loader } from '../../../../../core/enums/loader.enum';
import { Incident } from '../../../../models/incident';
import { ReportsService } from '../../../../services/reports.service';
import { ClientsService } from '../../../../../client/services/clients.service';
import { ngxCsv } from 'ngx-csv';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-all-incidents',
  templateUrl: './all-incidents.component.html',
  styleUrls: ['./all-incidents.component.scss']
})
export class AllIncidentsComponent implements OnInit {

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
  report!: any;
  maxDate = new Date();
  yesterday!: Date;
  display: boolean = false;
  selectedGallery!: any[];
  searchKey = '';
  clientData!: any[];
  showModal = false;
  base64Imgs: any[] = []
  singleClickTimer: any;

  constructor(
    private reports: ReportsService,
    private auth: AuthService,
    public lang: LangService,
    private route: ActivatedRoute,
    private localeService: BsLocaleService,
    private client: ClientsService,
    private toastr: ToastrService
  ) {
    this.yesterday = new Date();
    this.yesterday.setDate(this.yesterday.getDate() - 1);
    this.initDatePiker();
    this.connectHub();
  }
  incidentDetails: any;

  ngOnInit(): void {
    this.onDateChange();
    this.route.data.subscribe((res) => {
      this.report = res['report'];
      console.log(this.report);

      this.report.forEach((element: any) => {
        element.guard = element?.companySecurityGuard?.securityGuard.firstName +
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

    console.log(this.report);

  }

  generatePDF() {
    console.log("Hi");
    const pdfOptions = {
      margin: 10,
      filename: 'my-pdf-document.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: 'mm',
        format: 'a4', // You can specify the page size here (e.g., 'letter', 'a4', 'legal', etc.)
        orientation: 'portrait', // 'portrait' for a vertical page or 'landscape' for a horizontal page
      },
    };
    const element = document.getElementById('dynamic-model-content');
    html2pdf()
      .from(element)
      .save('incident-file.pdf');
  }

  convertImgToBase64(imgs: number[]) {
    let myImgs: number[] = imgs.filter((img: any) => {
      console.log(img);

      if (img)
        return img
    })
    console.log(myImgs);

    this.reports.convertImgToBase64(myImgs).subscribe((res) => {
      console.log(res);
      this.base64Imgs = res
    })
  }

  openModal(incidentId: string) {

    this.getIncidentById(incidentId)
  }

  download(incidentId: string) {
    this.reports.getIncidentById(incidentId).subscribe((res) => {
      this.incidentDetails = res
      console.log(res);
      this.convertImgToBase64([res.firstIncidentLocationImage?.id, res.secondIncidentLocationImage?.id])
      this.showModal = true;
      setTimeout(() => {
        this.generatePDF()
        this.showModal = false;
      }, 0);

    })
  }

  checkClose(event: any) {
    if (event.target.classList.contains('modal-overlay')) {
      this.handleClick()
    }
  }

  oneClick(event: any) {
    if (event.target.classList.contains('modal-overlay')) {
      this.handleClick()
    }
  }

  handleClick() {
    if (!this.singleClickTimer) {
      // No single click event in progress
      this.singleClickTimer = setTimeout(() => {
        // This is a single click
        this.toastr.info('dbl click to close', '', {
          timeOut: 1000,
          closeButton: false
        });
        clearTimeout(this.singleClickTimer);
        this.singleClickTimer = null;
      }, 400); // Adjust the time (in milliseconds) for your desired double-click threshold
    } else {
      // A single click was detected earlier, so this is a double click
      clearTimeout(this.singleClickTimer);
      this.singleClickTimer = null;
      this.showModal = false;
    }
  }


  closeModal() {
    this.showModal = false;
  }

  getIncident(startDate: string, endDate: string, loader: Loader) {
    let role = this.auth.snapshot.userIdentity?.role;
    let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
    if (role == Roles.SecuritCompany || isMainBranch) {
      this.reports
        .getAllIncidentByCompany(this.pageNumber, this.pageSize, Loader.yes)
        .subscribe((res) => {
          this.report = res.data;
          console.log(this.report);

          this.report.forEach((element: any) => {
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
          this.report.forEach((element: any) => {
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
    this.report.forEach((element: any) => {
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
      // let incidentNumber = '';
      // let accidentDate = '';
      // let accidentTime = '';
      // let firstPassengerName = '';
      // let firstPassengerHealthStatus = '';
      // let secondPassengerName = '';
      // let secondPassengerHealthStatus = '';
      // if (this.report[i].incidentNumber) {
      //   incidentNumber = this.report[i].incidentNumber;
      // } else {
      //   incidentNumber = 'لا يوجد';
      // }
      // if (this.report[i].accidentDate) {
      //   accidentDate = this.report[i].accidentDate
      // } else {
      //   accidentDate = 'لا يوجد';
      // }
      // if (this.report[i].accidentTime) {
      //   accidentTime = this.report[i].accidentTime;
      // } else {
      //   accidentTime = 'لا يوجد';
      // }
      // if (this.report[i].firstPassengerName) {
      //   firstPassengerName = this.report[i].firstPassengerName;
      // } else {
      //   firstPassengerName = 'لا يوجد';
      // }
      // if (this.report[i].firstPassengerHealthStatus) {
      //   firstPassengerHealthStatus = this.report[i].firstPassengerHealthStatus;
      // } else {
      //   firstPassengerHealthStatus = 'لا يوجد';
      // }
      // if (this.report[i].secondPassengerName) {
      //   secondPassengerName = this.report[i].secondPassengerName;
      // } else {
      //   secondPassengerName = 'لا يوجد';
      // }
      // if (this.report[i].secondPassengerHealthStatus) {
      //   secondPassengerHealthStatus = this.report[i].secondPassengerHealthStatus;
      // } else {
      //   secondPassengerHealthStatus = 'ليس في استراحة';
      // }
      console.log(this.report[i].firstPassenger);


      let firstPassengerName = this.report[i].firstPassenger.reduce((obj: any, value: any, index: number) => {
        obj["passenger Number (" + (index + 1) + ") Name"] = value.passengersName;
        return obj;
      }, {});

      let firstPassengersHealthStatus = this.report[i].firstPassenger.reduce((obj: any, value: any, index: number) => {
        obj["passenger Number (" + (index + 1) + ") Health Status"] = value.passengersHealthStatus;
        return obj;
      }, {});

      let firstPassengersNationality = this.report[i].firstPassenger.reduce((obj: any, value: any, index: number) => {
        obj["passenger Number (" + (index + 1) + ") Nationality"] = value.passengersNationality;
        return obj;
      }, {});

      let firstPassengersLocationOfInjury = this.report[i].firstPassenger.reduce((obj: any, value: any, index: number) => {
        obj["passenger Number (" + (index + 1) + ") LocationOfInjury"] = value.passengersLocationOfInjury;
        return obj;
      }, {});

      let secondPassenger = this.report[i].secondPassenger.reduce((obj: any, value: any, index: number) => {
        obj["passenger" + index] = value;
        return obj;
      }, {});
      console.log(firstPassengerName);
      console.log(firstPassengersHealthStatus);
      console.log(firstPassengersNationality);
      console.log(firstPassengersLocationOfInjury);
      console.log("--------------------------------");

      let allObject: any = {}
      for (let index = 0; index < this.report[i].firstPassenger.length; index++) {
        allObject["passenger Number (" + (index + 1) + ") Name"] = firstPassengerName["passenger Number (" + (index + 1) + ") Name"]
        allObject["passenger Number (" + (index + 1) + ") Health Status"] = firstPassengersHealthStatus["passenger Number (" + (index + 1) + ") Health Status"]
        allObject["passenger Number (" + (index + 1) + ") Nationality"] = firstPassengersNationality["passenger Number (" + (index + 1) + ") Nationality"]
        allObject["passenger Number (" + (index + 1) + ") LocationOfInjury"] = firstPassengersLocationOfInjury["passenger Number (" + (index + 1) + ") LocationOfInjury"]

      }

      console.log(allObject);






      let field = {
        incidentNumber: this.report[i].incidentNumber,
        accidentDate: this.report[i].accidentDate,
        accidentTime: this.report[i].accidentTime,
        accidentCity: this.report[i].accidentCity,
        roadNumber: this.report[i].roadNumber,
        ...allObject
        // firstPassenger: this.report[i].firstPassenger,
        // actionToken: this.report[i].actionToken
        //   ? this.report[i].actionToken
        //   : 'لا يوجد',
        // securityGuard: this.report[i]?.companySecurityGuard?.securityGuard
        //   ?.firstName
        //   ? this.report[i]?.companySecurityGuard?.securityGuard?.firstName +
        //   ' ' +
        //   this.report[i]?.companySecurityGuard?.securityGuard?.lastName
        //   : 'لا يوجد',
        // siteSupervisorShift: this.report[i].siteSupervisorShift
        //   ?.companySecurityGuard?.securityGuard?.firstName
        //   ? this.report[i].siteSupervisorShift?.companySecurityGuard
        //     ?.securityGuard?.firstName +
        //   ' ' +
        //   this.report[i].siteSupervisorShift?.companySecurityGuard
        //     ?.securityGuard?.lastName
        //   : 'لا يوجد',
        // siteShift: (this.report[i].siteSupervisorShift?.clientShiftSchedule?.companyShift
        //   .shiftType) ?
        //   this.report[i].siteSupervisorShift?.clientShiftSchedule?.companyShift
        //     .shiftType?.name : 'لا يوجد',
        // GuardCode: this.report[i].companySecurityGuard.securityGuard.id,
        // Name:
        //   this.report[i].companySecurityGuard.securityGuard.firstName +
        //   ' ' +
        //   this.report[i].companySecurityGuard.securityGuard.lastName,
        // StartTime: this.report[i].startTime,
        // MustStart: this.report[i].mustStartDateTime,
        // MustEndIn: this.report[i].mustEndDateTime,
        // breakComplete: reason,
        // isComplete: isComplete,
        // TotalWorkTime: totalWorkTime,
        // TotalBreakTime: toTalBreakTime,
        // TotalExtraTime: totalExtraTime,
        // TotalMustWorkTime: totalMustWorkTime,
        // TotalMustBreakTime: this.report[i].toTalMustBreakTime,
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

  getIncidentById(incidentId: string) {
    this.reports.getIncidentById(incidentId).subscribe((res) => {
      this.incidentDetails = res
      this.convertImgToBase64([res.firstIncidentLocationImage?.id, res.secondIncidentLocationImage?.id])
      this.showModal = true;
    })
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._hubConnection.stop();
  }

}
