import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ForbiddenComponent,
  NotFoundComponent,
  UnauthorizedComponent,
  UnderConstructionComponent,
} from 'projects/tools/src/public-api';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { IdentityGuard } from './modules/auth/guards/identity.guard';
import { ApprovedComponent } from './modules/core/components/approved/approved.component';
import { DashboardLayoutComponent } from './modules/core/components/dashboard-layout/dashboard-layout.component';
import { DashboardResolver } from './modules/core/components/dashboard-layout/dashboard.resolver';
import { DashResolver } from './modules/core/components/dashboard/components/dash.resolver';
import { DashboardComponent } from './modules/core/components/dashboard/dashboard.component';
import { NotActiveComponent } from './modules/core/components/not-active/not-active.component';
import { PendingComponent } from './modules/core/components/pending/pending.component';
import { RejectedComponent } from './modules/core/components/rejected/rejected.component';
import { SecurityCompanyResolver } from './modules/core/resolvers/security-company.resolver';
import { Routing } from './modules/core/routes/app-routes';
import { PackagesGuard } from './modules/auth/guards/packages.guard';
import { UpdateDataGuard } from './modules/auth/guards/update-data.guard';
import { AddNewDataComponent } from './modules/core/components/add-new-data/add-new-data.component';
import { RedirectGuard } from './modules/auth/guards/redirect.guard';
const routes: Routes = [
  { path: '', redirectTo: Routing.auth.module, pathMatch: 'full' },
  {
    path: Routing.dashboard,
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard, IdentityGuard],
    resolve: {
      company: DashboardResolver,
    },
    children: [
      { path: '', redirectTo: Routing.statics, pathMatch: 'full' },
      {
        path: Routing.statics,
        component: DashboardComponent,
        canActivate: [PackagesGuard, UpdateDataGuard],
        // resolve: {
        //   report: DashResolver,
        // },
      },
      {
        path: Routing.jobs.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/jobs/jobs.module').then((m) => m.JobsModule),
      },
      {
        path: Routing.coverages.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/coverages/coverages.module').then(
            (m) => m.CoveragesModule
          ),
      },
      {
        path: Routing.agents.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/agent/agent.module').then((m) => m.AgentModule),
      },
      {
        path: Routing.clients.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/client/client.module').then((m) => m.ClientModule),
      },
      {
        path: Routing.completeProfile.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/complete-profile/complete-profile.module').then(
            (m) => m.CompleteProfileModule
          ),
      },
      {
        path: Routing.account.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/account-management/account-management.module').then(
            (m) => m.AccountManagementModule
          ),
      },
      {
        path: Routing.packages.module,
        canActivate: [UpdateDataGuard],
        loadChildren: () =>
          import('./modules/packages/packages.module').then(
            (m) => m.PackagesModule
          ),
      },
      {
        path: Routing.lookups.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/lookups/lookups.module').then(
            (m) => m.LookupsModule
          ),
      },
      {
        path: Routing.branches.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/branches/branches.module').then(
            (m) => m.BranchesModule
          ),
      },
      {
        path: Routing.contracts.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/contracts/contracts.module').then(
            (m) => m.ContractsModule
          ),
      },
      {
        path: Routing.settings.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/settings/settings.module').then(
            (m) => m.SettingsModule
          ),
      },
      {
        path: Routing.schedules.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/schedules/schedules.module').then(
            (m) => m.SchedulesModule
          ),
      },
      {
        path: Routing.reports.module,
        canActivate: [PackagesGuard, UpdateDataGuard],

        loadChildren: () =>
          import('./modules/reports/reports.module').then(
            (m) => m.ReportsModule
          ),
      },
      {
        path: Routing.guards.module,
        canActivate: [PackagesGuard, UpdateDataGuard],
        loadChildren: () =>
          import('./modules/guards/guards.module').then((m) => m.GuardsModule),
      },
    ],
  },
  {
    path: Routing.auth.module,
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  /* ------------------------------ static pages ------------------------------ */
  {
    path: Routing.pending,
    component: PendingComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: SecurityCompanyResolver,
    },
  },
  {
    path: Routing.rejected,
    component: RejectedComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: SecurityCompanyResolver,
    },
  },
  {
    path: Routing.notActive,
    component: NotActiveComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: SecurityCompanyResolver,
    },
  },
  {
    path: Routing.addNewData,
    component: AddNewDataComponent,
    canActivate: [AuthGuard],
  },
  {
    path: Routing.approved,
    component: ApprovedComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: SecurityCompanyResolver,
    },
  },
  {
    path: Routing.unauthorized,
    component: UnauthorizedComponent,
  },
  {
    path: Routing.underConstruction,
    component: UnderConstructionComponent,
  },
  {
    path: Routing.notFound,
    component: NotFoundComponent,
  },
  {
    path: Routing.forbidden,
    component: ForbiddenComponent,
  },

  /* -------------------------------- wild card ------------------------------- */
  {
    path: '**',
    redirectTo: Routing.notFound,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
