import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TourReport } from '../../models/tours-reports';
import { ReportsService } from '../../services/reports.service';
import { CanvasService } from 'projects/tools/src/lib/services/canvas.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ModalService } from 'projects/tools/src/lib/services/modal.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { LangService, PAGINATION_SIZES, Roles, convertDateToString, language } from 'projects/tools/src/public-api';
import { map } from 'rxjs';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-tours',
  templateUrl: './tours.component.html',
  styleUrls: ['./tours.component.scss']
})
export class ToursComponent implements OnInit {
  id!: number;
  delete!: boolean;
  data: any;
  filter: boolean = false;
  clientData!: any[];
  clientFilter: boolean = false;
  dateFilter:boolean = false;
  pageNumber = 1;
  pageSize = 5;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  date = new FormControl(new Date());
  visitorsReport!: any[];
  maxDate = new Date();
  searchKey = '';
  dowenload: any[] = [];
  companyId!:any;
  tours!:TourReport[];
  allData: TourReport[] = [];
  tourID="tourDetails";
 tourDetails!:TourReport;
 checkPoints!:any;
 display: boolean = false;
 selectedGallery!: any[];
 clientSites: any = []
 securityCompanyClientId!:any;
 locationId!:any;
 branchFilter: boolean = false;
 branches: any = []
 start!: any;
 end!: any;
 branchId!: any;
 isMainBranch:boolean=false;
  constructor(private _reports:ReportsService,private localeService: BsLocaleService,  public lang: LangService,public _CanvasService:CanvasService,
    private route: ActivatedRoute ,private sanitizer: DomSanitizer, private auth: AuthService , public _model:ModalService) {
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
    }

  ngOnInit(): void {
    this.onDateChange();
   this.companyId = this.auth.snapshot.userInfo?.id;
    console.log(this.companyId);
    this.getAllTours()
  }

  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
    this.getAllTours()
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
    this.getAllTours()
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

  getClients(){
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    this._reports.GlobalApiFilterGetAllSecurityCompanyClientForUserSecurity(AppUserId).subscribe((res)=>{
      this.data = res;
    })
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
        this.pageNumber=1
        this.pageSize=5
        this.getAllTours();
      });
      console.log(this.date);
  }
  //

getAllSites(){
  let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    this._reports.GlobalApiFilterGetAllSiteLocationByUserAndSCForUserSecurity(this.securityCompanyClientId ,AppUserId ).subscribe((res)=>{
      this.clientSites = res
    })
}

  getAllTours(){
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
    model={
      "securityCompanyId": this.companyId ,
      "appUserId": AppUserId,
      "securityCompanyClientList": this.securityCompanyClientId,
      "securityCompanyBranchList": this.branchId,
      "clientSitesList":this.locationId,
      "startDate": this.start,
      "endDate": this.end,
      "page": this.pageNumber,
      "pageSize": this.pageSize,
      "searchKeyWord": this.searchKey
    }
    console.log(model);

  this._reports.GuardTourReportGetAllForSecurityCompanyFilter(model).subscribe((res:any)=>{
    console.log(res);
    this.tours=res.data
    this.total=res.totalCount;
  })}


  safeCheckPointId(id: string): string {
    return 'id_' + id.replace(/[^a-zA-Z0-9]/g, '_');
  }

  // search() {
  //   // console.log(this.allData);
  //   this.tours = this.allData
  //   let myData: TourReport[] = [];
  //   if (this.searchKey != '') {
  //     this.tours.filter((ele: any) => {
  //       let name = ele.tour.tourAddress
  //       let description = ele.tour.tourDescription

  //       if (
  //         name.includes(this.searchKey.replace(/\s/g, '')) || description.includes(this.searchKey.replace(/\s/g, ''))
  //       ) {
  //         myData.push(ele);
  //       }
  //     });
  //     this.tours = myData;
  //   } else {


  //     this.tours = this.allData;
  //   }
  // }

  search() {
    this.pageNumber = 1
    this.pageSize = 5
    this.getAllTours()
  }

  details(tour:TourReport,event:any){
    event.stopImmediatePropagation();
    this.tourDetails = tour;
    this.checkPoints=this.tourDetails.guardTourCheckPoints;
    this._model.open(this.tourID);
  }

  openGallery(gallery: any[]) {
    this.selectedGallery = [gallery];
    console.log(gallery);
    this._model.close(this.tourID);
    this.display = true;
  }

  deleteFilter(){
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
    this.getAllTours();
  }

  getBranches() {
    this._reports.GlobalApiFilter_GetAllSecurityBranch(this.companyId).subscribe((res) => {
      this.branches = res;
    });
  }
  getByBranchId({ value }: any) {
    this.branchId = [value.id]
    this.pageNumber = 1
    this.pageSize = 5
    this.getAllTours();
  }


  getDataFilter(filter:string){
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


  getTaskseBySiteId({ value }: any){
    this.locationId=[value.id]
    this.pageNumber=1
    this.pageSize=5
    this.getAllTours();
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
    this.getAllTours();
  }

}
