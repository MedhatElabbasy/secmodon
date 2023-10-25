import { LookupsRoutes } from 'projects/security-company-dashboard/src/app/modules/lookups/routes/lookup-routes';
import { AuthRoutes } from '../../auth/routes/auth-routes.enum';
import { ClientRoutes } from '../../client/routes/client-routes.enum';
import { ProfileRoutes } from '../../profile/routes/profile-routes.enum';

export const Routing = {
  auth: {
    module: 'auth',
    children: AuthRoutes,
  },
  profile: {
    module: 'profile',
    children: ProfileRoutes,
  },
  client: {
    module: 'client-control',
    children: ClientRoutes,
  },

  settings: 'settings',
  home: 'home',
  privacyPolicy: 'privacyPolicy',
  jobs: 'jobs',
  jobDetails: 'jobDetails',
  termsConditions: 'termsConditions',
  faqs: 'faqs',
  postProposal: 'postProposal',
  unauthorized: '401',
  notFound: '404',
  forbidden: '403',
  underConstruction: 'under-construction',
  companies: 'companies',
  clientCompanies: 'clientCompanies',
  MonitoringComplaints: 'lookups/monitoring-complaints',
  infractionDetails: 'infraction-Details',
};
