import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-exclude-new-request',
  templateUrl: './exclude-new-request.component.html',
  styleUrls: ['./exclude-new-request.component.scss'],
})
export class ExcludeNewRequestComponent implements OnInit {
  activeLink: string =
    '/dashboard/reports/form-exclude/exclude-new-request/employee-general-info';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        console.log('NavigationEnd event:', this.router.url);
        this.activeLink = this.router.url;
      });
  }

  isActiveRoute(route: string): boolean {
    return this.activeLink.includes(route);
  }
}
