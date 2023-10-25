import { ReportsService } from './../../../../services/reports.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-general-details',
  templateUrl: './general-details.component.html',
  styleUrls: ['./general-details.component.scss']
})
export class GeneralDetailsComponent implements OnInit {

  constructor(private _ReportsService: ReportsService) { }
  incidentDetails: any;
  ngOnInit(): void {
    this._ReportsService.incidentDetails.subscribe((res) => {
      this.incidentDetails = res
      console.log(this.incidentDetails);
    })
    

  }

}
