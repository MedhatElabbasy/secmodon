import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-exclude-new-request',
  templateUrl: './exclude-new-request.component.html',
  styleUrls: ['./exclude-new-request.component.scss'],
})
export class ExcludeNewRequestComponent implements AfterViewInit {
  activeLink: string =
    '/dashboard/reports/form-exclude/exclude-new-request/employee-general-info';

  constructor(private _reports: ReportsService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    // this.router.events
    //   .pipe(filter((event) => event instanceof NavigationEnd))
    //   .subscribe(() => {
    //     console.log('NavigationEnd event:', this.router.url);
    //     this.activeLink = this.router.url;
    //   });


    // this._reports.screenRoute.subscribe((res) => {
    //   if (res) {
    //     console.log(res);

    //     this.activeLink = res
    //   }
    // })

    this.activeLink = this.router.url

  }
  ngAfterViewInit(): void {

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log(event.url);

        this.activeLink = event.url;
        // Perform actions in response to the URL change, if needed
        console.log('URL changed to:', this.activeLink);
      }
    });
  }
  isActiveRoute(route: string): boolean {
    return this.activeLink.includes(route);
  }
}
