import { PackagesService } from './../packages/services/packages.service';
import { Component, OnInit } from '@angular/core';
import { Roles } from 'projects/tools/src/public-api';
import { Routing } from '../core/routes/app-routes';
import { ReportListItem } from './routes/reports-routes.enum';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit {
  ReportsList: ReportListItem[] = [];
  constructor(private PackagesService: PackagesService) {
    this.PackagesService.myPackage.subscribe((res) => {

      if (this.PackagesService.myPackage.getValue().reports) {
        let numOfReports = this.PackagesService.myPackage.getValue().reports;
        console.log(numOfReports);

        if (numOfReports == 1) {
          this.ReportsList.push({
            name: 'reports.attendance',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.attendance}`,
            description: 'reports.attendance_report_description',
            image: 'assets/images/svg/attendance.svg',
            roles: [Roles.VirtualAdmin],
          }, {
            name: 'reports.incident',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.incident}`,
            description: 'reports.incident_report_description',
            image: 'assets/images/svg/accendent.svg',
            roles: [Roles.VirtualAdmin],
          }, {
            name: 'reports.facts',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.facts}`,
            description: 'reports.facts_report_description',
            image: 'assets/images/svg/facts.svg',
            roles: [Roles.VirtualAdmin],
          });
        } else if (numOfReports == 2) {
          this.ReportsList.push(
            {
              name: 'reports.attendance',
              link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.attendance}`,
              description: 'reports.attendance_report_description',
              image: 'assets/images/svg/attendance.svg',
              roles: [Roles.VirtualAdmin],
            },
            {
              name: 'reports.accident',
              link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.accidents}`,
              description: 'reports.accident_report_description',
              image: 'assets/images/svg/Incident.svg',
              roles: [Roles.VirtualAdmin],
            }, {
            name: 'reports.incident',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.incident}`,
            description: 'reports.incident_report_description',
            image: 'assets/images/svg/accendent.svg',
            roles: [Roles.VirtualAdmin],
          }, {
            name: 'reports.facts',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.facts}`,
            description: 'reports.facts_report_description',
            image: 'assets/images/svg/facts.svg',
            roles: [Roles.VirtualAdmin],
          }
          );
        } else {
          this.ReportsList.push(
            {
              name: 'reports.attendance',
              link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.attendance}`,
              description: 'reports.attendance_report_description',
              image: 'assets/images/svg/attendance.svg',
              roles: [Roles.VirtualAdmin],
            },
            {
              name: 'reports.accident',
              link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.accidents}`,
              description: 'reports.accident_report_description',
              image: 'assets/images/svg/Incident.svg',
              roles: [Roles.VirtualAdmin],
            },
            {
              name: 'reports.visitors',
              link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.visitors}`,
              description: 'reports.visitors_report_description',
              image: 'assets/images/svg/visitors.svg',
              roles: [Roles.SecurityCompanyUser, Roles.SecuritCompany],
            }, {
            name: 'reports.incident',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.incident}`,
            description: 'reports.incident_report_description',
            image: 'assets/images/svg/accendent.svg',
            roles: [Roles.VirtualAdmin],
          }, {
            name: 'reports.facts',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.facts}`,
            description: 'reports.facts_report_description',
            image: 'assets/images/svg/facts.svg',
            roles: [Roles.VirtualAdmin],
          }
          , {
            name: 'reports.Request_form_to_exclude',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.formExclude}`,
            description: 'reports.Request_form_to_exclude_description',
            image: 'assets/images/svgs/exclude.svg',
            roles: [Roles.VirtualAdmin],
          }
          , {
            name: 'reports.ReceivingDeliveringVehicles',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.ReceivingDeliveringVehicles}`,
            description: 'reports.descriptionReceivingDeliveringVehicles',
            image: 'assets/images/svgs/guard.svg',
            roles: [Roles.VirtualAdmin],
          },
           {
            name: 'reports.missions',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.missions}`,
            description: 'reports.missions_report_description',
            image: 'assets/images/svg/visitors.svg',
            roles: [Roles.SecurityCompanyUser, Roles.SecuritCompany],
          },
          {
            name: 'reports.tours',
            link: `/${Routing.dashboard}/${Routing.reports.module}/${Routing.reports.children.tours}`,
            description: 'reports.tours_report_description',
            image: 'assets/images/svg/visitors.svg',
            roles: [Roles.SecurityCompanyUser, Roles.SecuritCompany],
          }
          );

          console.log(this.ReportsList);

        }
      }
    });
  }

  ngOnInit(): void { }
}
