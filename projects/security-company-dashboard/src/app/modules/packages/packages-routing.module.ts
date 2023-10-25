import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PackageSubscribeComponent } from './components/package-subscribe/package-subscribe.component';
import { packageRoutes } from './Routes/package-routes';
import { PackagesResolver } from './resolver/packages.resolver';
import { PaymentComponent } from './payment/payment.component';
const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: packageRoutes.packages, pathMatch: 'full' },
      {
        path: packageRoutes.packages,
        component: PackageSubscribeComponent,

        resolve: {
          package: PackagesResolver,
        },
      },
      {
        path: packageRoutes.payment,
        component: PaymentComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackagesRoutingModule {}
