import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccidentsComponent } from './components/accidents/accidents.component';
import { AccidentsResolver } from './components/accidents/accidents.resolver';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { AttendanceResolver } from './components/attendance/attendance.resolver';
import { VisitorsReportsResolver } from './components/visitors/visitors-reports.resolver';
import { VisitorsComponent } from './components/visitors/visitors.component';
import { ReportsComponent } from './reports.component';
import { ReportsRoutes } from './routes/reports-routes.enum';
import { GuardComponent } from './components/attendance/guard/guard.component';
import { SuperVisorComponent } from './components/attendance/super-visor/super-visor.component';
import { SupreVisorResolver } from './components/attendance/super-visor/supre-visor.resolver';
import { IncidentComponent } from './components/incident/incident.component';
import { FactsComponent } from './components/facts/facts.component';
import { IncidentDetailsComponent } from './components/incident/components/incident-details/incident-details.component';
import { AllIncidentsComponent } from './components/incident/components/all-incidents/all-incidents.component';
import { AllIncidentsResolver } from './components/incident/components/all-incidents/all-incident.resolver';
import { GeneralNotesComponent } from './components/incident/components/general-notes/general-notes.component';
import { GeneralDetailsComponent } from './components/incident/components/general-details/general-details.component';
import { DriverDetailsComponent } from './components/incident/components/driver-details/driver-details.component';
import { PassengerDetailsComponent } from './components/incident/components/passenger-details/passenger-details.component';
import { AccendentDetailsComponent } from './components/incident/components/accendent-details/accendent-details.component';
import { AllFactsComponent } from './components/facts/components/all-facts/all-facts.component';
import { FactsDetailsComponent } from './components/facts/components/facts-details/facts-details.component';
import { PerpetratorDetailsComponent } from './components/facts/components/perpetrator-details/perpetrator-details.component';
import { FactAttachmentComponent } from './components/facts/components/fact-attachment/fact-attachment.component';
import { AllFactsResolver } from './components/facts/components/all-facts/all-facts.resolver';
import { GeneralFactsComponent } from './components/facts/components/general-facts/general-facts.component';

const routes: Routes = [
  { path: '', redirectTo: ReportsRoutes.allReports, pathMatch: 'full' },
  { path: ReportsRoutes.allReports, component: ReportsComponent },
  {
    path: ReportsRoutes.accidents,
    component: AccidentsComponent,
    resolve: {
      report: AccidentsResolver,
    },
  },
  {
    path: ReportsRoutes.attendance,
    component: AttendanceComponent,
    children: [
      {
        path: '',
        redirectTo: ReportsRoutes.guardAttendance,
        pathMatch: 'full',
      },
      {
        path: ReportsRoutes.guardAttendance,
        component: GuardComponent,
        resolve: {
          report: AttendanceResolver,
        },
      },
      {
        path: ReportsRoutes.superVisorAttendance,
        component: SuperVisorComponent,
        resolve: {
          report: SupreVisorResolver,
        },
      },

    ],
  },
  {
    path: ReportsRoutes.visitors,
    component: VisitorsComponent,
    resolve: {
      report: VisitorsReportsResolver,
    },
  },
  {
    path: ReportsRoutes.incident,
    component: IncidentComponent,
    children: [
      {
        path: '', component: AllIncidentsComponent,
        resolve: {
          report: AllIncidentsResolver,
        },
      },
      {
        path: ':id', component: IncidentDetailsComponent, children: [
          { path: '', redirectTo: 'general', pathMatch: 'full' },
          { path: 'general', component: GeneralDetailsComponent },
          { path: 'drivers', component: DriverDetailsComponent },
          { path: 'passengers', component: PassengerDetailsComponent },
          { path: 'accedent', component: AccendentDetailsComponent },
          { path: 'notes', component: GeneralNotesComponent },
        ]
      },

    ],


  },
  {
    path: ReportsRoutes.facts,
    component: FactsComponent,
    children: [
      {
        path: '', component: AllFactsComponent,
        resolve: {
          report: AllFactsResolver,
        },
      },
      {
        path: ':id', component: FactsDetailsComponent, children: [
          { path: '', redirectTo: 'general', pathMatch: 'full' },
          { path: 'general', component: GeneralFactsComponent },
          { path: 'perpetrator', component: PerpetratorDetailsComponent },
          { path: 'attachment', component: FactAttachmentComponent },
        ]
      },

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule { }
