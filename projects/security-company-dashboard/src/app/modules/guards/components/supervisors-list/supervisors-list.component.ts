import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CryptoService,
  LangService,
  PAGINATION_SIZES,
} from 'projects/tools/src/public-api';
import { CompanySecurityGuard } from '../../../client/models/site-details';
import { Routing } from '../../../core/routes/app-routes';
import { CompanyGuardsService } from '../../services/company-guards.service';

@Component({
  selector: 'app-supervisors-list',
  templateUrl: './supervisors-list.component.html',
  styleUrls: ['./supervisors-list.component.scss'],
})
export class SupervisorsListComponent implements OnInit {
  pageNumber = 1;
  pageSize = 10;
  total!: number;
  sizes = [...PAGINATION_SIZES];
  guards: CompanySecurityGuard[] = [];
  searchKey = '';

  constructor(
    public lang: LangService,
    private route: ActivatedRoute,
    private crypto: CryptoService,
    private router: Router,
    private companyGuards: CompanyGuardsService
  ) {}

  ngOnInit(): void {
    this.getData();
  }
  getData() {
    this.guards = this.route.snapshot.data['guards'];
    this.companyGuards.newSubervisor.subscribe((res) => {
      if (this.companyGuards.newSubervisor.getValue()) {
        this.guards.push(res);
        this.companyGuards.newSubervisor.next(null);
      }
    });
  }
  onPageSizeChange(number: any) {
    this.pageSize = +number.target.value;
  }

  onPageNumberChange(event: number) {
    this.pageNumber = event;
  }

  goToDetails(guard: CompanySecurityGuard) {
    const link = `/${Routing.dashboard}/${Routing.guards.module}/${Routing.guards.children.userDetails}`;
    const encodedGuard = this.crypto.encrypt(JSON.stringify(guard));
    this.router.navigate([link, encodedGuard]);
  }
}
