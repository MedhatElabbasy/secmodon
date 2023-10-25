import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SecurityCompany } from 'projects/tools/src/lib/models/security-company';
import { PAGINATION_SIZES } from 'projects/tools/src/public-api';
import {
  CanvasService,
  LangService,
  Lookup,
  Pagination,
} from 'projects/tools/src/public-api';
import { CompaniesService } from './companies.service';
declare var $: any;
@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit {
  companies!: Pagination<SecurityCompany>;
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = PAGINATION_SIZES;
  services!: Lookup[];
  searchKey = '';

  all: any[] = [];
  checked: number = 0;
  constructor(
    public canvas: CanvasService,
    private activeRoute: ActivatedRoute,
    private companiesService: CompaniesService,
    public lang: LangService
  ) {}

  ngOnInit() {
    this.getInitData();
  }

  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
    this.getCompanies();
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
    this.getCompanies();
  }

  getInitData() {
    this.activeRoute.data.subscribe((res) => {
      this.companies = res['companies'];
      this.getAllServices(this.companies.data);
    });
  }

  getCompanies() {
    this.companiesService
      .getApprovedCompanies(this.pageNumber, this.pageSize)
      .subscribe((res) => {
        if (!this.checked) {
          this.companies = res;
          this.total = res.totalCount;
        } else {
          res.data.forEach((ele) => {
            ele.securitCompanyAvailableServices.forEach((element) => {
              if (element.availableServices.id == this.checked) {
                this.all.push(ele);
              }
            });
          });
          res.data = this.all;
          this.companies = res;
        }
      });
  }

  getAllServices(companies: SecurityCompany[]) {
    let services: any[] = [];
    companies.forEach((e) => {
      let arr = e.securitCompanyAvailableServices.map(
        (a) => a.availableServices
      );
      services = services.concat(arr);
    });

    this.services = [...new Map(services.map((m) => [m.id, m])).values()];
  }

  getValue(event: any) {
    this.all = [];
    this.checked = event.target.value;
    this.getCompanies();
  }
  clear() {
    $('.non-checked').prop('checked', false);
    this.checked = 0;
    this.getCompanies();
  }
}
