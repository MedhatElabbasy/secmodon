import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { arLocale, defineLocale, enGbLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { LangService, language } from 'projects/tools/src/public-api';
import { Routing } from '../../../core/routes/app-routes';

@Component({
  selector: 'app-form-exclude',
  templateUrl: './form-exclude.component.html',
  styleUrls: ['./form-exclude.component.scss']
})
export class FormExcludeComponent implements OnInit {
  id!: number;
  delete!: boolean;
  data: any;
  filter: boolean = false;
  clientData!: any[];
  clientFilter: boolean = false;
  maxDate = new Date();
  searchKey = '';
  visitorsReport!: any[];
  allData!:any;
  date = new FormControl(new Date());
  constructor(public lang: LangService,private localeService: BsLocaleService , private _router: Router) { }

  ngOnInit(): void {
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
    //this.getReports();
  }
  deleteFilter() {
    this.filter = false;
    this.clientFilter = false;
    this.data = null;
    this.delete = true;
   // this.getReports();
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

  download(){

  }
  openModal(){

  }

  createNewRequest(){
    this._router.navigate([`/dashboard/${Routing.reports.module}/${Routing.reports.children.formExclude}/${Routing.reports.children.excludeNewRequest}`])
  }

}
