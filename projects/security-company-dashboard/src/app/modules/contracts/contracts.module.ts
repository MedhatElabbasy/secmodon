import {      NgModule    } from '@angular/core';
import { CoreModule } from '../core/core.module';

import { ContractsRoutingModule } from './contracts-routing.module';
import { ContractsComponent } from './contracts.component';
import { RejectedContractsComponent } from './components/rejected-contracts/rejected-contracts.component';
import { ActiveContractsComponent } from './components/active-contracts/active-contracts.component';
import { SuspendedContractsComponent } from './components/suspended-contracts/suspended-contracts.component';
import { AllContractsComponent } from './components/all-contracts/all-contracts.component';
import { AdditionalDataComponent } from './components/additional-data/additional-data.component';
import { AbouttoexpireContractsComponent } from './components/abouttoexpire-contracts/abouttoexpire-contracts.component';
import { ExpiredContractsComponent } from './components/expired-contracts/expired-contracts.component';

@NgModule({
  declarations: [
    ContractsComponent,
    RejectedContractsComponent,
    ActiveContractsComponent,
    SuspendedContractsComponent,
    AllContractsComponent,
    AdditionalDataComponent,
    AbouttoexpireContractsComponent,
    ExpiredContractsComponent,
  ],

  imports: [CoreModule, ContractsRoutingModule],
})
export class ContractsModule {}
