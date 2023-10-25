import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RejectedComponent } from '../core/components/rejected/rejected.component';
import { ActiveContractsComponent } from './components/active-contracts/active-contracts.component';
import { ActiveContractsResolver } from './components/active-contracts/active-contracts.resolver';
import { AdditionalDataComponent } from './components/additional-data/additional-data.component';
import { AdditionalDataResolver } from './components/additional-data/additional-data.resolver';
import { AllContractsComponent } from './components/all-contracts/all-contracts.component';
import { AllContractsResolver } from './components/all-contracts/all-contracts.resolver';
import { RejectedContractsComponent } from './components/rejected-contracts/rejected-contracts.component';
import { RejectedContractsResolver } from './components/rejected-contracts/rejected-contracts.resolver';
import { SuspendedContractsComponent } from './components/suspended-contracts/suspended-contracts.component';
import { SuspendedContractsResolver } from './components/suspended-contracts/suspended-contracts.resolver';
import { ContractsComponent } from './contracts.component';
import { ContractsRoutes } from './routes/contracts-routes';
import { AbouttoexpireContractsComponent } from './components/abouttoexpire-contracts/abouttoexpire-contracts.component';
import { AboutToExpireContractsResolver } from './components/abouttoexpire-contracts/about-to-expire-contracts.resolver';
import { ExpiredContractsComponent } from './components/expired-contracts/expired-contracts.component';
import { ExpiredContractsResolver } from './components/expired-contracts/expired-contracts.resolver';
const routes: Routes = [
  {
    path: '',
    component: ContractsComponent,
    children: [
      { path: '', redirectTo: ContractsRoutes.allContracts, pathMatch: 'full' },
      {
        path: ContractsRoutes.allContracts,
        component: AllContractsComponent,
        resolve: {
          contracts: AllContractsResolver,
        },
      },
      {
        path: ContractsRoutes.active,
        component: ActiveContractsComponent,
        resolve: {
          contracts: ActiveContractsResolver,
        },
      },
      {
        path: ContractsRoutes.suspended,
        component: SuspendedContractsComponent,
        resolve: {
          contracts: SuspendedContractsResolver,
        },
      },
      {
        path: ContractsRoutes.rejected,
        component: RejectedContractsComponent,
        resolve: {
          contracts: RejectedContractsResolver,
        },
      },
      {
        path: ContractsRoutes.aboutToExpire,
        component: AbouttoexpireContractsComponent,
        resolve: {
          contracts: AboutToExpireContractsResolver,
        },
      },
      {
        path: ContractsRoutes.expired,
        component: ExpiredContractsComponent,
        resolve: {
          contracts: ExpiredContractsResolver,
        },
      },
      {
        path: ContractsRoutes.additionalData,
        component: AdditionalDataComponent,
        resolve: {
          contracts: AdditionalDataResolver,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContractsRoutingModule { }
