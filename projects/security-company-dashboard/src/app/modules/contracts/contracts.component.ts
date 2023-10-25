import { Component, OnInit } from '@angular/core';
import { ContractsRoutesList, ContractsRoutes } from './routes/contracts-routes';
import { Router } from '@angular/router';
import { Routing } from '../core/routes/app-routes';
import { ContractsService } from './services/contracts.service';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.scss'],
})
export class ContractsComponent implements OnInit {
  list = [...ContractsRoutesList];
  display!: boolean
  constructor(private router: Router, private contractService: ContractsService) { }

  ngOnInit(): void {
    this.contractService.inAdditional.subscribe((res) => {
      this.display = res
    })
  }
  additionalData() {
    this.contractService.inAdditional.next(true)
    const link = `/${Routing.dashboard}/${Routing.contracts.module}/${Routing.contracts.children.additionalData}`;
    this.router.navigate([link])
  }
}
