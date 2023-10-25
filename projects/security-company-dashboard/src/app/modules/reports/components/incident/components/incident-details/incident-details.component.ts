import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-incident-details',
  templateUrl: './incident-details.component.html',
  styleUrls: ['./incident-details.component.scss']
})
export class IncidentDetailsComponent implements OnInit {

  accedentId: string = ""
  constructor(private _ActivatedRoute: ActivatedRoute,
    private _ReportsService: ReportsService,
    private location: Location,
    private _Router: Router) {
    _ActivatedRoute.params.subscribe((res) => {
      console.log(res['id']);
      this.accedentId = res['id']
      this.getIncidentById(res['id'])

    })
  }

  ngOnInit(): void {
  }

  getIncidentById(incidentId: string) {
    this._ReportsService.getIncidentById(incidentId).subscribe((res) => {
      console.log(res);
      this._ReportsService.incidentDetails.next(res)
    })
  }

  back(): void {
    // this.location.back();
    this._Router.navigate(['/dashboard/reports/incident'])
  }

}
