import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from './../core/core.module';
import { PackagesRoutingModule } from './packages-routing.module';
import { PackageSubscribeComponent } from './components/package-subscribe/package-subscribe.component';
import { PaymentComponent } from './payment/payment.component';


@NgModule({
  declarations: [
    PackageSubscribeComponent,
    PaymentComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    PackagesRoutingModule
  ]
})
export class PackagesModule { }
