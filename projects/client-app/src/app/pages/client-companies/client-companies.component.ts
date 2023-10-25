import { Component, OnInit } from '@angular/core';
import { ClientCompany, Pagination, PAGINATION_SIZES } from 'projects/tools/src/public-api';
import { ClientCompaniesService } from './../services/client-companies.service';

@Component({
  selector: 'app-client-companies',
  templateUrl: './client-companies.component.html',
  styleUrls: ['./client-companies.component.scss'],
})
export class ClientCompaniesComponent implements OnInit {
  clients!: Pagination<ClientCompany>;
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = PAGINATION_SIZES;

  searchKey = '';
  constructor(private _ClientCompaniesService: ClientCompaniesService) {}
  ngOnInit(): void {
    this.getAll();
  }
  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
    this.getAll();
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
    this.getAll();
  }
  getAll() {
    this._ClientCompaniesService
      .getALL(this.pageNumber, this.pageSize)
      .subscribe((res) => {
        this.clients = res;
      });
  }
}
