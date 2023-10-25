import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoveragesRoutingModule } from './coverages-routing.module';
import { AllCoveragesComponent } from './components/all-coverages/all-coverages.component';
import { CoreModule } from '../core/core.module';
import { CoveragesDetailsComponent } from './components/coverages-details/coverages-details.component';
import { CoverageReceivedOrdersComponent } from './components/coverage-received-orders/coverage-received-orders.component';
import { CoverageGuardsComponent } from './components/coverage-guards/coverage-guards.component';

@NgModule({
  declarations: [AllCoveragesComponent, CoveragesDetailsComponent, CoverageReceivedOrdersComponent, CoverageGuardsComponent],
  imports: [CommonModule, CoveragesRoutingModule, CoreModule],
})
export class CoveragesModule {}
