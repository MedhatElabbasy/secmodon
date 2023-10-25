import { Routing } from '../../core/routes/app-routes';

export enum ReportsRoutes {
  allReports = 'all-reports',
  accidents = 'accidents',
  visitors = 'visitors',
  attendance = 'attendance',
  guardAttendance = 'guard-attendance',
  superVisorAttendance = 'superVisor-attendance',
  incident = 'incident',
  facts = 'facts'
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
