import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../../services/reports.service';

@Component({
  selector: 'app-passenger-details',
  templateUrl: './passenger-details.component.html',
  styleUrls: ['./passenger-details.component.scss']
})
export class PassengerDetailsComponent implements OnInit {

  constructor(private _ReportsService: ReportsService) { }
  incidentDetails: any;
  ngOnInit(): void {
    this._ReportsService.incidentDetails.subscribe((res) => {
      this.incidentDetails = res
      console.log(this.incidentDetails);
    })


  }

}
