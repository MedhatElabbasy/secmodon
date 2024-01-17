import { Routing } from '../../core/routes/app-routes';

export enum ReportsRoutes {
  allReports = 'all-reports',
  accidents = 'accidents',
  visitors = 'visitors',
  attendance = 'attendance',
  guardAttendance = 'guard-attendance',
  superVisorAttendance = 'superVisor-attendance',
  incident = 'incident',
  facts = 'facts',
  formExclude='form-exclude',
  securityAuditModel='Security_audit_model',
  excludeNewRequest='exclude-new-request',
  employeeGeneralInfo='employee-general-info',
  transferReason='transfer-reason',
  response='response',
  accreditation='accreditation',
  viewExcludeRequest='view-exclude-request',
  ReceivingDeliveringVehicles='Receiving-delivering-vehicles',
  missions='missions',
  tours='tours'
}
// export enum Types {
//   guardAttendance = 'guard-attendance',
//   superVisorAttendance = 'superVisor-attendance',
// }
export const TypesList: {
  name: string;
  link: string;
}[] = [
  {
    name: 'guard',
    link: ReportsRoutes.guardAttendance,
  },
  {
    name: 'superVisor',
    link: ReportsRoutes.superVisorAttendance,
  },
];
export interface ReportListItem {
  name: string;
  description: string;
  link: string;
  image: string;
  roles?: string[];
}
