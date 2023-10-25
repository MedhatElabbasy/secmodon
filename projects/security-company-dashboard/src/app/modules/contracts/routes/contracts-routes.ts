import { MenuItem } from '../../core/models/menu-item';

export enum ContractsRoutes {
  allContracts = 'all-contracts',
  active = 'active-contracts',
  suspended = 'suspended-contracts',
  rejected = 'rejected-contracts',
  additionalData = 'additional-data',
  aboutToExpire = 'aboutToExpire-contracts',
  expired = 'expired-contracts',
}

export const ContractsRoutesList: MenuItem[] = [
  {
    name: 'contracts.all_contracts',
    link: ContractsRoutes.allContracts,
    icon: null,
    image: null,
    children: null,
  },
  {
    name: 'contracts.accepted',
    link: ContractsRoutes.active,
    icon: null,
    image: null,
    children: null,
  },
  {
    name: 'contracts.suspended',
    link: ContractsRoutes.suspended,
    icon: null,
    image: null,
    children: null,
  },
  {
    name: 'contracts.rejected',
    link: ContractsRoutes.rejected,
    icon: null,
    image: null,
    children: null,
  },
  {
    name: 'contracts.aboutToExpire-contracts',
    link: ContractsRoutes.aboutToExpire,
    icon: null,
    image: null,
    children: null,
  },
  {
    name: 'contracts.expired-contracts',
    link: ContractsRoutes.expired,
    icon: null,
    image: null,
    children: null,
  }
];
