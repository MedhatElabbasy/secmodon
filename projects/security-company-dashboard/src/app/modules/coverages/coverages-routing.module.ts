import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllCoveragesComponent } from './components/all-coverages/all-coverages.component';
import { coveragesRoutes } from './routes/converages-routes';
import { CoveragesDetailsComponent } from './components/coverages-details/coverages-details.component';
import { CoverageReceivedOrdersComponent } from './components/coverage-received-orders/coverage-received-orders.component';
import { CoverageGuardsComponent } from './components/coverage-guards/coverage-guards.component';
import { CovaragesResolver } from './covarages.resolver';

const routes: Routes = [
  { path: '', redirectTo: coveragesRoutes.allCoverages, pathMatch: 'full' },
  {
    path: coveragesRoutes.allCoverages,
    component: AllCoveragesComponent,
    resolve: {
      initData: CovaragesResolver,
    },
  },
  {
    path: coveragesRoutes.coverageDetails + '/:id',
    component: CoveragesDetailsComponent,

    children: [
      {
        path: '',
        redirectTo: coveragesRoutes.coverageReceivOrders,
        pathMatch: 'full',
      },
      {
        path: coveragesRoutes.coverageReceivOrders,
        component: CoverageReceivedOrdersComponent,
      },
      {
        path: coveragesRoutes.coverageGuards,
        component: CoverageGuardsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoveragesRoutingModule {}
