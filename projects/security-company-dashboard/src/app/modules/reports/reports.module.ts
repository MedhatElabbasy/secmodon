import { NgModule } from '@angular/core';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { AccidentsComponent } from './components/accidents/accidents.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { VisitorsComponent } from './components/visitors/visitors.component';
import { CoreModule } from '../core/core.module';
import { ReportCardComponent } from './components/report-card/report-card.component';
import { SuperVisorComponent } from './components/attendance/super-visor/super-visor.component';
import { GuardComponent } from './components/attendance/guard/guard.component';
import { IncidentComponent } from './components/incident/incident.component';
import { FactsComponent } from './components/facts/facts.component';
import { IncidentDetailsComponent } from './components/incident/components/incident-details/incident-details.component';
import { GeneralDetailsComponent } from './components/incident/components/general-details/general-details.component';
import { DriverDetailsComponent } from './components/incident/components/driver-details/driver-details.component';
import { PassengerDetailsComponent } from './components/incident/components/passenger-details/passenger-details.component';
import { GeneralNotesComponent } from './components/incident/components/general-notes/general-notes.component';
import { AllIncidentsComponent } from './components/incident/components/all-incidents/all-incidents.component';
import { AccendentDetailsComponent } from './components/incident/components/accendent-details/accendent-details.component';
import { AllFactsComponent } from './components/facts/components/all-facts/all-facts.component';
import { FactsDetailsComponent } from './components/facts/components/facts-details/facts-details.component';
import { FactsReportDetailsComponent } from './components/facts/components/facts-report-details/facts-report-details.component';
import { PerpetratorDetailsComponent } from './components/facts/components/perpetrator-details/perpetrator-details.component';
import { FactAttachmentComponent } from './components/facts/components/fact-attachment/fact-attachment.component';
import { GeneralFactsComponent } from './components/facts/components/general-facts/general-facts.component';
import { FormExcludeComponent } from './components/form-exclude/form-exclude.component';
import { SecurityAuditModelComponent } from './components/security-audit-model/security-audit-model.component';
import { ExcludeNewRequestComponent } from './components/form-exclude/components/exclude-new-request/exclude-new-request.component';
import { EmployeeGeneralInfoComponent } from './components/form-exclude/components/components/employee-general-info/employee-general-info.component';
import { TransferReasonComponent } from './components/form-exclude/components/components/transfer-reason/transfer-reason.component';
import { ResponseComponent } from './components/form-exclude/components/components/response/response.component';
import { AccreditationComponent } from './components/form-exclude/components/components/accreditation/accreditation.component';
import { ViewExcludeRequestComponent } from './components/form-exclude/components/components/view-exclude-request/view-exclude-request.component';


@NgModule({
  declarations: [
    ReportsComponent,
    AccidentsComponent,
    AttendanceComponent,
    VisitorsComponent,
    ReportCardComponent,
    SuperVisorComponent,
    GuardComponent,
    IncidentComponent,
    FactsComponent,
    IncidentDetailsComponent,
    GeneralDetailsComponent,
    DriverDetailsComponent,
    PassengerDetailsComponent,
    GeneralNotesComponent,
    AllIncidentsComponent,
    AccendentDetailsComponent,
    AllFactsComponent,
    FactsDetailsComponent,
    FactsReportDetailsComponent,
    PerpetratorDetailsComponent,
    FactAttachmentComponent,
    GeneralFactsComponent,
    FormExcludeComponent,
    SecurityAuditModelComponent,
    ExcludeNewRequestComponent,
    EmployeeGeneralInfoComponent,
    TransferReasonComponent,
    ResponseComponent,
    AccreditationComponent,
    ViewExcludeRequestComponent,
  ],

  imports: [CoreModule, ReportsRoutingModule],
})
export class ReportsModule { }
