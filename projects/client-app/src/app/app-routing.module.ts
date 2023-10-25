import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  ForbiddenComponent,
  NotFoundComponent,
  UnauthorizedComponent,
  UnderConstructionComponent,
} from 'projects/tools/src/public-api';
import { InfractionDetailsComponent } from './modules/client/components/infraction-details/infraction-details.component';
import { MonitoringComplaintsComponent } from './modules/client/components/monitoring-complaints/monitoring-complaints.component';
import { FaqsComponent } from './modules/core/components/faqs/faqs.component';
import { JobDetailsComponent } from './modules/core/components/jobs/job-details/job-details.component';
import { JobsComponent } from './modules/core/components/jobs/jobs.component';
import { PostProposalComponent } from './modules/core/components/post-proposal/post-proposal.component';
import { PrivacyPolicyComponent } from './modules/core/components/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './modules/core/components/terms-conditions/terms-conditions.component';
import { SecurityCompaniesResolver } from './modules/core/resolvers/security-companies.resolver';
import { Routing } from './modules/core/routes/app-routes';
import { ClientCompaniesComponent } from './pages/client-companies/client-companies.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './pages/layout/layout.component';

const routes: Routes = [
  /* ------------------------------- main layout ------------------------------ */
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: Routing.home,
        pathMatch: 'full',
      },
      {
        path: Routing.home,
        component: HomeComponent,
        resolve: {
          companies: SecurityCompaniesResolver,
        },
      },
      {
        path: Routing.jobs,
        component: JobsComponent,
      },
      {
        path: Routing.jobDetails+'/:id',
        component: JobDetailsComponent,
      },
      {
        path: Routing.companies,
        component: CompaniesComponent,
        resolve: {
          companies: SecurityCompaniesResolver,
        },
      },
      {
        path: Routing.clientCompanies,
        component: ClientCompaniesComponent,
      },
      {
        path: Routing.profile.module,
        loadChildren: () =>
          import('./modules/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
      },
      {
        path: Routing.infractionDetails,
        component: InfractionDetailsComponent,
      },
      {
        path: Routing.MonitoringComplaints,
        component: MonitoringComplaintsComponent,
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
    path: Routing.unauthorized,
    component: UnauthorizedComponent,
  },
  {
    path: Routing.privacyPolicy,
    component: PrivacyPolicyComponent,
  },
  {
    path: Routing.termsConditions,
    component: TermsConditionsComponent,
  },
  {
    path: Routing.postProposal,
    component: PostProposalComponent,
  },
  {
    path: Routing.faqs,
    component: FaqsComponent,
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
  /*{
    path: '**',
    redirectTo: Routing.notFound,
  },*/
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
