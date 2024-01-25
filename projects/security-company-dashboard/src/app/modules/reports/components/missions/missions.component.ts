import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReportsService } from '../../services/reports.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { missionsReport } from '../../models/missions-report';
import { CanvasService } from 'projects/tools/src/lib/services/canvas.service';
import { LangService, PAGINATION_SIZES, Roles, convertDateToString, language } from 'projects/tools/src/public-api';
import { map } from 'rxjs';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';


@Component({
  selector: 'app-missions',
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.scss']
})
export class MissionsComponent implements OnInit {
  //allData!: VisitorsReport[];
  id!: number;
  delete!: boolean;
  data: any;
  filter: boolean = false;
  clientData!: any[];
  clientFilter: boolean = false;
  dateFilter: boolean = false;
  pageNumber = 1;
  pageSize = 5;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  date = new FormControl();
  visitorsReport!: any[];
  maxDate = new Date();
  searchKey = '';
  dowenload: any[] = [];
  companyId!: any;
  missions!: missionsReport[];
  allData: missionsReport[] = [];
  messionID = "missionDetails";
  missionDetails!: missionsReport;
  display: boolean = false;
  selectedGallery: any[] = [];
  clientSites: any = []
  securityCompanyClientId!: any;
  locationId!: any;
  branchFilter: boolean = false;
  branches: any = []
  start!: any;
  end!: any;
  branchId!: any;
  isMainBranch:boolean=false;
  constructor(private _reports: ReportsService, private localeService: BsLocaleService, public lang: LangService, public _CanvasService: CanvasService,
    private route: ActivatedRoute, private auth: AuthService) {
      let role = this.auth.snapshot.userIdentity?.role;
      let isMainBranch = this.auth.snapshot.userInfo?.securityCompanyBranch.isMainBranch
      if (role == Roles.SecuritCompany || isMainBranch) {
        this.isMainBranch = true;
        console.log(isMainBranch);
      } else {
        this.isMainBranch = false;
        console.log(isMainBranch);
      }
    this.initDatePiker()
  }

  ngOnInit(): void {
    this.onDateChange();
    this.companyId = this.auth.snapshot.userInfo?.id;
    console.log(this.companyId);
    this.getAllMissions()
  }

  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
    this.getAllMissions();
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
    this.getAllMissions();
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

  getClients() {
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    this._reports.GlobalApiFilterGetAllSecurityCompanyClientForUserSecurity(AppUserId).subscribe((res) => {
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
        this.pageNumber = 1
        this.pageSize = 5
        this.getAllMissions();
      });
    console.log(this.date);
  }
  //

  getAllSites() {
    let AppUserId = this.auth.snapshot.userInfo?.appUser.id
    this._reports.GlobalApiFilterGetAllSiteLocationByUserAndSCForUserSecurity(this.securityCompanyClientId, AppUserId).subscribe((res) => {
      this.clientSites = res
    })
  }

  getAllMissions() {
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
    console.log(model);

    this._reports.GuardTasksReportGetAllForSecurityCompanyFilter(model).subscribe((res: any) => {
      console.log(res);
      this.missions = res.data
      this.total = res.totalCount;
    })
  }


  // search() {
  //   // console.log(this.allData);
  //   this.missions = this.allData
  //   let myData: missionsReport[] = [];
  //   if (this.searchKey != '') {
  //     this.missions.filter((ele: any) => {
  //       let name = ele.taskName
  //       let description = ele.descrption

  //       if (
  //         name.includes(this.searchKey.replace(/\s/g, '')) || description.includes(this.searchKey.replace(/\s/g, ''))
  //       ) {
  //         myData.push(ele);
  //       }
  //     });
  //     this.missions = myData;
  //   } else {


  //     this.missions = this.allData;
  //   }
  // }

  search() {
    this.pageNumber = 1
    this.pageSize = 5
    this.getAllMissions()
  }

  details(mission: missionsReport, event: any) {
    event.stopImmediatePropagation();
    this.missionDetails = mission;
    this._CanvasService.open(this.messionID);
  }

  openGallery(gallery: any[], event: any) {
    this.selectedGallery = []
    event.stopImmediatePropagation();
    console.log(gallery);
    gallery.forEach((ele) => {
      console.log(ele.photo.fullLink);
      this.selectedGallery.push(ele.photo.fullLink)
    })
    this.display = true;
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
    this.getAllMissions();
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
    this.getAllMissions();
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


  getTaskseBySiteId({ value }: any) {
    this.locationId = [value.id]
    this.pageNumber = 1
    this.pageSize = 5
    this.getAllMissions();
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
    this.getAllMissions();
  }
}
