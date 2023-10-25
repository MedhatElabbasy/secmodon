import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-driver-details',
  templateUrl: './driver-details.component.html',
  styleUrls: ['./driver-details.component.scss']
})
export class DriverDetailsComponent implements OnInit {

  constructor(private _ReportsService: ReportsService) { }
  incidentDetails: any;
  ngOnInit(): void {
    this._ReportsService.incidentDetails.subscribe((res) => {
      this.incidentDetails = res
      console.log(this.incidentDetails);
    })


  }

}
