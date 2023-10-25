import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';

import { CompleteProfileRoutingModule } from './complete-profile-routing.module';
import { CompleteComponent } from './components/complete/complete.component';
import { CompanyDetailsComponent } from './components/company-details/company-details.component';
import { CompanyRepresentativeComponent } from './components/company-representative/company-representative.component';
import { CommissionerRepresentativeComponent } from './components/commissioner-representative/commissioner-representative.component';

@NgModule({
  declarations: [CompleteComponent, CompanyDetailsComponent, CompanyRepresentativeComponent, CommissionerRepresentativeComponent],
  imports: [ CoreModule, CompleteProfileRoutingModule],
})
export class CompleteProfileModule {}
